import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { StudentLayout } from '@/app/layouts/StudentLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';

import { LandingPage } from '@/pages/Landing/LandingPage';
import { LoginPage } from '@/pages/Login/LoginPage';
import { StudentDashboardPage } from '@/pages/StudentDashboard/StudentDashboardPage';
import { PlannerPage } from '@/pages/Planner/PlannerPage';
import { CheckInPage } from '@/pages/CheckIn/CheckInPage';
import { AdminDashboardPage } from '@/pages/AdminDashboard/AdminDashboardPage';
import { DesignSystemPage } from '@/pages/DesignSystem/DesignSystemPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
        </Route>

        {/* Student Protected Routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/overview" element={<AdminDashboardPage />} />
          <Route path="/admin/attendance" element={<AdminDashboardPage />} />
          <Route path="/admin/analytics" element={<AdminDashboardPage />} />
          <Route path="/admin/config" element={<AdminDashboardPage />} />
          <Route path="/admin/qr" element={<AdminDashboardPage />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
