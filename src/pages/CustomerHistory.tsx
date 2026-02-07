import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerHistory, calculateProductPrice } from '../services/mockData';
import type { DeliveryRecord, Customer } from '../types';
import './CustomerHistory.css';

const CustomerHistory: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    // const navigate = useNavigate();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [historyData, setHistoryData] = useState<{ records: DeliveryRecord[], customer: Customer | null }>({
        records: [],
        customer: null
    });

    useEffect(() => {
        if (id) {
            setHistoryData(getCustomerHistory(id, selectedMonth, selectedYear));
        }
    }, [id, selectedMonth, selectedYear]);

    const stats = useMemo(() => {
        let totalLiters = 0;
        let totalAmount = 0;
        let deliveredDays = new Set<string>();

        historyData.records.forEach(record => {
            record.items.forEach(item => {
                if (item.status === 'Delivered') {
                    deliveredDays.add(record.date);
                    if (item.product === 'Milk') {
                        totalLiters += item.quantity;
                    }

                    const price = item.priceCheck || 0;
                    totalAmount += calculateProductPrice(item.product, item.quantity, price);
                }
            });
        });

        return {
            totalDays: deliveredDays.size,
            totalLiters,
            totalAmount
        };
    }, [historyData]);

    if (!historyData.customer) {
        return <div className="p-8 text-center">Customer not found.</div>;
    }

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    return (
        <div className="history-page">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">{historyData.customer.name}</h2>
                    <p className="text-muted">{historyData.customer.address}</p>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    <select
                        className="filter-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        style={{ width: 'auto' }}
                    >
                        {months.map((m, i) => (
                            <option key={m} value={i}>{m}</option>
                        ))}
                    </select>
                    <select
                        className="filter-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        style={{ width: 'auto' }}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <section className="summary-grid mb-8">
                <div className="card summary-card">
                    <div className="summary-label">Days Delivered</div>
                    <div className="summary-value">{stats.totalDays}</div>
                </div>
                <div className="card summary-card">
                    <div className="summary-label">Total Milk (L)</div>
                    <div className="summary-value">{stats.totalLiters.toFixed(2)} L</div>
                </div>
                <div className="card summary-card primary">
                    <div className="summary-label">Monthly Bill</div>
                    <div className="summary-value">₹{stats.totalAmount.toFixed(2)}</div>
                </div>
            </section>

            <div className="card history-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Quantity</th>
                            <th className="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyData.records.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-muted">
                                    No delivery records found for this month.
                                </td>
                            </tr>
                        ) : (
                            historyData.records.map(record => (
                                record.items.map((item, idx) => {
                                    const price = item.priceCheck || 0;
                                    const amount = item.status === 'Delivered'
                                        ? calculateProductPrice(item.product, item.quantity, price)
                                        : 0;

                                    return (
                                        <tr key={`${record.date}-${item.product}`}>
                                            <td>{idx === 0 ? new Date(record.date).toLocaleDateString('en-GB') : ''}</td>
                                            <td>
                                                <span className={`badge-product`}>{item.product}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`status-chip ${item.status.toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {item.status === 'Delivered' ? `${item.quantity}` : '-'}
                                            </td>
                                            <td className="text-right font-mono">
                                                {item.status === 'Delivered' ? `₹${amount.toFixed(2)}` : '₹0.00'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerHistory;
