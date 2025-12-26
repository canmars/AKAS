import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <Header />
            {children}
        </div>
    );
};

export default Layout;
