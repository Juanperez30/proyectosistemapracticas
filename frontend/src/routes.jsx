import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EmpresaDashboard from './pages/dashboard/EmpresaDashboard';
import EstudianteDashboard from './pages/dashboard/EstudianteDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProtectedRoute from './auth/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard/empresa" element={
        <ProtectedRoute>
          <EmpresaDashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard/estudiante" element={
        <ProtectedRoute>
          <EstudianteDashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
