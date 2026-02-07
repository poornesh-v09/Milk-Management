import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
    allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, currentUser } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If specific roles are required and user doesn't have permission
    if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
        // If user is a delivery person trying to access non-attendance pages, redirect to attendance
        if (currentUser.role === 'DELIVERY') {
            return <Navigate to="/attendance" replace />;
        }
        return <Navigate to="/" replace />; // Other unauthorized users go home
    }

    // Additional check: If user is DELIVERY role and they're on home page, redirect to attendance
    if (currentUser?.role === 'DELIVERY' && location.pathname === '/') {
        return <Navigate to="/attendance" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
