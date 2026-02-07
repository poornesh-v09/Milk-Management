import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Customers = lazy(() => import('./pages/Customers'));
const Delivery = lazy(() => import('./pages/Delivery'));
const Reports = lazy(() => import('./pages/Reports'));
const DeliveryMembers = lazy(() => import('./pages/DeliveryMembers'));
const CustomerDetails = lazy(() => import('./pages/CustomerDetails'));
const TeamDetails = lazy(() => import('./pages/TeamDetails'));
const ProductAnalytics = lazy(() => import('./pages/ProductAnalytics'));
const RevenueDetails = lazy(() => import('./pages/RevenueDetails'));
const CustomerHistory = lazy(() => import('./pages/CustomerHistory'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const DeliveryAttendance = lazy(() => import('./pages/DeliveryAttendance'));
const AttendanceHistory = lazy(() => import('./pages/AttendanceHistory'));
const AdminAttendance = lazy(() => import('./pages/AdminAttendance'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="orders" element={<Delivery />} />

                {/* Delivery Person Attendance Routes */}
                <Route element={<ProtectedRoute allowedRoles={['DELIVERY']} />}>
                  <Route path="attendance" element={<DeliveryAttendance />} />
                  <Route path="attendance/history" element={<AttendanceHistory />} />
                </Route>

                {/* Admin Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="customers" element={<Customers />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="members" element={<DeliveryMembers />} />
                  <Route path="dashboard/customers" element={<CustomerDetails />} />
                  <Route path="dashboard/team" element={<TeamDetails />} />
                  <Route path="dashboard/products" element={<ProductAnalytics />} />
                  <Route path="dashboard/revenue" element={<RevenueDetails />} />
                  <Route path="product-details" element={<ProductDetails />} />
                  <Route path="customers/:id/history" element={<CustomerHistory />} />
                  <Route path="admin/attendance" element={<AdminAttendance />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
