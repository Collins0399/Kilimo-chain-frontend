import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  Users, Sprout, ShoppingBag, Coins, Bell, Smartphone, 
  LayoutDashboard, ShoppingCart, FolderHeart, History, MessageSquare
} from 'lucide-react';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BrowseProduce from './pages/buyer/BrowseProduce';
import MyOrders from './pages/buyer/MyOrders';
import PaymentHistory from './pages/buyer/PaymentHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import FarmerDirectory from './pages/admin/FarmerDirectory';
import HarvestInventory from './pages/admin/HarvestInventory';
import MarketPrices from './pages/admin/MarketPrices';
import BuyerRequests from './pages/admin/BuyerRequests';
import PaymentAudit from './pages/admin/PaymentAudit';
import Notifications from './pages/admin/Notifications';
import SmsManagement from './pages/admin/SmsManagement';

import LandingPage from './pages/LandingPage';

import { api } from './services/api';

// Protected layout wrapper
function ProtectedLayout({ children, requiredRole }) {
  const location = useLocation();
  const user = api.auth.getCurrentUser();
  const token = api.auth.getToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to correct dashboard
    return <Navigate to={user.role === 'COOPERATIVE_ADMIN' ? '/admin/dashboard' : '/buyer/dashboard'} replace />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <span className="logo-icon">🌾</span>
          <span>Kilimo-Chain</span>
        </div>

        <ul className="nav-links">
          {user.role === 'COOPERATIVE_ADMIN' ? (
            /* Admin Sidebar Links */
            <>
              <li className={`nav-link-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                <Link to="/admin/dashboard">
                  <LayoutDashboard size={20} />
                  <span>Overview</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/admin/farmers' ? 'active' : ''}`}>
                <Link to="/admin/farmers">
                  <Users size={20} />
                  <span>Farmers</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/admin/harvests' ? 'active' : ''}`}>
                <Link to="/admin/harvests">
                  <Sprout size={20} />
                  <span>Harvests Stock</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/admin/prices' ? 'active' : ''}`}>
                <Link to="/admin/prices">
                  <Coins size={20} />
                  <span>Market Prices</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/admin/requests' ? 'active' : ''}`}>
                <Link to="/admin/requests">
                  <ShoppingCart size={20} />
                  <span>Buyer Requests</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/admin/payments' ? 'active' : ''}`}>
                <Link to="/admin/payments">
                  <History size={20} />
                  <span>Payments Audit</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/admin/notifications' ? 'active' : ''}`}>
                <Link to="/admin/notifications">
                  <Bell size={20} />
                  <span>Alert Center</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/admin/sms' ? 'active' : ''}`}>
                <Link to="/admin/sms">
                  <MessageSquare size={20} />
                  <span>SMS Logs</span>
                </Link>
              </li>
            </>
          ) : (
            /* Buyer Sidebar Links */
            <>
              <li className={`nav-link-item ${location.pathname === '/buyer/dashboard' ? 'active' : ''}`}>
                <Link to="/buyer/dashboard">
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/buyer/browse' ? 'active' : ''}`}>
                <Link to="/buyer/browse">
                  <ShoppingCart size={20} />
                  <span>Browse Produce</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/buyer/orders' ? 'active' : ''}`}>
                <Link to="/buyer/orders">
                  <ShoppingBag size={20} />
                  <span>My Orders</span>
                </Link>
              </li>
              <li className={`nav-link-item ${location.pathname === '/buyer/payments' ? 'active' : ''}`}>
                <Link to="/buyer/payments">
                  <History size={20} />
                  <span>Payment History</span>
                </Link>
              </li>
            </>
          )}


        </ul>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="profile-avatar">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user.fullName}</span>
              <span className="profile-role">{user.role === 'COOPERATIVE_ADMIN' ? 'Admin' : 'Buyer'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Buyer Routes */}
        <Route path="/buyer/dashboard" element={
          <ProtectedLayout requiredRole="BUYER">
            <BuyerDashboard />
          </ProtectedLayout>
        } />
        <Route path="/buyer/browse" element={
          <ProtectedLayout requiredRole="BUYER">
            <BrowseProduce />
          </ProtectedLayout>
        } />
        <Route path="/buyer/orders" element={
          <ProtectedLayout requiredRole="BUYER">
            <MyOrders />
          </ProtectedLayout>
        } />
        <Route path="/buyer/payments" element={
          <ProtectedLayout requiredRole="BUYER">
            <PaymentHistory />
          </ProtectedLayout>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedLayout requiredRole="COOPERATIVE_ADMIN">
            <AdminDashboard />
          </ProtectedLayout>
        } />
        <Route path="/admin/farmers" element={
          <ProtectedLayout requiredRole="COOPERATIVE_ADMIN">
            <FarmerDirectory />
          </ProtectedLayout>
        } />
        <Route path="/admin/harvests" element={
          <ProtectedLayout requiredRole="COOPERATIVE_ADMIN">
            <HarvestInventory />
          </ProtectedLayout>
        } />
        <Route path="/admin/prices" element={
          <ProtectedLayout requiredRole="COOPERATIVE_ADMIN">
            <MarketPrices />
          </ProtectedLayout>
        } />
        <Route path="/admin/requests" element={
          <ProtectedLayout requiredRole="COOPERATIVE_ADMIN">
            <BuyerRequests />
          </ProtectedLayout>
        } />
        <Route path="/admin/payments" element={
          <ProtectedLayout requiredRole="COOPERATIVE_ADMIN">
            <PaymentAudit />
          </ProtectedLayout>
        } />
        <Route path="/admin/notifications" element={
          <ProtectedLayout requiredRole="COOPERATIVE_ADMIN">
            <Notifications />
          </ProtectedLayout>
        } />
        <Route path="/admin/sms" element={
          <ProtectedLayout requiredRole="COOPERATIVE_ADMIN">
            <SmsManagement />
          </ProtectedLayout>
        } />


        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
