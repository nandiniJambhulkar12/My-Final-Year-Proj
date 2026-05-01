import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute: React.FC = () => {
  const adminToken = localStorage.getItem('adminToken');
  const adminRole = localStorage.getItem('adminRole');

  if (!adminToken || adminRole !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
