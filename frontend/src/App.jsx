import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AcademicStaff from './pages/AcademicStaff';
import Layout from './components/layout/Layout';
import CourseAnalysis from './pages/CourseAnalysis';
import Students from './pages/Students';
import Simulation from './pages/Simulation';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route - Login */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes (With Layout) */}
                <Route path="/*" element={
                    <ProtectedRoute>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/student-analysis" element={<Students />} />
                                <Route path="/advisor-analysis" element={<AcademicStaff />} />
                                <Route path="/course-analysis" element={<CourseAnalysis />} />
                                <Route path="/my-students" element={<Students />} />
                                <Route path="/academic-staff" element={<AcademicStaff />} />
                                <Route path="/students" element={<Students />} />
                                <Route path="/simulation" element={<Simulation />} />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
