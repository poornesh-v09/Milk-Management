import React from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showBackButton = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/dashboard';

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="container header-content">
          {showBackButton && (
            <button className="global-back-btn" onClick={() => navigate(-1)} title="Go Back">
              ←
            </button>
          )}
          <Link to="/" className="brand-link">
            <img src="/cow-icon.jpg" alt="Agaram Milk" className="brand-icon-img" />
            <span className="brand-text">Agaram Milk</span>
          </Link>
          <nav className="main-nav">
            {currentUser?.role === 'DELIVERY' ? (
              <>
                <NavLink to="/attendance" className="nav-link">Attendance</NavLink>
                <NavLink to="/attendance/history" className="nav-link">History</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" className="nav-link">Dashboard</NavLink>

                {isAdmin && (
                  <>
                    <NavLink to="/customers" className="nav-link">Customers</NavLink>
                    <NavLink to="/product-details" className="nav-link">Product Details</NavLink>
                    <NavLink to="/reports" className="nav-link">Reports</NavLink>
                    <NavLink to="/members" className="nav-link">Team</NavLink>
                    <NavLink to="/admin/attendance" className="nav-link">Attendance</NavLink>
                  </>
                )}

                <NavLink to="/orders" className="nav-link">Orders</NavLink>
              </>
            )}
          </nav>

          <div className="user-profile">
            <div className="avatar">{currentUser?.name.charAt(0)}</div>
            <button className="btn-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="main-content container">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
