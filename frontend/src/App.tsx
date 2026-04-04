import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

import DashboardLayout from './pages/Dashboard/DashboardLayout';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import UsersList from './pages/Dashboard/Users/UsersList';
import BlogsList from './pages/Dashboard/Blogs/BlogsList';
import CommentsList from './pages/Dashboard/Blogs/CommentsList';
import ReactionsList from './pages/Dashboard/Blogs/ReactionsList';

import EventosList from './pages/Dashboard/Eventos/EventosList';
import TagsList from './pages/Dashboard/Tags/TagsList';
import OracionesList from './pages/Dashboard/Oraciones/OracionesList';
import RolesList from './pages/Dashboard/Organization/RolesList';
import AreasList from './pages/Dashboard/Organization/AreasList';
import PuestosList from './pages/Dashboard/Organization/PuestosList';

import { DashboardProvider } from './context/DashboardContext';

import Home from './pages/Home';
import OracionesPage from './pages/OracionesPage';
import BlogsPage from './pages/BlogsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            {/* Rutas Públicas de Auth (sin layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas dentro del Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            
            <Route path="/eventos" element={<ProtectedRoute>
               <div className="bg-white p-12 rounded-3xl shadow-sm text-center">
                 <h2 className="text-3xl font-bold text-gray-900">Eventos</h2>
                 <p className="mt-4 text-gray-500">Próximamente más contenido...</p>
               </div>
            </ProtectedRoute>} />
            
            <Route path="/oraciones" element={<ProtectedRoute>
               <OracionesPage />
            </ProtectedRoute>} />

            <Route path="/blog" element={<ProtectedRoute>
               <BlogsPage />
            </ProtectedRoute>} />
            <Route path="/blogs" element={<Navigate to="/blog" replace />} />

            {/* Dashboard para Admin y Pastor */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardOverview />} />
              <Route path="usuarios" element={<UsersList />} />
              <Route path="blogs">
                <Route index element={<BlogsList />} />
                <Route path="comentarios" element={<CommentsList />} />
                <Route path="reacciones" element={<ReactionsList />} />
              </Route>
              <Route path="tags" element={<TagsList />} />
              <Route path="oraciones" element={<OracionesList />} />
              <Route path="eventos" element={<EventosList />} />
              <Route path="organizacion">
                <Route path="roles" element={<RolesList />} />
                <Route path="areas" element={<AreasList />} />
                <Route path="puestos" element={<PuestosList />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DashboardProvider>
    </AuthProvider>
  </BrowserRouter>
);
}

export default App;
