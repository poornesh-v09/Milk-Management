import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAttendanceSheet, submitAttendance, checkAttendanceExists } from '../services/attendanceService';
import type { AttendanceEntry, AttendanceSheet } from '../types';
import './DeliveryAttendance.css';

const DeliveryAttendance: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [attendanceSheet, setAttendanceSheet] = useState<AttendanceSheet | null>(null);
    const [entries, setEntries] = useState<AttendanceEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [dateSelected, setDateSelected] = useState(false);
    const [selectedShift, setSelectedShift] = useState<'Morning' | 'Evening'>('Morning');

    // Generate quantity options (0, 0.25, 0.50, ..., up to 5.00)
    const quantityOptions: number[] = [];
    for (let i = 0; i <= 20; i++) {
        quantityOptions.push(i * 0.25);
    }

    // Get current date parts
    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear().toString();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const hour = today.getHours();
        setSelectedShift(hour < 12 ? 'Morning' : 'Evening');

        setSelectedYear(year);
        setSelectedMonth(month);
        setSelectedDate(day);
    }, []);

    // Load attendance sheet when date is confirmed
    const handleLoadSheet = async () => {
        if (!selectedDate || !selectedMonth || !selectedYear) {
            setError('Please select date, month, and year');
            return;
        }

        if (!currentUser?.id) {
            setError('User not authenticated');
            return;
        }

        const dateString = `${selectedYear}-${selectedMonth}-${selectedDate}`;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Check if attendance already exists
            const { exists, attendance } = await checkAttendanceExists(currentUser.id, dateString);

            if (exists && attendance) {
                setError(`Attendance already submitted for ${dateString}. You cannot edit it.`);
                setAttendanceSheet(null);
                setEntries([]);
                setDateSelected(false);
                return;
            }

            // Load the attendance sheet template
            const sheet = await getAttendanceSheet(currentUser.id, dateString);
            setAttendanceSheet(sheet);
            setEntries(sheet.entries);
            setDateSelected(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load attendance sheet');
            setAttendanceSheet(null);
            setEntries([]);
            setDateSelected(false);
        } finally {
            setLoading(false);
        }
    };

    // Update delivered quantity
    const handleQuantityChange = (index: number, quantity: number) => {
        const updatedEntries = [...entries];
        updatedEntries[index].deliveredQuantity = quantity;
        // If quantity is set, status should be Delivered
        if (quantity > 0) {
            updatedEntries[index].status = 'Delivered';
        }
        setEntries(updatedEntries);
    };

    // Toggle absent status
    const handleStatusToggle = (index: number) => {
        const updatedEntries = [...entries];
        const currentStatus = updatedEntries[index].status;

        if (currentStatus === 'Delivered') {
            updatedEntries[index].status = 'Absent';
            updatedEntries[index].deliveredQuantity = 0;
        } else {
            updatedEntries[index].status = 'Delivered';
            updatedEntries[index].deliveredQuantity = updatedEntries[index].fixedQuantity;
        }

        setEntries(updatedEntries);
    };

    // Save attendance
    const handleSaveAttendance = async () => {
        if (!attendanceSheet || !currentUser) {
            setError('Missing required data');
            return;
        }

        const dateString = `${selectedYear}-${selectedMonth}-${selectedDate}`;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await submitAttendance(
                dateString,
                currentUser.id,
                currentUser.name,
                entries
            );

            setSuccess('Attendance saved successfully!');
            // Clear the sheet after successful submission
            setTimeout(() => {
                setAttendanceSheet(null);
                setEntries([]);
                setDateSelected(false);
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save attendance');
        } finally {
            setLoading(false);
        }
    };

    // Calculate total quantity
    const totalQuantity = entries.reduce((sum, entry) => sum + entry.deliveredQuantity, 0);

    return (
        <div className="attendance-page">
            {/* Page Header with Back Button */}
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">Enter Daily Delivery</h2>
                </div>
            </div>

            {/* Date Selection Section */}
            <div className="date-selector-card">
                <h2>Select Date</h2>
                <div className="date-row">
                    <div className="date-field">
                        <label>Date</label>
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            disabled={dateSelected}
                        >
                            <option value="">-- Select Day --</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                <option key={day} value={String(day).padStart(2, '0')}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="date-field">
                        <label>Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            disabled={dateSelected}
                        >
                            <option value="">-- Select Month --</option>
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
                    </div>

                    <div className="date-field">
                        <label>Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            disabled={dateSelected}
                        >
                            <option value="">-- Select Year --</option>
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="btn-load"
                        onClick={handleLoadSheet}
                        disabled={loading || dateSelected || !selectedDate || !selectedMonth || !selectedYear}
                    >
                        {loading ? 'Loading...' : dateSelected ? 'Loaded' : 'Load Attendance'}
                    </button>
                </div>

                <p className="helper-text">Attendance will be saved for the selected date</p>

                {dateSelected && (
                    <div className="selected-date-box">
                        <strong>Selected Date:</strong> {selectedDate}/{selectedMonth}/{selectedYear}
                    </div>
                )}
            </div>

            {/* Shift Selector */}
            {dateSelected && entries.length > 0 && (
                <div className="shift-selector-container">
                    <div className="shift-tabs">
                        <button
                            className={`shift-tab ${selectedShift === 'Morning' ? 'active' : ''}`}
                            onClick={() => setSelectedShift('Morning')}
                        >
                            ☀️ Morning Shift
                        </button>
                        <button
                            className={`shift-tab ${selectedShift === 'Evening' ? 'active' : ''}`}
                            onClick={() => setSelectedShift('Evening')}
                        >
                            🌙 Evening Shift
                        </button>
                    </div>
                </div>
            )}


            {/* Messages */}
            {error && <div className="message-box error-message">{error}</div>}
            {success && <div className="message-box success-message">{success}</div>}

            {/* Attendance Table */}
            {dateSelected && attendanceSheet && entries.length > 0 && (
                <div className="attendance-table-card">
                    <div className="table-scroll">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Customer Name</th>
                                    <th className="text-center">Shift</th>
                                    <th className="text-center">Daily Milk (Fixed)</th>
                                    <th className="text-center">Today Milk Given</th>
                                    <th className="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.filter(entry => {
                                    // If no shift defined, assume Morning
                                    const shifts = entry.deliveryShift || ['Morning'];
                                    return shifts.includes(selectedShift);
                                }).map((entry, index) => (
                                    <tr key={entry.customerId} className={entry.status === 'Absent' ? 'row-absent' : ''}>
                                        <td className="col-number">{index + 1}</td>
                                        <td className="col-name">{entry.customerName}</td>
                                        <td className="text-center">
                                            <span className={`badge-shift ${entry.deliveryShift?.[0]?.toLowerCase() || 'morning'}`}>
                                                {entry.deliveryShift?.[0] || 'Morning'}
                                            </span>
                                        </td>
                                        <td className="col-fixed text-center">{entry.fixedQuantity.toFixed(2)} L</td>
                                        <td className="col-delivered text-center">
                                            <select
                                                className="qty-dropdown"
                                                value={entry.deliveredQuantity}
                                                onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                                                disabled={entry.status === 'Absent'}
                                            >
                                                {quantityOptions.map((qty) => (
                                                    <option key={qty} value={qty}>
                                                        {qty.toFixed(2)} L
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="col-status">
                                            <button
                                                className={`status-toggle ${entry.status === 'Absent' ? 'absent' : 'delivered'}`}
                                                onClick={() => handleStatusToggle(index)}
                                            >
                                                {entry.status === 'Absent' ? 'Absent (A)' : 'Delivered'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3}><strong>Total</strong></td>
                                    <td><strong>{totalQuantity.toFixed(2)} L</strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Action Buttons */}
                    <div className="button-row">
                        <button className="btn-secondary" onClick={() => navigate('/attendance/history')}>
                            View History
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleSaveAttendance}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </div>
            )}

            {dateSelected && entries.length === 0 && !loading && !error && (
                <div className="empty-box">
                    <p>No customers assigned to you.</p>
                </div>
            )}
        </div>
    );
};

export default DeliveryAttendance;
