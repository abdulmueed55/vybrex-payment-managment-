import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Otp from './pages/Otp';
import Dashboard from './pages/Dashboard';
import Withdrawal from './pages/Withdrawal';
import Parks from './pages/Parks';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/withdrawal" element={<Withdrawal />} />
        <Route path="/parks" element={<Parks />} />
      </Routes>
    </Router>
  );
}

export default App;