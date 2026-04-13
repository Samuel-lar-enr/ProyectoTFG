import React from 'react';
import { Link } from 'react-router-dom';
import { Section, Card } from '../../components/ui';

const modules = [
  { name: 'Usuarios', description: 'Gestión de roles, permisos y usuarios.', href: '/dashboard/usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { name: 'Blogs (Publicaciones)', description: 'Entradas, comentarios y reacciones.', href: '/dashboard/blogs', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  { name: 'Tags (Categorías)', description: 'Etiquetas para clasificar el contenido.', href: '/dashboard/tags', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { name: 'Oraciones', description: 'Peticiones de oración y recordatorios.', href: '/dashboard/oraciones', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { name: 'Eventos', description: 'Calendario y lista de eventos.', href: '/dashboard/eventos', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { name: 'Estructura', description: 'Gestión de roles, áreas (ministerios) y puestos.', href: '/dashboard/organizacion/roles', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

const DashboardOverview: React.FC = () => {
  return (
    <Section 
      title="Panel de Control" 
      subtitle="Administra todo el contenido de la plataforma de la Iglesia La Vid Verdadera."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <Link key={mod.name} to={mod.href}>
            <Card className="hover:border-church-terracotta group h-full">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-church-beige text-church-terracotta rounded-xl flex items-center justify-center shrink-0 group-hover:bg-church-terracotta group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mod.icon} />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-church-terracotta transition-colors">{mod.name}</h2>
              </div>
              <p className="text-sm text-gray-500">{mod.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
};

export default DashboardOverview;
