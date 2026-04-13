import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';

// Auth Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';

// Main Pages
import Home from '../pages/Home';
import OracionesPage from '../pages/OracionesPage';
import BlogsPage from '../pages/BlogsPage';
import PerfilPage from '../pages/PerfilPage';
import EventosPage from '../pages/EventosPage';
import AreaDetailPage from '../pages/AreaDetailPage';

// Dashboard Components
import DashboardLayout from '../pages/Dashboard/DashboardLayout';
import DashboardOverview from '../pages/Dashboard/DashboardOverview';
import UsersList from '../pages/Dashboard/Users/UsersList';
import BlogsList from '../pages/Dashboard/Blogs/BlogsList';
import CommentsList from '../pages/Dashboard/Blogs/CommentsList';
import ReactionsList from '../pages/Dashboard/Blogs/ReactionsList';
import EventosList from '../pages/Dashboard/Eventos/EventosList';
import TagsList from '../pages/Dashboard/Tags/TagsList';
import OracionesList from '../pages/Dashboard/Oraciones/OracionesList';
import RolesList from '../pages/Dashboard/Organization/RolesList';
import AreasList from '../pages/Dashboard/Organization/AreasList';
import PuestosList from '../pages/Dashboard/Organization/PuestosList';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas Públicas de Auth (sin layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rutas dentro del Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        
        <Route path="/eventos" element={<EventosPage />} />
        
        <Route path="/oraciones" element={
          <ProtectedRoute>
            <OracionesPage />
          </ProtectedRoute>
        } />

        <Route path="/blog" element={<BlogsPage />} />
        <Route path="/blogs" element={<Navigate to="/blog" replace />} />
        
        <Route path="/perfil" element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        } />

        <Route path="/area/:id" element={<AreaDetailPage />} />

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
  );
};

export default AppRoutes;
