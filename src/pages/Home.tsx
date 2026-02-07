import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCustomers, fetchDeliveryRecords, fetchDashboardStats } from '../services/api';
import './Home.css';

interface DashboardStats {
    totalCustomers: number;
    activeCustomers: number;
    totalProducts: number;
    totalMembers: number;
    monthlyRevenue: number;
}

const Home: React.FC = () => {
    const { currentUser, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [shiftStats, setShiftStats] = useState({ morning: 0, evening: 0 });
    const [deliveryShiftStats, setDeliveryShiftStats] = useState({ morningPending: 0, eveningPending: 0 });
    const [deliveryStats, setDeliveryStats] = useState({ assigned: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSchema = async () => {
            setLoading(true);
            try {
                if (isAdmin) {
                    const data = await fetchDashboardStats();
                    setStats(data);

                    // Calculate Shift Stats for Admin
                    const allCustomers = await fetchCustomers();
                    const active = allCustomers.filter(c => c.isActive);
                    let morning = 0;
                    let evening = 0;
                    active.forEach(c => {
                        const shifts = c.deliveryShift || ['Morning'];
                        if (shifts.includes('Morning')) morning++;
                        if (shifts.includes('Evening')) evening++;
                    });
                    setShiftStats({ morning, evening });

                } else if (currentUser) {
                    // Delivery Person Logic
                    const allCustomers = await fetchCustomers();
                    const myCustomers = allCustomers.filter(c => c.assignedTo === currentUser.id && c.isActive);

                    const todayStr = new Date().toISOString().split('T')[0];
                    const todaysRecords = await fetchDeliveryRecords(todayStr);

                    // Calculate pending for my customers
                    let pendingCount = 0;
                    let mPending = 0;
                    let ePending = 0;

                    myCustomers.forEach(c => {
                        const hasRecord = todaysRecords.find(r => r.customerId === c.id);
                        if (!hasRecord) {
                            pendingCount++;
                            const shifts = c.deliveryShift || ['Morning'];
                            if (shifts.includes('Morning')) mPending++;
                            if (shifts.includes('Evening')) ePending++;
                        }
                    });

                    setDeliveryStats({
                        assigned: myCustomers.length,
                        pending: pendingCount
                    });
                    setDeliveryShiftStats({ morningPending: mPending, eveningPending: ePending });
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }

        loadSchema();
    }, [currentUser, isAdmin]);

    if (loading) {
        return <div className="p-4">Loading dashboard...</div>;
    }

    if (isAdmin) {
        if (!stats) return <div className="p-8 text-center text-muted">Stats unavailable. Is the server running?</div>;

        return (
            <div className="dashboard-content">
                <div className="page-header-section">
                    <div className="page-header">
                        <h2 className="subtitle">Welcome back, Admin</h2>
                        <p className="text-muted">Here's what's happening today.</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div
                        className="card stat-card clickable"
                        onClick={() => navigate('/dashboard/customers')}
                    >
                        <div className="stat-label">Total Customers</div>
                        <div className="stat-value">{stats.totalCustomers}</div>
                        <div className="stat-trend positive">
                            <span className="text-sm">{stats.activeCustomers} Active</span>
                            <div className="shift-breakdown text-xs text-muted mt-1">
                                ☀️ {shiftStats.morning} | 🌙 {shiftStats.evening}
                            </div>
                        </div>
                    </div>

                    <div
                        className="card stat-card clickable"
                        onClick={() => navigate('/dashboard/team')}
                    >
                        <div className="stat-label">Delivery Team</div>
                        <div className="stat-value">{stats.totalMembers}</div>
                    </div>

                    <div
                        className="card stat-card clickable"
                        onClick={() => navigate('/dashboard/products')}
                    >
                        <div className="stat-label">Products</div>
                        <div className="stat-value">{stats.totalProducts}</div>
                    </div>

                    <div
                        className="card stat-card clickable"
                        onClick={() => navigate('/dashboard/revenue')}
                    >
                        <div className="stat-label">Monthly Revenue</div>
                        <div className="stat-value">₹{stats.monthlyRevenue.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Delivery Person View
    return (
        <div className="dashboard-content">
            <div className="page-header-section">
                <div className="page-header">
                    <h2 className="subtitle">My Route</h2>
                    <p className="text-muted">Hello {currentUser?.name}, have a great delivery run!</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-label">Assigned Customers</div>
                    <div className="stat-value">{deliveryStats.assigned}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Pending Today</div>
                    <div className="stat-value">{deliveryStats.pending}</div>
                    <div className="stat-trend warning">
                        <div className="shift-breakdown text-sm mt-1">
                            ☀️ {deliveryShiftStats.morningPending} Morning
                        </div>
                        <div className="shift-breakdown text-sm">
                            🌙 {deliveryShiftStats.eveningPending} Evening
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Home);
