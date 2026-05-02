import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';


const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const isDarkNav = location.pathname !== '/' || isScrolled;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-church-beige">
      <header className={`fixed top-0 w-full z-[100] transition-all duration-300 ${isDarkNav ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className={`text-2xl font-serif font-bold transition-colors ${isDarkNav ? 'text-church-olive' : 'text-white'}`}>
                La Vid Verdadera
              </span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className={`text-sm font-semibold transition-colors uppercase tracking-wider ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white/90 hover:text-white'}`}>Inicio</Link>
              <Link to="/blog" className={`text-sm font-semibold transition-colors uppercase tracking-wider ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white/90 hover:text-white'}`}>Blogs</Link>
              <Link to="/eventos" className={`text-sm font-semibold transition-colors uppercase tracking-wider ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white/90 hover:text-white'}`}>Eventos</Link>
              
              {isAuthenticated && (
                <>
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
                <Link to="/perfil" className="hidden lg:flex flex-col items-end mr-1 group-hover:opacity-80 transition-opacity">
                  <span className={`text-xs font-bold ${isDarkNav ? 'text-gray-900' : 'text-white'}`}>{user?.username}</span>
                  <span className={`text-[10px] ${isDarkNav ? 'text-gray-500' : 'text-white/70'}`}>{user?.email}</span>
                </Link>
                <Link to="/perfil" className="relative group/avatar">
                  {user?.avatar ? (
                    <img src={getImageUrl(user.avatar)} alt="Avatar" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-100 object-cover transition-transform group-hover/avatar:scale-110" />
                  ) : (
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all group-hover/avatar:scale-110 ${isDarkNav ? 'bg-church-olive text-white border-church-olive' : 'bg-white/20 text-white border-white/30'}`}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`hidden md:block text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-all border ${isDarkNav ? 'text-church-dark border-gray-300 hover:bg-gray-50' : 'text-white border-white/30 hover:bg-white/10'}`}
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link
                  to="/login"
                  className={`text-xs md:text-sm font-bold uppercase tracking-wider transition-colors ${isDarkNav ? 'text-gray-700 hover:text-church-terracotta' : 'text-white hover:text-white/80'}`}
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className={`text-[10px] md:text-sm font-bold uppercase tracking-wider px-3 md:px-5 py-2 md:py-2.5 rounded transition-all shadow-sm ${isDarkNav ? 'bg-church-terracotta text-white hover:bg-church-terracotta/90' : 'bg-white text-church-olive hover:bg-gray-100'}`}
                >
                  Registro
                </Link>
              </div>
            )}

            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${isDarkNav ? 'text-church-olive hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden fixed inset-0 z-[110] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-church-olive/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <nav className={`absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl p-8 flex flex-col transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between mb-10">
              <span className="text-xl font-serif font-bold text-church-olive">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-church-olive transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex flex-col space-y-6">
              <Link to="/" className="text-lg font-bold text-gray-800 hover:text-church-terracotta transition-colors flex items-center gap-4">
                <span className="w-8 h-8 flex items-center justify-center bg-church-beige rounded-lg text-sm">🏠</span> Inicio
              </Link>
              <Link to="/blog" className="text-lg font-bold text-gray-800 hover:text-church-terracotta transition-colors flex items-center gap-4">
                <span className="w-8 h-8 flex items-center justify-center bg-church-beige rounded-lg text-sm">📝</span> Blogs
              </Link>
              <Link to="/eventos" className="text-lg font-bold text-gray-800 hover:text-church-terracotta transition-colors flex items-center gap-4">
                <span className="w-8 h-8 flex items-center justify-center bg-church-beige rounded-lg text-sm">📅</span> Eventos
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/oraciones" className="text-lg font-bold text-gray-800 hover:text-church-terracotta transition-colors flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-church-beige rounded-lg text-sm">🙏</span> Oraciones
                  </Link>
                  <Link to="/perfil" className="text-lg font-bold text-gray-800 hover:text-church-terracotta transition-colors flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-church-beige rounded-lg text-sm">👤</span> Mi Perfil
                  </Link>
                  
                  {user?.roles && (user.roles.includes('administrador') || user.roles.includes('pastor')) && (
                    <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
                       <span className="text-xs font-black uppercase tracking-widest text-gray-400">Administración</span>
                       <Link to="/dashboard" className="text-lg font-bold text-church-terracotta hover:text-church-terracotta-dark transition-colors flex items-center gap-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-church-terracotta/10 rounded-lg text-sm">📊</span> Dashboard
                      </Link>
                    </div>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="mt-auto text-lg font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-4 pt-10"
                  >
                    <span className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg text-sm">🚪</span> Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="pt-10 space-y-4">
                   <Link to="/login" className="block w-full text-center py-4 rounded-xl font-bold uppercase tracking-widest text-church-olive bg-church-beige hover:bg-church-beige/80 transition-all">Entrar</Link>
                   <Link to="/register" className="block w-full text-center py-4 rounded-xl font-bold uppercase tracking-widest text-white bg-church-terracotta hover:bg-church-terracotta/90 transition-all shadow-lg">Registro</Link>
                </div>
              )}
            </div>
          </nav>
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

