import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
import { getCustomersByDeliveryPerson, type CustomersByMember } from '../services/mockData';
import './CustomerDetails.css';

const CustomerDetails: React.FC = () => {
    const [groupedCustomers, setGroupedCustomers] = useState<CustomersByMember[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string>('ALL');

    useEffect(() => {
        const data = getCustomersByDeliveryPerson();
        setGroupedCustomers(data);
    }, []);

    const filteredData = selectedMemberId === 'ALL'
        ? groupedCustomers
        : groupedCustomers.filter(g => g.member.id === selectedMemberId);

    const totalCustomers = groupedCustomers.reduce((sum, g) => sum + g.customers.length, 0);

    return (
        <div className="page-container">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">Customer Statistics</h2>
                    <p className="text-muted">Total customers across all delivery teams</p>
                </div>
            </div>

            <div className="filter-section">
                <label className="filter-label">Filter by Delivery Person</label>
                <select
                    className="form-select"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                    <option value="ALL">All Delivery Persons ({totalCustomers} customers)</option>
                    {groupedCustomers.map(g => (
                        <option key={g.member.id} value={g.member.id}>
                            {g.member.name} ({g.customers.length} customers)
                        </option>
                    ))}
                </select>
            </div>

            <div className="customer-groups">
                {filteredData.map(group => (
                    <div key={group.member.id} className="customer-group">
                        <div className="group-header">
                            <h2 className="group-title">{group.member.name}</h2>
                            <span className="group-count">{group.customers.length} Customers</span>
                        </div>

                        <div className="customer-grid">
                            {group.customers.map(customer => (
                                <div key={customer.id} className="customer-card card">
                                    <div className="customer-info">
                                        <h3 className="customer-name">{customer.name}</h3>
                                        <p className="customer-address">{customer.address}</p>
                                        <p className="customer-mobile">📱 {customer.mobile}</p>
                                    </div>
                                    <div className="customer-products">
                                        <div className="products-label">Subscribed Products:</div>
                                        {customer.subscriptions.map((sub, idx) => (
                                            <span key={idx} className="badge-product">
                                                {sub.product}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredData.length === 0 && (
                    <div className="empty-state card">
                        <p>No customers found for the selected filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetails;
