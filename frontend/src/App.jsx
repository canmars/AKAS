import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import RoleSelection from './pages/RoleSelection.jsx';
import StageTracking from './pages/StageTracking.jsx';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/role-selection" element={<RoleSelection />} />

                {/* Protected Pages (Wrapped in Layout) */}
                <Route path="/dashboard" element={
                    <MainLayout>
                        <Dashboard />
                    </MainLayout>
                } />
                <Route path="/stage-tracking" element={
                    <MainLayout>
                        <StageTracking />
                    </MainLayout>
                } />

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
