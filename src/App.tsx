import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import BookDetail from '@/pages/BookDetail';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import About from '@/pages/About';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import NotFound from '@/pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <Layout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'catalog', element: <Catalog /> },
      { path: 'books/:id', element: <BookDetail /> },
      { path: 'about', element: <About /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },

      // Legacy /dashboard redirects to student dashboard
      { path: 'dashboard', element: <Navigate to="/student/dashboard" replace /> },

      // Protected routes
      {
        path: 'student/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
