import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Customer } from '../types';
import { fetchCustomers, createCustomer, updateCustomer } from '../services/api';
import CustomerForm from '../components/CustomerForm';
import './Customers.css';

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [selectedShift, setSelectedShift] = useState<'Morning' | 'Evening'>('Morning');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await fetchCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to load customers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    // Filter customers when shift selection or customer data changes
    useEffect(() => {
        const filtered = customers.filter(customer => {
            const shifts = customer.deliveryShift || ['Morning'];
            return shifts.includes(selectedShift);
        });
        setFilteredCustomers(filtered);
    }, [customers, selectedShift]);

    const handleAddCustomer = async (data: any) => {
        try {
            // Frontend might not provide ID, backend will/should generate or we generate temporary
            // API expects Omit<Customer, 'id'>, but our form might return partial
            // Let's assume API handles ID generation or we pass valid data
            const newCustomer = await createCustomer({
                ...data,
                joinDate: new Date().toISOString().split('T')[0],
                isActive: true
            });
            setCustomers(prev => [...prev, newCustomer]);
            setIsFormOpen(false);
            setEditingCustomer(null);
        } catch (error) {
            console.error("Failed to add customer", error);
            alert("Failed to add customer");
        }
    };

    const handleUpdateCustomer = async (data: any) => {
        if (editingCustomer) {
            try {
                const updated = await updateCustomer(editingCustomer.id, data);
                setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
                setIsFormOpen(false);
                setEditingCustomer(null);
            } catch (error) {
                console.error("Failed to update customer", error);
                alert("Failed to update customer");
            }
        }
    };

    const handleEditClick = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleAddClick = () => {
        setEditingCustomer(null);
        setFormMode('add');
        setIsFormOpen(true);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingCustomer(null);
    };

    if (loading && customers.length === 0) {
        return <div className="p-4">Loading customers...</div>;
    }

    return (
        <div className="customers-page">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">Manage Customer Deliveries</h2>

                    {/* Shift Selector */}
                    <div className="shift-selector-container">
                        <div className="shift-selector">
                            <button
                                className={`shift-btn ${selectedShift === 'Morning' ? 'active' : ''}`}
                                onClick={() => setSelectedShift('Morning')}
                            >
                                🌅 Morning Shift
                            </button>
                            <button
                                className={`shift-btn ${selectedShift === 'Evening' ? 'active' : ''}`}
                                onClick={() => setSelectedShift('Evening')}
                            >
                                🌆 Evening Shift
                            </button>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" onClick={handleAddClick}>
                        + Add New Customer
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h2 className="title-lg mb-4" style={{ fontSize: '1.5rem' }}>
                            {formMode === 'edit' ? 'Edit Customer' : 'Add Customer'}
                        </h2>
                        <CustomerForm
                            onSubmit={formMode === 'edit' ? handleUpdateCustomer : handleAddCustomer}
                            onCancel={handleCancel}
                            initialData={editingCustomer}
                            mode={formMode}
                        />
                    </div>
                </div>
            )}

            <div className="card customer-table-container">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="col-name">Name</th>
                                <th className="col-address">Address</th>
                                <th className="col-mobile">Mobile</th>
                                <th className="col-subs">Subscriptions</th>
                                <th className="col-shift">Shift</th>
                                <th className="col-status">Status</th>
                                <th className="col-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id} className={customer.isActive ? '' : 'row-inactive'}>
                                        <td>
                                            <div className="customer-name">{customer.name}</div>
                                        </td>
                                        <td className="customer-address">{customer.address}</td>
                                        <td className="customer-mobile">{customer.mobile}</td>
                                        <td>
                                            <div className="subscriptions-container">
                                                {customer.subscriptions.map((sub, idx) => (
                                                    <div key={idx} className="subscription-tag">
                                                        <span className="sub-quantity">{sub.quantity}</span>
                                                        <span className="sub-unit">{sub.product === 'Paneer' ? 'Kg' : 'L'}</span>
                                                        <span className="sub-product">{sub.product}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="shift-badges">
                                                {(customer.deliveryShift || ['Morning']).map((shift, idx) => (
                                                    <span key={idx} className="shift-badge">
                                                        {shift}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${customer.isActive ? 'status-active' : 'status-inactive'}`}>
                                                {customer.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button className="btn-action edit" onClick={() => handleEditClick(customer)}>
                                                    Edit
                                                </button>
                                                <button className="btn-action history" onClick={() => navigate(`/customers/${customer.id}/history`)}>
                                                    History
                                                </button>
                                                {customer.isActive && (
                                                    <button
                                                        className="btn-action remove"
                                                        onClick={async () => {
                                                            if (window.confirm(`Are you sure you want to remove ${customer.name}? This will deactivate them for future entries but preserve historical data.`)) {
                                                                try {
                                                                    await updateCustomer(customer.id, { isActive: false });
                                                                    loadCustomers();
                                                                } catch (e) {
                                                                    alert("Failed to deactivate customer");
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                                {!customer.isActive && (
                                                    <button
                                                        className="btn-action activate"
                                                        onClick={async () => {
                                                            try {
                                                                await updateCustomer(customer.id, { isActive: true });
                                                                loadCustomers();
                                                            } catch (e) {
                                                                alert("Failed to activate customer");
                                                            }
                                                        }}
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">
                                        No customers found for {selectedShift} shift.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {customers.length === 0 && (
                    <div className="empty-state">
                        No customers found. Add your first customer!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customers;
