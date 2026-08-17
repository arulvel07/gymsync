import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { StudentLayout } from '@/app/layouts/StudentLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';
import { PageLoadingFallback } from '@/components/layout/PageLoadingFallback';

// Route-Level Code Splitting (React.lazy)
const LandingPage = lazy(() =>
  import('@/pages/Landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('@/pages/Login/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const StudentDashboardPage = lazy(() =>
  import('@/pages/StudentDashboard/StudentDashboardPage').then((m) => ({
    default: m.StudentDashboardPage,
  }))
);
const PlannerPage = lazy(() =>
  import('@/pages/Planner/PlannerPage').then((m) => ({ default: m.PlannerPage }))
);
const CheckInPage = lazy(() =>
  import('@/pages/CheckIn/CheckInPage').then((m) => ({ default: m.CheckInPage }))
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/AdminDashboard/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
const DesignSystemPage = lazy(() =>
  import('@/pages/DesignSystem/DesignSystemPage').then((m) => ({
    default: m.DesignSystemPage,
  }))
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
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
      </Suspense>
    </BrowserRouter>
  );
};

