import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import type { Area } from '../types/apiTypes';

const AreaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      adminService.getAreaById(Number(id))
        .then(data => {
          setArea(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-church-beige">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-church-terracotta"></div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-church-beige">
        <h2 className="text-3xl font-serif text-church-olive mb-4">Área no encontrada</h2>
        <button 
          onClick={() => navigate('/')}
          className="text-white bg-church-terracotta px-6 py-2 rounded shadow hover:bg-church-terracotta/90"
        >
          Volver a inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-church-beige">
      {/* Hero Header para Área */}
      <section className="relative h-64 md:h-96 flex items-center justify-center overflow-hidden bg-church-dark">
        {area.imagen ? (
          <>
            <img 
              src={`http://localhost:5000${area.imagen}`} 
              alt={area.nombre} 
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
              onError={(e) => {
                // Fallback si la imagen no existe
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/50 z-0"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-church-olive/80 z-0"></div>
        )}
        <div className="relative z-10 text-center px-4">
          <span className="text-church-terracotta font-bold uppercase tracking-[.3em] text-sm mb-2 block">
            Área de Ministerio
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-white drop-shadow-md">
            {area.nombre}
          </h1>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-lg text-gray-700 leading-loose">
        <div className="bg-white p-8 md:p-12 shadow-md rounded-2xl">
          <p className="whitespace-pre-wrap">{area.descripcion || "No hay descripción disponible para esta área."}</p>
        </div>

        {area.usuarios && area.usuarios.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-serif text-church-olive mb-6 text-center">Nuestro Equipo</h3>
            <div className="flex flex-row overflow-x-auto gap-8 pb-4 justify-center">
              {area.usuarios.map(user => (
                <div key={user.id} className="flex flex-col items-center flex-shrink-0 group cursor-default">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-white shadow-lg group-hover:border-church-terracotta transition-colors">
                    <img 
                      src={user.avatar ? `http://localhost:5000${user.avatar}` : "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username) + "&background=A35C4A&color=fff"}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username) + "&background=A35C4A&color=fff";
                      }}
                    />
                  </div>
                  <span className="text-base font-bold text-gray-800 group-hover:text-church-terracotta transition-colors">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-16 text-center">
             <button 
                onClick={() => navigate('/')}
                className="text-church-olive font-bold hover:text-church-terracotta transition-colors flex items-center justify-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a inicio
              </button>
        </div>
      </section>
    </div>
  );
};

export default AreaDetailPage;
