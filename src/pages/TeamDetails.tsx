import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeamStatistics, type TeamMemberStats } from '../services/mockData';
import HistorySelector from '../components/HistorySelector';
import './TeamDetails.css';

const TeamDetails: React.FC = () => {
    // const navigate = useNavigate();
    const [teamStats, setTeamStats] = useState<TeamMemberStats[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const stats = getTeamStatistics(selectedDate);
        setTeamStats(stats);
    }, [selectedDate]);

    return (
        <div className="page-container">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">Team Statistics</h2>
                    <p className="text-muted">Team members and their delivery statistics</p>
                </div>
            </div>

            <HistorySelector
                mode="date"
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                label="View Statistics for Date"
            />

            <div className="team-grid">
                {teamStats.map(stat => (
                    <div key={stat.member.id} className="team-card card">
                        <div className="team-header">
                            <h3 className="team-name">{stat.member.name}</h3>
                            <span className="team-route">{stat.member.route}</span>
                        </div>

                        <div className="team-contact">
                            <span className="contact-icon">📱</span>
                            <span>{stat.member.mobile}</span>
                        </div>

                        <div className="team-stats">
                            <div className="stat-row">
                                <span className="stat-label">Assigned Customers</span>
                                <span className="stat-value">{stat.assignedCustomers}</span>
                            </div>

                            <div className="stat-row">
                                <span className="stat-label">Daily Delivered</span>
                                <span className="stat-value success">{stat.dailyDelivered}</span>
                            </div>

                            <div className="stat-row">
                                <span className="stat-label">Daily Pending</span>
                                <span className={`stat-value ${stat.dailyPending > 0 ? 'warning' : 'success'}`}>
                                    {stat.dailyPending}
                                </span>
                            </div>

                            <div className="stat-row highlight">
                                <span className="stat-label">Monthly Total</span>
                                <span className="stat-value">{stat.monthlyDelivered}</span>
                            </div>
                        </div>

                        <div className="progress-section">
                            <div className="progress-label">
                                Daily Progress: {stat.dailyDelivered}/{stat.assignedCustomers}
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${stat.assignedCustomers > 0
                                            ? (stat.dailyDelivered / stat.assignedCustomers) * 100
                                            : 0}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamDetails;
