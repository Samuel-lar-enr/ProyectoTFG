import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, eventService } from '../services/api';
import type { Area, Evento } from '../types/apiTypes';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Evento[]>([]);
  
  useEffect(() => {
    adminService.getAreas()
      .then(data => setAreas(data))
      .catch(err => console.error("Error fetching areas:", err));

    eventService.getAll()
      .then(data => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Comparar desde la madrugada de hoy (ignorar horas)
        
        // Extraer los futuros y ordenarlos de forma ascendente (el más inminente primero)
        const futureEvents = data
          .filter(e => e.fecha_inicio && new Date(e.fecha_inicio).getTime() >= now.getTime())
          .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
          .slice(0, 4);
        
        setUpcomingEvents(futureEvents);
      })
      .catch(err => console.error("Error fetching events:", err));
  }, []);

  const bgColors = ['bg-church-terracotta', 'bg-church-olive', 'bg-church-dark'];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/church_hero_background_1774865233497.png" 
            alt="Iglesia La Vid Verdadera" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-lg">
            La Vid Verdadera
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light mb-10 tracking-wide uppercase">
            Una gran familia en Granada
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href="#reuniones" 
              className="bg-church-terracotta text-white px-10 py-4 rounded font-bold uppercase tracking-widest hover:bg-church-terracotta/90 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Eventos
            </a>
            <a 
              href="https://www.youtube.com/@IglesiaLaVidVerdadera"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white text-white px-10 py-4 rounded font-bold uppercase tracking-widest hover:bg-white hover:text-church-olive transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Predicaciones
            </a>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Misión y Familia */}
      <section className="bg-church-beige border-b border-gray-100">
        <div className="section-container max-w-4xl text-center">
          <span className="text-church-terracotta font-bold uppercase tracking-[.3em] text-xs mb-4 block">Nuestra Comunidad</span>
          <h2 className="text-4xl md:text-5xl font-serif text-church-olive mb-8">Una gran familia</h2>
          <p className="text-lg text-gray-600 leading-loose">
            La Iglesia "La Vid Verdadera" en Granada es una comunidad vibrante y acogedora. Trabajamos para llevar el mensaje de esperanza a nuestra ciudad y alrededores, incluyendo Peligros, Motril, Huétor Tájar, Íllora y Loja. Somos más que una institución; somos una familia unida por la fe y el servicio.
          </p>
        </div>
      </section>

      {/* Reuniones (Schedule) */}
      <section id="reuniones" className="bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-church-olive mb-4">Nuestras Reuniones</h2>
            <div className="w-20 h-1 bg-church-terracotta mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { day: 'Domingos', time: '11:00h', title: 'Culto de Adoración' },
              { day: 'Miércoles', time: '19:30h', title: 'Estudio Bíblico' },
              { day: 'Viernes', time: '20:00h', title: 'Reunión de Oración' },
              { day: 'Sábados', time: '18:00h', title: 'Jóvenes' },
            ].map((item, idx) => (
              <div key={idx} className="card bg-church-beige p-10 transition-all hover:shadow-lg hover:-translate-y-1">
                <span className="text-church-terracotta font-bold uppercase tracking-widest text-xs mb-2 block">{item.day}</span>
                <h3 className="text-2xl font-serif text-church-olive mb-4">{item.title}</h3>
                <div className="flex items-center text-gray-500 font-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Próximos Eventos */}
      <section className="bg-church-beige/30 border-t border-gray-100 pb-16 pt-8 text-center">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="text-church-terracotta font-bold uppercase tracking-[.3em] text-xs mb-4 block">No te lo pierdas</span>
            <h2 className="text-4xl font-serif text-church-olive mb-4">Eventos Próximos</h2>
            <div className="w-20 h-1 bg-church-terracotta mx-auto rounded-full"></div>
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {upcomingEvents.map(evento => (
                <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left flex flex-col hover:shadow-md transition-shadow">
                  <div className="bg-church-olive p-4 text-white text-center">
                    <span className="block text-2xl font-bold">{new Date(evento.fecha_inicio).getDate()}</span>
                    <span className="block text-sm uppercase tracking-wider">{new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-church-olive mb-2">{evento.titulo}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{evento.descripcion}</p>
                    </div>
                    <div className="flex items-center text-xs font-bold text-church-terracotta">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Ubicación de Iglesia
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl bg-white/50 text-gray-400">
              <p>Actualmente no hay eventos próximos agendados.</p>
            </div>
          )}
          
          <div className="mt-10">
            <button 
              onClick={() => navigate('/eventos')}
              className="text-church-olive border border-church-olive px-8 py-3 rounded uppercase font-bold text-sm tracking-widest hover:bg-church-olive hover:text-white transition-colors"
            >
              Ver todos los eventos
            </button>
          </div>
        </div>
      </section>

      {/* Áreas de Trabajo (Ministerios) */}
      <section id="ministerios" className="bg-church-beige">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
            <div className="text-left">
              <span className="text-church-terracotta font-bold uppercase tracking-[.3em] text-xs mb-4 block">Ministerios</span>
              <h2 className="text-4xl font-serif text-church-olive">Áreas de Trabajo</h2>
            </div>
            <p className="text-gray-500 max-w-md md:text-right">Desarrollamos nuestra labor social y espiritual a través de diferentes grupos enfocados en cada necesidad.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area, idx) => (
              <div 
                key={area.id} 
                onClick={() => navigate(`/area/${area.id}`)}
                className="group relative h-64 overflow-hidden rounded-2xl shadow-md cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className={`${bgColors[idx % bgColors.length]} absolute inset-0 opacity-80 group-hover:opacity-90 transition-opacity`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <h3 className="text-white text-3xl font-serif mb-4 group-hover:scale-110 transition-transform group-hover:-translate-y-4">{area.nombre}</h3>
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-all translate-y-8 group-hover:translate-y-6 text-white/90 text-sm font-medium px-4 line-clamp-3">
                    {area.resumen || "Ver más detalles"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frase Final */}
      <section className="py-32 bg-church-dark text-white text-center px-6">
        <div className="max-w-3xl mx-auto italic font-serif text-3xl md:text-4xl text-white/90 leading-snug">
          "Un lugar donde todos son bienvenidos, una familia donde crecer juntos en el amor de Dios."
        </div>
      </section>
    </div>
  );
};

export default Home;
