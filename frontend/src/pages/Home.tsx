import React from 'react';

const Home: React.FC = () => {
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
            <button 
              className="bg-transparent border-2 border-white text-white px-10 py-4 rounded font-bold uppercase tracking-widest hover:bg-white hover:text-church-olive transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Predicaciones
            </button>
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
            {[
              { name: 'Niños', color: 'bg-church-terracotta' },
              { name: 'Preadolescentes', color: 'bg-church-olive' },
              { name: 'Jóvenes', color: 'bg-church-dark' },
              { name: 'Mujeres', color: 'bg-church-terracotta' },
              { name: 'Hombres', color: 'bg-church-olive' },
              { name: 'Matrimonios', color: 'bg-church-dark' },
              { name: 'Ayuda Social', color: 'bg-church-terracotta' },
              { name: 'Prisiones', color: 'bg-church-olive' },
              { name: 'Evangelismo', color: 'bg-church-dark' }
            ].map((min, idx) => (
              <div key={idx} className="group relative h-64 overflow-hidden rounded-2xl shadow-md cursor-pointer transition-all hover:scale-[1.02]">
                <div className={`${min.color} absolute inset-0 opacity-80 group-hover:opacity-90 transition-opacity`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <h3 className="text-white text-3xl font-serif mb-4 group-hover:scale-110 transition-transform">{min.name}</h3>
                  <button className="text-white/80 text-xs font-bold uppercase tracking-widest border border-white/30 px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    Saber más
                  </button>
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
