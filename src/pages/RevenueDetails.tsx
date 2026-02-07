import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import { getRevenueBreakdown, type RevenueBreakdown } from '../services/mockData';
import HistorySelector from '../components/HistorySelector';
import './RevenueDetails.css';

const RevenueDetails: React.FC = () => {
    const [revenueData, setRevenueData] = useState<RevenueBreakdown | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        const data = getRevenueBreakdown(selectedMonth, selectedYear);
        setRevenueData(data);
    }, [selectedMonth, selectedYear]);

    if (!revenueData) {
        return <div className="page-container">Loading...</div>;
    }

    return (
        <div className="page-container">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">Revenue Breakdown</h2>
                    <p className="text-muted">Monthly revenue insights across customers and products</p>
                </div>
            </div>

            <HistorySelector
                mode="month"
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                label="View Revenue for Month"
            />

            <div className="total-revenue-card card">
                <div className="total-label">Total Monthly Revenue</div>
                <div className="total-value">₹{revenueData.totalRevenue.toLocaleString()}</div>
            </div>

            <div className="revenue-sections">
                {/* Customer-wise Revenue */}
                <div className="revenue-section">
                    <h2 className="section-title">Revenue by Customer</h2>
                    <div className="revenue-table card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData.byCustomer.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.name}</td>
                                        <td className="text-right">₹{item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {revenueData.byCustomer.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="empty-row">No revenue data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delivery Person-wise Revenue */}
                <div className="revenue-section">
                    <h2 className="section-title">Revenue by Delivery Person</h2>
                    <div className="revenue-table card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Delivery Person</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData.byMember.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.name}</td>
                                        <td className="text-right">₹{item.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Product-wise Revenue */}
                <div className="revenue-section">
                    <h2 className="section-title">Revenue by Product</h2>
                    <div className="revenue-table card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th className="text-right">Amount</th>
                                    <th className="text-right">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData.byProduct.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.product}</td>
                                        <td className="text-right">₹{item.amount.toLocaleString()}</td>
                                        <td className="text-right">
                                            {revenueData.totalRevenue > 0
                                                ? ((item.amount / revenueData.totalRevenue) * 100).toFixed(1)
                                                : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueDetails;
