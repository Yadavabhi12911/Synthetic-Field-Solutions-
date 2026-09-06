import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { CommandPaletteProvider } from './components/command-palette/CommandPaletteProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { PageSkeleton } from './components/ui/Skeleton';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const UserLogin = lazy(() => import('./pages/UserLogin'));
const UserRegister = lazy(() => import('./pages/UserRegister'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminRegister = lazy(() => import('./pages/AdminRegister'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TurfListing = lazy(() => import('./pages/TurfListing'));
const TurfDetails = lazy(() => import('./pages/TurfDetails'));
const BookingHistory = lazy(() => import('./pages/BookingHistory'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminBookingHistory = lazy(() => import('./pages/AdminBookingHistory'));
const UserPreferences = lazy(() => import('./pages/UserPreferences'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <CommandPaletteProvider>
          <AppShell>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/register" element={<UserRegister />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute userType="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute userType="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute userType="admin">
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute userType="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute userType="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute userType="admin">
                    <AdminBookingHistory />
                  </ProtectedRoute>
                }
              />
              <Route path="/turfs" element={<TurfListing />} />
              <Route path="/turf/:id" element={<TurfDetails />} />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute userType="user">
                    <BookingHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/preferences"
                element={
                  <ProtectedRoute userType="user">
                    <UserPreferences />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </AppShell>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgb(20 26 31)',
              color: '#f4f7fa',
              border: '1px solid rgb(34 160 107)',
            },
          }}
        />
        </CommandPaletteProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
