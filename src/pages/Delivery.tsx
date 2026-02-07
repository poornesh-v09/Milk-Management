import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Customer, DeliveryRecord, DeliveryItem, ProductPrice as Price } from '../types';
import {
    fetchCustomers,
    fetchDeliveryRecords,
    saveDeliveryRecordsBulk,
    fetchDeliveryMembers,
    fetchPrices
} from '../services/api';
import './Delivery.css';
import './DeliveryMembers.css'; // Import shared styles for badges

const QUANTITY_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5];

const Delivery: React.FC = () => {
    const { currentUser, isAdmin } = useAuth();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [deliveryMap, setDeliveryMap] = useState<Record<string, DeliveryRecord>>({});
    const [isSaved, setIsSaved] = useState(false);
    const [prices, setPrices] = useState<Price[]>([]);
    const [deliveryMembers, setDeliveryMembers] = useState<any[]>([]); // simplified type for filter
    const [loading, setLoading] = useState(true);

    // Filters (Admin only)
    const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('ALL');

    const loadData = async () => {
        setLoading(true);
        try {
            const [custData, memData, priceData] = await Promise.all([
                fetchCustomers(),
                fetchDeliveryMembers(),
                fetchPrices()
            ]);
            setCustomers(custData.filter(c => c.isActive));
            setDeliveryMembers(memData);
            setPrices(priceData);
        } catch (error) {
            console.error("Failed to load initial data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const loadDailyRecords = async () => {
            if (customers.length === 0) return;

            try {
                const existingRecords = await fetchDeliveryRecords(selectedDate);
                const map: Record<string, DeliveryRecord> = {};

                // Create a map of existing records
                existingRecords.forEach(r => map[r.customerId] = r);

                // Ensure every active customer has a record
                customers.forEach(c => {
                    if (!map[c.id]) {
                        // Create default record based on subscription
                        const items: DeliveryItem[] = c.subscriptions.map(sub => {
                            // Find price
                            // const priceObj = prices.find(p => p.product === sub.product);
                            // const price = priceObj ? priceObj.price : 0;

                            return {
                                product: sub.product,
                                quantity: sub.quantity,
                                status: 'Delivered',
                                // We store price snapshot here if needed, but for now just display
                            };
                        });

                        map[c.id] = {
                            id: `${selectedDate}-${c.id}`,
                            date: selectedDate,
                            customerId: c.id,
                            items: items
                        };
                    }
                });

                setDeliveryMap(map);
                setIsSaved(true);
            } catch (error) {
                console.error("Failed to load records", error);
            }
        };

        loadDailyRecords();
    }, [selectedDate, customers, prices]);

    // Computed: Filtered Customers for View
    const filteredCustomers = useMemo(() => {
        let filtered = customers;

        // Role-based filter: Delivery person only sees their own
        if (!isAdmin && currentUser?.role === 'DELIVERY') {
            filtered = filtered.filter(c => c.assignedTo === currentUser.id);
        }

        // Admin filter: Select specific member
        if (isAdmin && selectedMemberFilter !== 'ALL') {
            filtered = filtered.filter(c => c.assignedTo === selectedMemberFilter);
        }

        return filtered;
    }, [customers, isAdmin, currentUser, selectedMemberFilter]);

    // Computed: Totals
    const calculatePrice = (product: string, qty: number) => {
        const p = prices.find(pr => pr.product === product);
        return (p?.price || 0) * qty;
    };

    const dailyStats = useMemo(() => {
        let totalLiters = 0;
        let totalAmount = 0;

        filteredCustomers.forEach(c => {
            const record = deliveryMap[c.id];
            if (record) {
                record.items.forEach(item => {
                    if (item.status === 'Delivered') {
                        // For stats, we assume Milk is the primary volume unit
                        if (item.product === 'Milk') totalLiters += item.quantity;

                        // Calculate cost
                        const cost = calculatePrice(item.product, item.quantity);
                        totalAmount += cost;
                    }
                });
            }
        });

        return { totalLiters, totalAmount };
    }, [filteredCustomers, deliveryMap, prices]);


    const handleStatusToggle = (customerId: string, itemCode: string) => {
        setDeliveryMap(prev => {
            const record = { ...prev[customerId] };
            const newItems = record.items.map(item => {
                if (item.product === itemCode) {
                    return { ...item, status: item.status === 'Delivered' ? 'Absent' : 'Delivered' };
                }
                return item;
            });
            record.items = newItems as DeliveryItem[];
            return { ...prev, [customerId]: record };
        });
        setIsSaved(false);
    };

    const handleQuantityChange = (customerId: string, itemCode: string, newQty: number) => {
        setDeliveryMap(prev => {
            const record = { ...prev[customerId] };
            const newItems = record.items.map(item => {
                if (item.product === itemCode) {
                    return { ...item, quantity: newQty, status: 'Delivered' }; // Auto-set to delivered if qty changed
                }
                return item;
            });
            record.items = newItems as DeliveryItem[];
            return { ...prev, [customerId]: record };
        });
        setIsSaved(false);
    };

    const handleSave = async () => {
        const recordsToSave = Object.values(deliveryMap);
        try {
            await saveDeliveryRecordsBulk(recordsToSave);
            setIsSaved(true);
            alert("Daily attendance saved successfully!");
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save records.");
        }
    };

    if (loading && customers.length === 0) {
        return <div className="p-4">Loading delivery data...</div>;
    }

    return (
        <div className="delivery-page">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">Daily Entry</h2>
                    <p className="text-muted">Manage daily delivery and attendance.</p>
                </div>

                <div className="control-card card mt-6">
                    <div className="controls-row">
                        <input
                            type="date"
                            className="date-picker-large"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />

                        {isAdmin && (
                            <select
                                className="filter-select"
                                value={selectedMemberFilter}
                                onChange={(e) => setSelectedMemberFilter(e.target.value)}
                            >
                                <option value="ALL">All Delivery Staff</option>
                                {deliveryMembers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="daily-stats-row">
                        <div className="summary-stat">
                            <span className="label">Total Liters</span>
                            <span className="value">{dailyStats.totalLiters.toFixed(2)} L</span>
                        </div>
                        {isAdmin && (
                            <div className="summary-stat">
                                <span className="label">Est. Revenue</span>
                                <span className="value">₹{dailyStats.totalAmount.toFixed(0)}</span>
                            </div>
                        )}
                    </div>

                    <button
                        className={`btn btn-lg ${isSaved ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={handleSave}
                        disabled={isSaved}
                        style={{ minWidth: '200px', marginTop: '1rem' }}
                    >
                        {isSaved ? 'Saved' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            <div className="delivery-table-container card">
                <div className="table-responsive">
                    <table className="delivery-table">
                        <thead>
                            <tr>
                                <th className="col-customer">Customer</th>
                                <th className="col-shift">Shift</th>
                                <th className="col-product">Product</th>
                                <th className="col-status text-center">Status</th>
                                <th className="col-qty text-center">Quantity</th>
                                <th className="col-total text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-4 text-muted">No customers found for this selection.</td>
                                </tr>
                            )}
                            {filteredCustomers.map(customer => {
                                const record = deliveryMap[customer.id];
                                if (!record) return null;

                                return record.items.map((item, idx) => {
                                    const priceForQty = calculatePrice(item.product, item.quantity);
                                    const amount = item.status === 'Delivered' ? priceForQty : 0;
                                    const isFirstItem = idx === 0;

                                    return (
                                        <tr key={`${customer.id}-${item.product}`} className={isFirstItem ? 'row-group-start' : ''}>
                                            {isFirstItem && (
                                                <>
                                                    <td rowSpan={record.items.length} className="cell-customer">
                                                        <div className="font-bold">{customer.name}</div>
                                                        <div className="text-xs text-muted">{customer.address}</div>
                                                    </td>
                                                    <td rowSpan={record.items.length} className="cell-shift">
                                                        <span className={`badge-shift ${customer.deliveryShift?.[0]?.toLowerCase() || 'morning'}`}>
                                                            {customer.deliveryShift?.[0] || 'Morning'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            <td className="cell-product">
                                                <span className="badge-product">{item.product}</span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`status-chip ${item.status.toLowerCase()}`}
                                                    onClick={() => handleStatusToggle(customer.id, item.product)}
                                                >
                                                    {item.status}
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                                    <select
                                                        className="qty-select"
                                                        value={item.quantity}
                                                        disabled={item.status === 'Absent'}
                                                        onChange={(e) => handleQuantityChange(customer.id, item.product, parseFloat(e.target.value))}
                                                    >
                                                        {QUANTITY_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <span className="text-xs font-bold" style={{ color: 'var(--text-muted)', minWidth: '1.2rem' }}>
                                                        {item.product === 'Paneer' ? 'Kg' : 'L'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-right font-mono">
                                                {item.status === 'Delivered' ? `₹${amount}` : '-'}
                                            </td>
                                        </tr>
                                    );
                                });
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Delivery;
