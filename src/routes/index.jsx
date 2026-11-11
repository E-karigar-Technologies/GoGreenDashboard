import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';
import AdminLayout from 'layouts/AdminLayout';

// render - landing page
const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const SignIn1 = lazy(() => import('../views/auth/login'));

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      index: true,
      element: <SignIn1 />
    },
    {
      ...MainRoutes,
      errorElement: <Navigate to="/dashboard" replace />
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" replace />
    }
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
