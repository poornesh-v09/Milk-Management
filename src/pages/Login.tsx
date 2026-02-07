import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDeliveryMembers } from '../services/mockData';
import type { DeliveryMember } from '../types';
import './Login.css';

const Login: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState<'ADMIN' | 'DELIVERY' | null>(null);
    const [members, setMembers] = useState<DeliveryMember[]>([]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
        setMembers(getDeliveryMembers().filter(m => m.isActive));
    }, [isAuthenticated, navigate]);

    const handleAdminLogin = () => {
        login('Administrator', 'ADMIN', 'admin-1');
        navigate('/');
    };

    const handleDeliveryLogin = (member: DeliveryMember) => {
        login(member.name, 'DELIVERY', member.id);
        navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-card card">
                <div className="brand-section">
                    <h2 className="greeting-text">Welcome</h2>
                    <img src="/cow-icon.jpg" alt="Agaram Milk Cow" className="brand-icon-img" />
                    <h1 className="brand-name">AGARAM MILK</h1>
                    <p className="text-muted">Management Portal</p>
                </div>

                {!role ? (
                    <div className="role-selection">
                        <p className="mb-4 text-center font-medium">Select your role to login</p>
                        <button
                            className="btn-role-select"
                            onClick={() => setRole('ADMIN')}
                        >
                            Admin Login
                        </button>
                        <button
                            className="btn-role-select"
                            onClick={() => setRole('DELIVERY')}
                        >
                            Delivery Login
                        </button>
                    </div>
                ) : (
                    <div className="login-form">
                        <button className="btn-link mb-4 text-sm" onClick={() => setRole(null)}>
                            ← Back to Role Selection
                        </button>

                        {role === 'ADMIN' ? (
                            <div className="admin-login">
                                <h2 className="text-xl mb-4">Admin Access</h2>
                                <p className="text-sm text-muted mb-4">Simulated security check...</p>
                                <button className="btn btn-primary w-full" onClick={handleAdminLogin}>
                                    Enter Dashboard
                                </button>
                            </div>
                        ) : (
                            <div className="delivery-login">
                                <h2 className="text-xl mb-4">Select Member</h2>
                                <div className="member-list">
                                    {members.length === 0 ? (
                                        <p className="text-muted text-sm">No active delivery members found.</p>
                                    ) : (
                                        members.map(m => (
                                            <button
                                                key={m.id}
                                                className="member-btn"
                                                onClick={() => handleDeliveryLogin(m)}
                                            >
                                                <span className="fw-bold">{m.name}</span>
                                                <span className="text-xs text-muted">{m.route}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
