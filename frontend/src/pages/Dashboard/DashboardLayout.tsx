import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const DashboardLayout: React.FC = () => {
  const location = useLocation();

  // Helper to check if a route is active
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] mt-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      {/* Sidebar for Submenus */}
      <aside className="w-full md:w-64 bg-white shadow-sm rounded-xl p-6 mb-6 md:mb-0 md:mr-8 border border-gray-100 shrink-0 self-start">
        <h2 className="text-xl font-serif font-bold text-church-olive mb-6">Panel de Control</h2>
        
        <div className="space-y-6">
          {isActive('/dashboard/blogs') && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sección Blogs</h3>
              <nav className="space-y-1">
                <NavLink to="/dashboard/blogs" end className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Entradas (Blogs)</NavLink>
                <NavLink to="/dashboard/blogs/comentarios" className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Comentarios</NavLink>
                <NavLink to="/dashboard/blogs/reacciones" className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Reacciones</NavLink>
              </nav>
            </div>
          )}

          {isActive('/dashboard/usuarios') && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sección Usuarios</h3>
              <nav className="space-y-1">
                <NavLink to="/dashboard/usuarios" end className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Lista de Usuarios</NavLink>
              </nav>
            </div>
          )}

          {isActive('/dashboard/tags') && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sección Tags</h3>
              <nav className="space-y-1">
                <NavLink to="/dashboard/tags" end className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Lista de Etiquetas</NavLink>
              </nav>
            </div>
          )}

          {isActive('/dashboard/oraciones') && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sección Oraciones</h3>
              <nav className="space-y-1">
                <NavLink to="/dashboard/oraciones" end className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Peticiones de Oración</NavLink>
              </nav>
            </div>
          )}

          {isActive('/dashboard/eventos') && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sección Eventos</h3>
              <nav className="space-y-1">
                <NavLink to="/dashboard/eventos" end className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Lista de Eventos</NavLink>
              </nav>
            </div>
          )}

          {isActive('/dashboard/organizacion') && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Estructura</h3>
              <nav className="space-y-1">
                <NavLink to="/dashboard/organizacion/roles" className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Roles</NavLink>
                <NavLink to="/dashboard/organizacion/areas" className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Áreas (Ministerios)</NavLink>
                <NavLink to="/dashboard/organizacion/puestos" className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Puestos</NavLink>
              </nav>
            </div>
          )}

          {/* Fallback menu if just at /dashboard */}
          {!isActive('/dashboard/blogs') && !isActive('/dashboard/usuarios') && !isActive('/dashboard/tags') && !isActive('/dashboard/oraciones') && !isActive('/dashboard/eventos') && !isActive('/dashboard/organizacion') && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Resumen</h3>
              <nav className="space-y-1">
                <NavLink to="/dashboard" end className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-church-beige text-church-terracotta' : 'text-gray-600 hover:bg-gray-50 hover:text-church-olive'}`}>Vista General</NavLink>
              </nav>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
