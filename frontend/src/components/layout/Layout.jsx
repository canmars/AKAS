import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on mobile when window is resized to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
            />
            
            {/* Main Content with Sidebar Offset */}
            <div className="lg:ml-64 transition-all duration-300">
                <Header 
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                    sidebarOpen={sidebarOpen}
                />
                
                <main className="min-h-[calc(100vh-4rem)] pt-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
