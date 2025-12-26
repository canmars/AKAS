import React from 'react';
import AdvisorChart from '../components/dashboard/AdvisorChart';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Akademik Karar Destek Sistemi Paneli
                </h1>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <AdvisorChart />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
