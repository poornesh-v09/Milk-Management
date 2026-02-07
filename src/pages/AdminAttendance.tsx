import React, { useState, useEffect } from 'react';
import { getAdminAttendance } from '../services/attendanceService';
import { getDeliveryMembers } from '../services/mockData';
import type { AttendanceRecord, DeliveryMember } from '../types';
import './AdminAttendance.css';
import './DeliveryMembers.css'; // Import shared styles for badges

const AdminAttendance: React.FC = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [members, setMembers] = useState<DeliveryMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [filterType, setFilterType] = useState<'all' | 'date' | 'month' | 'year'>('all');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string>('');

    useEffect(() => {
        // Load delivery members for filter
        setMembers(getDeliveryMembers().filter(m => m.isActive));
        loadRecords();
    }, []);

    const loadRecords = async () => {
        setLoading(true);
        setError('');

        try {
            const filters: any = {};

            if (selectedDeliveryPerson) {
                filters.deliveryPersonId = selectedDeliveryPerson;
            }

            if (filterType === 'date' && selectedDate) {
                filters.date = selectedDate;
            } else if (filterType === 'month' && selectedMonth && selectedYear) {
                filters.month = selectedMonth;
                filters.year = selectedYear;
            } else if (filterType === 'year' && selectedYear) {
                filters.year = selectedYear;
            }

            const data = await getAdminAttendance(filters);
            setRecords(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load records');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        loadRecords();
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
        const delivered = record.entries.filter(e => e.status === 'Delivered').length;
        const absent = record.entries.filter(e => e.status === 'Absent').length;
        return { quantity, amount, delivered, absent };
    };

    return (
        <div className="admin-attendance-page">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">All Delivery Attendance</h2>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section card no-print">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Delivery Person</label>
                        <select
                            className="form-input"
                            value={selectedDeliveryPerson}
                            onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                        >
                            <option value="">All Delivery Persons</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Filter By</label>
                        <div className="radio-group" style={{ alignItems: 'center', height: '42px' }}>
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
                    </div>

                    {/* Dynamic Filters Inline */}
                    <div className="date-filters">
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
                                    <option value="">Month</option>
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
                                    <option value="">Year</option>
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
                                <option value="">Year</option>
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

            {/* Records Display */}
            <div className="records-container">
                {loading ? (
                    <div className="card loading-state">Loading records...</div>
                ) : records.length === 0 ? (
                    <div className="card empty-state">
                        <p>No attendance records found for the selected filters.</p>
                    </div>
                ) : (
                    records.map((record) => {
                        const totals = calculateTotal(record);
                        return (
                            <div key={record._id || record.id} className="attendance-record card">
                                <div className="record-header">
                                    <div className="header-left">
                                        <h3>{record.deliveryPersonName}</h3>
                                        <p className="date-label">Date: {record.date}</p>
                                    </div>
                                    <div className="header-right">
                                        <div className="stat-item">
                                            <span className="stat-label">Total Quantity</span>
                                            <span className="stat-value">{totals.quantity.toFixed(2)} L</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Total Amount</span>
                                            <span className="stat-value">₹{totals.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Delivered / Absent</span>
                                            <span className="stat-value">{totals.delivered} / {totals.absent}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th className="text-center" style={{ width: '60px' }}>S.No</th>
                                                <th>Customer</th>
                                                <th className="text-center">Shift</th>
                                                <th className="text-center">Fixed (L)</th>
                                                <th className="text-center">Delivered (L)</th>
                                                <th className="text-center">Status</th>
                                                <th className="text-center">Price/L</th>
                                                <th>Amount (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {record.entries.map((entry, index) => (
                                                <tr key={entry.customerId} className={entry.status === 'Absent' ? 'absent-row' : ''}>
                                                    <td className="text-center">{index + 1}</td>
                                                    <td className="customer-name">{entry.customerName}</td>
                                                    <td className="text-center">
                                                        <span className={`badge-shift ${entry.deliveryShift?.[0]?.toLowerCase() || 'morning'}`}>
                                                            {entry.deliveryShift?.[0] || 'Morning'}
                                                        </span>
                                                    </td>
                                                    <td className="font-mono text-center">{entry.fixedQuantity.toFixed(2)}</td>
                                                    <td className="delivered-qty text-center">{entry.deliveredQuantity.toFixed(2)}</td>
                                                    <td className="text-center">
                                                        <span className={`status-badge ${entry.status.toLowerCase()}`}>
                                                            {entry.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">₹{entry.pricePerLiter.toFixed(2)}</td>
                                                    <td className="amount" style={{ textAlign: 'left' }}>₹{(entry.deliveredQuantity * entry.pricePerLiter).toFixed(2)}</td>
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

export default React.memo(AdminAttendance);
