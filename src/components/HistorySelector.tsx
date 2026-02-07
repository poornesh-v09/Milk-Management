import React from 'react';
import './HistorySelector.css';

interface HistorySelectorProps {
    mode: 'date' | 'month';
    selectedMonth?: number;
    selectedYear?: number;
    selectedDate?: string;
    onMonthChange?: (month: number) => void;
    onYearChange?: (year: number) => void;
    onDateChange?: (date: string) => void;
    label?: string;
}

const HistorySelector: React.FC<HistorySelectorProps> = ({
    mode,
    selectedMonth,
    selectedYear,
    selectedDate,
    onMonthChange,
    onYearChange,
    onDateChange,
    label = 'Select Period'
}) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (mode === 'month') {
        return (
            <div className="history-selector">
                <label className="history-label">{label}</label>
                <div className="history-controls">
                    <select
                        className="form-select"
                        value={selectedMonth ?? new Date().getMonth()}
                        onChange={(e) => onMonthChange?.(Number(e.target.value))}
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                    <select
                        className="form-select"
                        value={selectedYear ?? currentYear}
                        onChange={(e) => onYearChange?.(Number(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }

    // Date mode
    return (
        <div className="history-selector">
            <label className="history-label">{label}</label>
            <div className="history-controls">
                <input
                    type="date"
                    className="form-input"
                    value={selectedDate ?? new Date().toISOString().split('T')[0]}
                    onChange={(e) => onDateChange?.(e.target.value)}
                />
            </div>
        </div>
    );
};

export default HistorySelector;
