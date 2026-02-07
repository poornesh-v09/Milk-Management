import React, { useState, useEffect } from 'react';
import type { DeliveryMember, Customer } from '../types';
import { getDeliveryMembers } from '../services/mockData';
import './CustomerForm.css';

interface CustomerFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: Customer | null;
    mode?: 'add' | 'edit';
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onCancel, initialData, mode = 'add' }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        mobile: '',
        assignedTo: '',
        isActive: true,
        deliveryShift: ['Morning'] as string[]
    });

    const [subscriptions, setSubscriptions] = useState<import('../types').ProductSubscription[]>([
        { product: 'Milk', quantity: 0.5 }
    ]);

    const [members, setMembers] = useState<DeliveryMember[]>([]);

    useEffect(() => {
        // Load active delivery members
        const allMembers = getDeliveryMembers();
        setMembers(allMembers.filter(m => m.isActive));

        // Pre-populate form if editing
        if (initialData && mode === 'edit') {
            setFormData({
                name: initialData.name,
                address: initialData.address,
                mobile: initialData.mobile,
                assignedTo: initialData.assignedTo || '',
                isActive: initialData.isActive,
                deliveryShift: initialData.deliveryShift || ['Morning']
            });
            setSubscriptions(initialData.subscriptions);
        }
    }, [initialData, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubscriptionChange = (index: number, field: string, value: any) => {
        const newSubs = [...subscriptions];
        newSubs[index] = { ...newSubs[index], [field]: value };
        setSubscriptions(newSubs);
    };

    const addSubscription = () => {
        setSubscriptions([...subscriptions, { product: 'Curd' as any, quantity: 0.5 }]);
    };

    const removeSubscription = (index: number) => {
        if (subscriptions.length > 1) {
            const newSubs = subscriptions.filter((_, i) => i !== index);
            setSubscriptions(newSubs);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, subscriptions });
    };

    return (
        <form className="customer-form" onSubmit={handleSubmit}>
            <div className="form-group mb-3">
                <label>Customer Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                />
            </div>

            <div className="form-group mb-3">
                <label>Address</label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Full address"
                />
            </div>

            <div className="form-group mb-3">
                <label>Mobile Number</label>
                <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                />
            </div>

            <div className="form-group mb-4">
                <label>Assign Delivery Person</label>
                <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    required
                    className="form-control"
                >
                    <option value="">Select a Member...</option>
                    {members.length === 0 && <option disabled>No active members found</option>}
                    {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.route || 'No Route'})</option>
                    ))}
                </select>
            </div>

            <div className="form-group mb-4">
                <label>Delivery Shift</label>
                <div className="shift-selection">
                    <label className="shift-checkbox">
                        <input
                            type="checkbox"
                            checked={formData.deliveryShift.includes('Morning')}
                            onChange={(e) => {
                                const newShifts = e.target.checked
                                    ? [...formData.deliveryShift, 'Morning']
                                    : formData.deliveryShift.filter(s => s !== 'Morning');
                                setFormData(prev => ({ ...prev, deliveryShift: newShifts.length > 0 ? newShifts : ['Morning'] }));
                            }}
                        />
                        <span className="shift-label">Morning Delivery</span>
                    </label>
                    <label className="shift-checkbox">
                        <input
                            type="checkbox"
                            checked={formData.deliveryShift.includes('Evening')}
                            onChange={(e) => {
                                const newShifts = e.target.checked
                                    ? [...formData.deliveryShift, 'Evening']
                                    : formData.deliveryShift.filter(s => s !== 'Evening');
                                setFormData(prev => ({ ...prev, deliveryShift: newShifts.length > 0 ? newShifts : ['Morning'] }));
                            }}
                        />
                        <span className="shift-label">Evening Delivery</span>
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label>Subscriptions</label>
                {subscriptions.map((sub, index) => (
                    <div key={index} className="form-row subscription-row">
                        <div className="subscription-field">
                            <label className="field-label-sm">Product</label>
                            <select
                                value={sub.product}
                                onChange={(e) => handleSubscriptionChange(index, 'product', e.target.value)}
                            >
                                <option value="Milk">Milk</option>
                                <option value="Curd">Curd</option>
                                <option value="Paneer">Paneer</option>
                                <option value="ButterMilk">Butter Milk</option>
                            </select>
                        </div>
                        <div className="subscription-field">
                            <label className="field-label-sm">Quantity</label>
                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    value={sub.quantity}
                                    onChange={(e) => handleSubscriptionChange(index, 'quantity', Number(e.target.value))}
                                    min="0.25"
                                    max="5.0"
                                    step="0.25"
                                    placeholder="Qty"
                                />
                                <span className="unit-label-inline">
                                    {sub.product === 'Paneer' ? 'Kg' : 'L'}
                                </span>
                            </div>
                        </div>
                        {subscriptions.length > 1 && (
                            <button type="button" className="btn-icon" onClick={() => removeSubscription(index)}>×</button>
                        )}
                    </div>
                ))}
                <button type="button" className="btn-link text-sm" onClick={addSubscription}>+ Add Product</button>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {mode === 'edit' ? 'Update Customer' : 'Add Customer'}
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;
