import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Protected Route Component
 * 
 * Kullanıcının token'ı yoksa login sayfasına yönlendirir.
 * Token varsa children component'lerini render eder.
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Token yoksa login sayfasına yönlendir
        return <Navigate to="/login" replace />;
    }

    // Token varsa içeriği göster
    return children;
};

export default ProtectedRoute;
