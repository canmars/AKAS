import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AcademicStaff from './pages/AcademicStaff';
import Layout from './components/layout/Layout';
import CourseAnalysis from './pages/CourseAnalysis';
import Students from './pages/Students';
import Simulation from './pages/Simulation';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/academic-staff" element={<AcademicStaff />} />
                    <Route path="/course-analysis" element={<CourseAnalysis />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/simulation" element={<Simulation />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
