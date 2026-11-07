import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import RoomsPage from './pages/public/RoomsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Guest Pages
import BookingFlowPage from './pages/guest/BookingFlowPage';
import MyBookingsPage from './pages/guest/MyBookingsPage';
import ProfilePage from './pages/guest/ProfilePage';

// Staff Pages
import StaffDashboardPage from './pages/staff/StaffDashboardPage';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRoomsPage from './pages/admin/AdminRoomsPage';
import AdminRoomTypesPage from './pages/admin/AdminRoomTypesPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

// Layout wrapper for public and guest pages (includes Navbar and Footer)
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes with Navbar & Footer */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/rooms"
            element={
              <PublicLayout>
                <RoomsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            }
          />
          <Route
            path="/register"
            element={
              <PublicLayout>
                <RegisterPage />
              </PublicLayout>
            }
          />

          {/* Protected Guest Routes */}
          <Route
            path="/book"
            element={
              <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
                <PublicLayout>
                  <BookingFlowPage />
                </PublicLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
                <PublicLayout>
                  <MyBookingsPage />
                </PublicLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
                <PublicLayout>
                  <ProfilePage />
                </PublicLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Staff Route */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <PublicLayout>
                  <StaffDashboardPage />
                </PublicLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes (with dedicated AdminLayout Sidebar) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="room-types" element={<AdminRoomTypesPage />} />
            <Route path="reservations" element={<AdminReservationsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="audit" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
