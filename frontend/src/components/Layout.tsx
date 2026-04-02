import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isDarkNav = location.pathname !== '/' || isScrolled;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-church-beige">
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isDarkNav ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className={`text-2xl font-serif font-bold transition-colors ${isDarkNav ? 'text-church-olive' : 'text-white'}`}>
                La Vid Verdadera
              </span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className={`text-sm font-semibold transition-colors uppercase tracking-wider ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white/90 hover:text-white'}`}>Inicio</Link>
              <a href="#ministerios" className={`text-sm font-semibold transition-colors uppercase tracking-wider ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white/90 hover:text-white'}`}>Ministerios</a>
              <a href="#reuniones" className={`text-sm font-semibold transition-colors uppercase tracking-wider ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white/90 hover:text-white'}`}>Reuniones</a>
              {isAuthenticated && (
                <>
                  <Link to="/eventos" className={`text-sm font-semibold transition-colors uppercase tracking-wider ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white/90 hover:text-white'}`}>Eventos</Link>
                  <Link to="/oraciones" className={`text-sm font-semibold transition-colors uppercase tracking-wider ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white/90 hover:text-white'}`}>Oraciones</Link>
                  
                  {/* Dashboard Menu solo para Admin/Pastor */}
                  {user?.roles && (user.roles.includes('administrador') || user.roles.includes('pastor')) && (
                    <div className="relative group inline-block">
                      <Link to="/dashboard" className={`text-sm font-bold transition-colors uppercase tracking-wider flex items-center gap-1 ${isDarkNav ? 'text-church-terracotta hover:text-church-terracotta-dark' : 'text-white hover:text-white/80'}`}>
                        Dashboard
                        <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </Link>
                      
                      {/* Submenú / Card de Dashboard */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="bg-white w-64 rounded-xl shadow-xl border border-gray-100 p-3 flex flex-col space-y-1">
                          <Link to="/dashboard/usuarios" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-church-beige hover:text-church-olive rounded-md transition-colors flex items-center gap-3">
                            <span className="w-6 text-center">👥</span> Usuarios
                          </Link>
                          <Link to="/dashboard/blogs" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-church-beige hover:text-church-olive rounded-md transition-colors flex items-center gap-3">
                            <span className="w-6 text-center">📝</span> Blogs
                          </Link>
                          <Link to="/dashboard/tags" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-church-beige hover:text-church-olive rounded-md transition-colors flex items-center gap-3">
                            <span className="w-6 text-center">🏷️</span> Tags
                          </Link>
                          <Link to="/dashboard/oraciones" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-church-beige hover:text-church-olive rounded-md transition-colors flex items-center gap-3">
                            <span className="w-6 text-center">🙏</span> Oraciones
                          </Link>
                          <Link to="/dashboard/eventos" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-church-beige hover:text-church-olive rounded-md transition-colors flex items-center gap-3">
                            <span className="w-6 text-center">📅</span> Eventos
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className={`text-xs font-bold ${isDarkNav ? 'text-gray-900' : 'text-white'}`}>{user?.username}</span>
                  <span className={`text-[10px] ${isDarkNav ? 'text-gray-500' : 'text-white/70'}`}>{user?.email}</span>
                </div>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-gray-100 object-cover" />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${isDarkNav ? 'bg-church-olive text-white border-church-olive' : 'bg-white/20 text-white border-white/30'}`}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-all border ${isDarkNav ? 'text-church-dark border-gray-300 hover:bg-gray-50' : 'text-white border-white/30 hover:bg-white/10'}`}
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`text-sm font-bold uppercase tracking-wider transition-colors ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white hover:text-white/80'}`}
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className={`text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded transition-all shadow-sm ${isDarkNav ? 'bg-church-terracotta text-white hover:bg-church-terracotta/90' : 'bg-white text-church-olive hover:bg-gray-100'}`}
                >
                  Registro
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="grow">
        <Outlet />
      </main>

      <footer className="bg-church-olive text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h3 className="font-serif text-2xl mb-6">La Vid Verdadera</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              "Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto; porque separados de mí nada podéis hacer." - Juan 15:5
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-white/60">Ubicaciones</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li>Granada: Calle Ejemplo 123</li>
              <li>Peligros: Plaza Mayor 4</li>
              <li>Motril: Avda. de la Costa s/n</li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-end justify-center">
            <p className="text-xs text-white/50 mb-2">© {new Date().getFullYear()} Iglesia La Vid Verdadera</p>
            <p className="text-[10px] text-white/30 tracking-[.3em] uppercase transition-opacity hover:opacity-100">Solución Digital para su Iglesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

