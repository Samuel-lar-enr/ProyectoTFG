import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useDashboard } from '../context/DashboardContext';

interface Oracion {
  id: number;
  id_user: number;
  autor: string;
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  estado: number;
  tags: string[];
}

const OracionesPage: React.FC = () => {
  const { user } = useAuth();
  const { tags: allTags, refreshTags } = useDashboard();
  const [oraciones, setOraciones] = useState<Oracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingOracion, setViewingOracion] = useState<Oracion | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [userRecordatorios, setUserRecordatorios] = useState<number[]>([]);
  
  // Form states
  const [newOracion, setNewOracion] = useState({
    titulo: '',
    contenido: '',
    tags: [] as string[],
    duracion_dias: 30,
    anonima: false
  });
  
  const oracionTags = allTags.filter(t => t.tipo === 'oracion');

  const fetchOraciones = async () => {
    try {
      setLoading(true);
      const res = await api.get('/oraciones/');
      // Filter only active ones for public view
      const activeOraciones = (res.data.data || res.data).filter((o: Oracion) => o.estado === 1);
      setOraciones(activeOraciones);
      
      // Si el usuario está logueado, cargar sus recordatorios
      if (user) {
        const recRes = await api.get(`/recordatorios/?user_id=${user.id}`);
        setUserRecordatorios(recRes.data.map((r: any) => r.id_oracion));
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las oraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOraciones();
    refreshTags();
  }, [user]); // Recargar si el usuario cambia (login/logout)

  const handleToggleReminder = async (e: React.MouseEvent, oracionId: number) => {
    e.stopPropagation(); // Evitar abrir el detalle al pulsar la campana
    if (!user) {
      toast.error('Debes iniciar sesión para guardar recordatorios');
      return;
    }

    try {
      const res = await api.post('/recordatorios/toggle', {
        id_user: user.id,
        id_oracion: oracionId
      });
      
      if (res.data.action === 'added') {
        setUserRecordatorios(prev => [...prev, oracionId]);
        toast.success('Añadido a tus oraciones diarias');
      } else {
        setUserRecordatorios(prev => prev.filter(id => id !== oracionId));
        toast.info('Eliminado de tus recordatorios');
      }
    } catch (error) {
      toast.error('Error al actualizar recordatorio');
    }
  };

  const handleCreateOracion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para pedir oración');
      return;
    }

    try {
      await api.post('/oraciones/', {
        ...newOracion,
        id_user: user.id,
        estado: 1
      });
      toast.success('Petición de oración enviada');
      setShowModal(false);
      setNewOracion({ titulo: '', contenido: '', tags: [], duracion_dias: 30, anonima: false });
      fetchOraciones();
    } catch (error) {
      toast.error('Error al enviar la oración');
    }
  };

  const toggleTag = (tagName: string) => {
    setNewOracion(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName) 
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }));
  };

  // Define if the author is an official (admin/pastor)
  const isOfficial = (o: Oracion) => 
    (o as any).anonima ? false : (o as any).autor_roles?.some((r: string) => r === 'administrador' || r === 'pastor');

  // Filter oraciones based on selected tag
  const filteredOraciones = activeFilter 
    ? oraciones.filter(o => o.tags?.includes(activeFilter))
    : oraciones;

  return (
    <div className="min-h-screen bg-church-dark pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <span className="text-church-terracotta font-bold uppercase tracking-[.3em] text-xs mb-3 block">Muro de Intercesión</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white">Cadena de Oración</h1>
            <p className="text-white/50 mt-4 max-w-xl">
              "Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos." 
              Comparte tu carga con nosotros o únete en oración por los demás.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-church-terracotta text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-church-terracotta/90 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            Pedir Oración
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-12 border-b border-white/5 pb-8">
           <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest mr-2">Filtrar por tema:</span>
           <button 
             onClick={() => setActiveFilter(null)}
             className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === null ? 'bg-white text-church-dark shadow-lg shadow-white/10' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
           >
             TODAS
           </button>
           {oracionTags.map(tag => (
              <button 
                key={tag.id}
                onClick={() => setActiveFilter(activeFilter === tag.nombre ? null : tag.nombre)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  activeFilter === tag.nombre 
                  ? 'bg-church-terracotta border-church-terracotta text-white shadow-lg shadow-church-terracotta/20' 
                  : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                }`}
              >
                {tag.nombre.toUpperCase()}
              </button>
           ))}
        </div>

        {/* Grid of Prayers */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {filteredOraciones.map((o) => (
              <div 
                key={o.id} 
                onClick={() => setViewingOracion(o)}
                className={`break-inside-avoid border rounded-2xl p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                  isOfficial(o) 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-church-beige border-white/10 hover:border-church-terracotta/30'
                }`}
              >
                {/* Decorative Quote Mark */}
                <div className={`absolute top-4 right-6 text-8xl font-serif select-none pointer-events-none ${
                   isOfficial(o) ? 'text-blue-200/40' : 'text-church-terracotta/10'
                }`}>"</div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                      {o.tags?.map(tag => (
                        <span key={tag} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                          isOfficial(o) ? 'bg-blue-100/50 text-blue-700' : 'bg-church-olive/10 text-church-olive'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    {isOfficial(o) && (
                       <span className="bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm animate-pulse">OFICIAL</span>
                    )}
                  </div>
                  <h3 className={`text-xl font-serif mb-4 leading-tight ${isOfficial(o) ? 'text-blue-900' : 'text-church-olive'}`}>{o.titulo}</h3>
                  <p className={`leading-relaxed italic mb-6 line-clamp-6 ${isOfficial(o) ? 'text-blue-800/80' : 'text-gray-600'}`}>
                    "{o.contenido}"
                  </p>
                </div>

                <div className={`pt-6 border-t flex items-center justify-between ${isOfficial(o) ? 'border-blue-100' : 'border-gray-100'}`}>
                  <div>
                    <span className={`block text-xs font-bold uppercase tracking-widest ${isOfficial(o) ? 'text-blue-900' : 'text-gray-400'}`}>{o.autor}</span>
                    <span className="text-[10px] text-gray-400">{new Date(o.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={(e) => handleToggleReminder(e, o.id)}
                    className={`flex items-center space-x-1 transition-all hover:scale-110 ${
                      userRecordatorios.includes(o.id) 
                      ? 'text-amber-500 scale-105' 
                      : (isOfficial(o) ? 'text-blue-600' : 'text-church-terracotta')
                    }`}
                  >
                     <svg className="w-5 h-5 transition-all" fill={userRecordatorios.includes(o.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                     </svg>
                     <span className="text-[10px] font-black uppercase tracking-tighter">
                       {userRecordatorios.includes(o.id) ? 'Recordando' : 'Recordar'}
                     </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOraciones.length === 0 && (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-white text-xl font-serif mb-2">No hay oraciones en esta categoría</h3>
            <p className="text-white/40">{activeFilter ? `Sé el primero en pedir oración sobre ${activeFilter}` : 'Sé el primero en compartir tu petición'}</p>
          </div>
        )}
      </div>

      {/* Modern Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-church-dark/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 transform animate-in zoom-in slide-in-from-bottom-8 duration-500 overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-serif text-church-olive mb-2">Compartir Oración</h2>
            <p className="text-gray-500 text-sm mb-8">Tu petición será visible en el muro para que toda la comunidad ore por ti.</p>
            
            <form onSubmit={handleCreateOracion} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Motivo breve</label>
                <input 
                  required 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej: Salud de mi abuela, Nuevo trabajo..."
                  value={newOracion.titulo}
                  onChange={(e) => setNewOracion({...newOracion, titulo: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tu petición</label>
                <textarea 
                  required 
                  rows={4} 
                  className="form-input" 
                  placeholder="Cuéntanos por qué necesitas oración..."
                  value={newOracion.contenido}
                  onChange={(e) => setNewOracion({...newOracion, contenido: e.target.value})}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Duración (Días activos)</label>
                <div className="flex items-center space-x-4">
                   <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    step="1"
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-church-terracotta"
                    value={newOracion.duracion_dias}
                    onChange={(e) => setNewOracion({...newOracion, duracion_dias: Number(e.target.value)})}
                  />
                  <span className="bg-church-beige px-3 py-1 rounded-lg border border-gray-100 font-bold text-church-olive min-w-14 text-center">
                    {newOracion.duracion_dias}d
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="anonima"
                  className="w-5 h-5 text-church-terracotta border-gray-300 rounded focus:ring-church-terracotta"
                  checked={newOracion.anonima}
                  onChange={(e) => setNewOracion({...newOracion, anonima: e.target.checked})}
                />
                <div>
                  <label htmlFor="anonima" className="text-sm font-bold text-gray-700 block">Publicar de forma anónima</label>
                  <p className="text-[10px] text-gray-400">Tu nombre no será visible en el muro de oración.</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (Opcional)</label>
                <div className="flex flex-wrap gap-2">
                  {oracionTags.map(tag => (
                    <button 
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.nombre)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        newOracion.tags.includes(tag.nombre) 
                        ? 'bg-church-olive text-white border-church-olive' 
                        : 'bg-church-beige text-gray-500 border-gray-100 hover:border-church-olive/30'
                      }`}
                    >
                      {tag.nombre.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-ghost font-bold py-4 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary py-4 rounded-xl"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prayer Detail Modal */}
      {viewingOracion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-church-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div 
             className={`relative w-full max-w-2xl rounded-3xl p-12 transition-all shadow-3xl animate-in zoom-in duration-300 border ${
               isOfficial(viewingOracion) ? 'bg-blue-50 border-blue-200' : 'bg-church-beige border-white/20'
             }`}
           >
              {/* Close button */}
              <button 
                onClick={() => setViewingOracion(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="mb-8 flex flex-wrap gap-3">
                 {viewingOracion.tags?.map(tag => (
                    <span key={tag} className={`text-[12px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                       isOfficial(viewingOracion) ? 'bg-blue-100 text-blue-700' : 'bg-church-olive text-white'
                    }`}>
                      {tag}
                    </span>
                 ))}
                 {isOfficial(viewingOracion) && (
                    <span className="bg-blue-600 text-white text-[12px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-md">Cuenta Oficial</span>
                 )}
              </div>

              <h2 className={`text-4xl font-serif mb-8 leading-tight ${isOfficial(viewingOracion) ? 'text-blue-900' : 'text-church-olive'}`}>
                {viewingOracion.titulo}
              </h2>

              <div className="max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                <p className={`text-xl leading-relaxed italic whitespace-pre-wrap ${isOfficial(viewingOracion) ? 'text-blue-800/80' : 'text-gray-700'}`}>
                  "{viewingOracion.contenido}"
                </p>
              </div>

              <div className={`mt-12 pt-8 border-t flex items-center justify-between ${isOfficial(viewingOracion) ? 'border-blue-100' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${isOfficial(viewingOracion) ? 'bg-blue-600 text-white' : 'bg-church-olive text-white'}`}>
                    {viewingOracion.autor.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className={`block text-lg font-bold ${isOfficial(viewingOracion) ? 'text-blue-900' : 'text-church-olive'}`}>
                      {viewingOracion.autor}
                    </span>
                    <span className="text-sm text-gray-400">Publicado el {new Date(viewingOracion.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <button className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all ${
                   isOfficial(viewingOracion) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-church-terracotta text-white hover:bg-church-terracotta/90'
                }`}>
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                   <span>Orar por esto</span>
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OracionesPage;
