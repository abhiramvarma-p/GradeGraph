import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserManagement from '../components/admin/UserManagement';
import CurriculumManagement from '../components/admin/CurriculumManagement';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/curriculum" element={<CurriculumManagement />} />
        </Routes>
    );
};

export default AdminRoutes; 
