import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAttendanceHistory } from '../services/attendanceService';
import type { AttendanceRecord } from '../types';
import './AttendanceHistory.css';
import './DeliveryMembers.css'; // Import shared styles for badges

const AttendanceHistory: React.FC = () => {
    const { currentUser } = useAuth();
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [filterType, setFilterType] = useState<'all' | 'date' | 'month' | 'year'>('all');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [customerName, setCustomerName] = useState<string>('');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        if (!currentUser?.id) return;

        setLoading(true);
        setError('');

        try {
            const filters: any = {};

            if (filterType === 'date' && selectedDate) {
                filters.date = selectedDate;
            } else if (filterType === 'month' && selectedMonth && selectedYear) {
                filters.month = selectedMonth;
                filters.year = selectedYear;
            } else if (filterType === 'year' && selectedYear) {
                filters.year = selectedYear;
            }

            if (customerName) {
                filters.customerName = customerName;
            }

            const data = await getAttendanceHistory(currentUser.id, filters);
            setRecords(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        loadHistory();
    };

    const handlePrint = () => {
        window.print();
    };

    const calculateTotal = (record: AttendanceRecord) => {
        const quantity = record.entries.reduce((sum, entry) => sum + entry.deliveredQuantity, 0);
        const amount = record.entries.reduce(
            (sum, entry) => sum + entry.deliveredQuantity * entry.pricePerLiter,
            0
        );
        return { quantity, amount };
    };

    return (
        <div className="history-page">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">Delivery History</h2>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section card no-print">
                <div className="filter-controls">
                    <div className="filter-type-selector">
                        <label>
                            <input
                                type="radio"
                                name="filterType"
                                value="all"
                                checked={filterType === 'all'}
                                onChange={(e) => setFilterType(e.target.value as any)}
                            />
                            All Records
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="filterType"
                                value="date"
                                checked={filterType === 'date'}
                                onChange={(e) => setFilterType(e.target.value as any)}
                            />
                            By Date
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="filterType"
                                value="month"
                                checked={filterType === 'month'}
                                onChange={(e) => setFilterType(e.target.value as any)}
                            />
                            By Month
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="filterType"
                                value="year"
                                checked={filterType === 'year'}
                                onChange={(e) => setFilterType(e.target.value as any)}
                            />
                            By Year
                        </label>
                    </div>

                    {/* Name Filter - Always available */}
                    <div className="filter-row" style={{ marginTop: '1rem' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by Customer Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>

                    <div className="filter-inputs">
                        {filterType === 'date' && (
                            <input
                                type="date"
                                className="form-input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        )}

                        {filterType === 'month' && (
                            <>
                                <select
                                    className="form-input"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <option value="">Select Month</option>
                                    <option value="01">January</option>
                                    <option value="02">February</option>
                                    <option value="03">March</option>
                                    <option value="04">April</option>
                                    <option value="05">May</option>
                                    <option value="06">June</option>
                                    <option value="07">July</option>
                                    <option value="08">August</option>
                                    <option value="09">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                                <select
                                    className="form-input"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="">Select Year</option>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        {filterType === 'year' && (
                            <select
                                className="form-input"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option value="">Select Year</option>
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="filter-actions">
                        <button className="btn btn-primary" onClick={handleFilter} disabled={loading}>
                            {loading ? 'Loading...' : 'Apply Filter'}
                        </button>
                        <button className="btn btn-outline" onClick={handlePrint}>
                            Print
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* History Records */}
            <div className="history-records">
                {loading ? (
                    <div className="card loading-state">Loading...</div>
                ) : records.length === 0 ? (
                    <div className="card empty-state">
                        <p>No attendance records found.</p>
                    </div>
                ) : (
                    records.map((record) => {
                        const totals = calculateTotal(record);
                        return (
                            <div key={record._id || record.id} className="record-card card">
                                <div className="record-header">
                                    <h3>Date: {record.date}</h3>
                                    <div className="record-summary">
                                        <span className="summary-item">
                                            <strong>Total Quantity:</strong> {totals.quantity.toFixed(2)} L
                                        </span>
                                        <span className="summary-item">
                                            <strong>Total Amount:</strong> ₹{totals.amount.toFixed(2)}
                                        </span>
                                        <span className="summary-item">
                                            <strong>Customers:</strong> {record.entries.length}
                                        </span>
                                    </div>
                                </div>

                                <div className="table-wrapper">
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th className="text-center">S.No</th>
                                                <th>Customer</th>
                                                <th className="text-center">Shift</th>
                                                <th className="text-center">Fixed (L)</th>
                                                <th className="text-center">Delivered (L)</th>
                                                <th className="text-center">Status</th>
                                                <th className="text-center">Amount (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {record.entries.map((entry, index) => (
                                                <tr key={entry.customerId} className={entry.status === 'Absent' ? 'absent-row' : ''}>
                                                    <td className="text-center">{index + 1}</td>
                                                    <td>{entry.customerName}</td>
                                                    <td className="text-center">
                                                        <span className={`badge-shift ${entry.deliveryShift?.[0]?.toLowerCase() || 'morning'}`}>
                                                            {entry.deliveryShift?.[0] || 'Morning'}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">{entry.fixedQuantity.toFixed(2)}</td>
                                                    <td className="text-center">{entry.deliveredQuantity.toFixed(2)}</td>
                                                    <td className="text-center">
                                                        <span className={`status-badge ${entry.status.toLowerCase()}`}>
                                                            {entry.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">₹{(entry.deliveredQuantity * entry.pricePerLiter).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AttendanceHistory;
