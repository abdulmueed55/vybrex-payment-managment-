import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Otp from './pages/Otp';
import Dashboard from './pages/Dashboard';
import Withdrawal from './pages/Withdrawal';
import Parks from './pages/Parks';
import Profile from './pages/Profile';
import Terms from './pages/Terms';
import AdminLogin from './pages/admin/AdminLogin';
import AdminOverview from './pages/admin/AdminOverview';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminParks from './pages/admin/AdminParks';
import AdminBankAccounts from './pages/admin/AdminBankAccounts';

const NotFound = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#FAF9F6' }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: '800', color: '#0A0A0A', margin: '0' }}>404</h1>
      <p style={{ color: '#6B6B6B', marginTop: '8px', marginBottom: '24px' }}>Page not found</p>
      <a href="/" style={{ color: '#0A0A0A', fontWeight: '600', textDecoration: 'underline' }}>Go home</a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/withdrawal" element={<Withdrawal />} />
        <Route path="/parks" element={<Parks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminOverview />} />
        <Route path="/admin/drivers" element={<AdminDrivers />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        <Route path="/admin/parks" element={<AdminParks />} />
        <Route path="/admin/bank-accounts" element={<AdminBankAccounts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
