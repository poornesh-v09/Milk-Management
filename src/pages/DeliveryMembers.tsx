import React, { useState, useEffect } from 'react';
import type { DeliveryMember } from '../types';
import { fetchDeliveryMembers, createDeliveryMember, updateDeliveryMember } from '../services/api';
import './DeliveryMembers.css';
import './Customers.css'; /* For shared table styles */

const DeliveryMembers: React.FC = () => {
    const [members, setMembers] = useState<DeliveryMember[]>([]);
    const [selectedShift, setSelectedShift] = useState<'All' | 'Morning' | 'Evening'>('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', mobile: '', route: '', shift: 'Morning' as 'Morning' | 'Evening' | 'Both' });
    const [loading, setLoading] = useState(true);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await fetchDeliveryMembers();
            setMembers(data);
        } catch (error) {
            console.error("Failed to load members", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMembers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const added = await createDeliveryMember({
                ...newItem,
                isActive: true
            });
            setMembers(prev => [...prev, added]);
            setIsFormOpen(false);
            setMembers(prev => [...prev, added]);
            setIsFormOpen(false);
            setNewItem({ name: '', mobile: '', route: '', shift: 'Morning' });
        } catch (error) {
            alert("Failed to add member");
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await updateDeliveryMember(id, { isActive: !currentStatus });
            setMembers(members.map(m => m.id === id ? { ...m, isActive: !currentStatus } : m));
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (loading && members.length === 0) {
        return <div className="p-4">Loading team...</div>;
    }

    return (
        <div className="members-page">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">Delivery Team</h2>
                    <p className="text-muted">Manage your delivery staff and routes.</p>

                    <div className="shift-selector-container mt-4">
                        <div className="shift-tabs">
                            <button className={`shift-tab ${selectedShift === 'All' ? 'active' : ''}`} onClick={() => setSelectedShift('All')}>All Teams</button>
                            <button className={`shift-tab ${selectedShift === 'Morning' ? 'active' : ''}`} onClick={() => setSelectedShift('Morning')}>☀️ Morning</button>
                            <button className={`shift-tab ${selectedShift === 'Evening' ? 'active' : ''}`} onClick={() => setSelectedShift('Evening')}>🌙 Evening</button>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg mt-4" onClick={() => setIsFormOpen(true)}>
                        + Add Member
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h2 className="title-lg" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add Team Member</h2>
                        <form onSubmit={handleSubmit} className="customer-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="e.g. Ramesh Kumar"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={newItem.mobile}
                                    onChange={e => setNewItem({ ...newItem, mobile: e.target.value })}
                                    pattern="[0-9]{10}"
                                    placeholder="10-digit number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Assigned Route/Area</label>
                                <input
                                    type="text"
                                    value={newItem.route}
                                    onChange={e => setNewItem({ ...newItem, route: e.target.value })}
                                    placeholder="e.g. North Extension"
                                />
                            </div>
                            <div className="form-group">
                                <label>Shift Assignment</label>
                                <div className="shift-options">
                                    <label className={`shift-option ${newItem.shift === 'Morning' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="shift"
                                            value="Morning"
                                            checked={newItem.shift === 'Morning'}
                                            onChange={() => setNewItem({ ...newItem, shift: 'Morning' })}
                                        />
                                        ☀️ Morning
                                    </label>
                                    <label className={`shift-option ${newItem.shift === 'Evening' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="shift"
                                            value="Evening"
                                            checked={newItem.shift === 'Evening'}
                                            onChange={() => setNewItem({ ...newItem, shift: 'Evening' })}
                                        />
                                        🌙 Evening
                                    </label>
                                    <label className={`shift-option ${newItem.shift === 'Both' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="shift"
                                            value="Both"
                                            checked={newItem.shift === 'Both'}
                                            onChange={() => setNewItem({ ...newItem, shift: 'Both' })}
                                        />
                                        🔄 Both
                                    </label>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card customer-table-container">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th className="text-center">Shift</th>
                                <th className="text-center">Mobile</th>
                                <th className="text-center">Route</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.filter(m => {
                                if (selectedShift === 'All') return true;
                                const shift = m.shift || 'Morning'; // Backwards compatibility
                                return shift === selectedShift || shift === 'Both';
                            }).map(member => (
                                <tr key={member.id}>
                                    <td className="fw-bold">{member.name}</td>
                                    <td className="text-center">
                                        <span className={`badge-shift ${member.shift ? member.shift.toLowerCase() : 'morning'}`}>
                                            {member.shift || 'Morning'}
                                        </span>
                                    </td>
                                    <td className="text-center">{member.mobile}</td>
                                    <td className="text-center">{member.route || <span className="text-muted">-</span>}</td>
                                    <td className="text-center">
                                        <span className={`status-indicator ${member.isActive ? 'active' : 'inactive'}`}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="actions-cell justify-center">
                                            <button
                                                className={`btn-action ${member.isActive ? 'remove' : 'activate'}`}
                                                onClick={() => toggleStatus(member.id, member.isActive)}
                                            >
                                                {member.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DeliveryMembers;
