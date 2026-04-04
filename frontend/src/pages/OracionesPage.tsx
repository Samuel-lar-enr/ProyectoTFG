import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useDashboard } from '../context/DashboardContext';

interface Oracion {
  id: number;
  id_user: number;
  autor: string;
  autor_roles?: string[];
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  estado: number;
  tags: string[];
  anonima: boolean;
  duracion_dias: number;
}

const OracionesPage: React.FC = () => {
  const { user } = useAuth();
  const { tags: allTags, refreshTags } = useDashboard();
  const [oraciones, setOraciones] = useState<Oracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOracion, setEditingOracion] = useState<Oracion | null>(null);
  const [viewingOracion, setViewingOracion] = useState<Oracion | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRecordatorios, setUserRecordatorios] = useState<number[]>([]);
  
  const [formOracion, setFormOracion] = useState({
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
      const activeOraciones = (res.data.data || res.data).filter((o: Oracion) => o.estado === 1);
      setOraciones(activeOraciones);
      
      if (user) {
        const recRes = await api.get(`/recordatorios/?user_id=${user.id}`);
        setUserRecordatorios(recRes.data.map((r: any) => r.id_oracion));
      }
    } catch (error) {
      toast.error('Error al cargar las oraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOraciones();
    refreshTags();
  }, [user]);

  const handleToggleReminder = async (e: React.MouseEvent, oracionId: number) => {
    e.stopPropagation();
    if (!user) return toast.error('Debes iniciar sesión');

    try {
      const res = await api.post('/recordatorios/toggle', { id_user: user.id, id_oracion: oracionId });
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

  const handleCreateOrUpdateOracion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Inicia sesión');

    try {
      if (editingOracion) {
        await api.put(`/oraciones/${editingOracion.id}`, { ...formOracion, id_user: user.id });
        toast.success('Petición actualizada');
      } else {
        await api.post('/oraciones/', { ...formOracion, id_user: user.id, estado: 1 });
        toast.success('Petición enviada');
      }
      setShowModal(false);
      setEditingOracion(null);
      setFormOracion({ titulo: '', contenido: '', tags: [], duracion_dias: 30, anonima: false });
      fetchOraciones();
    } catch (error) {
      toast.error('Error al guardar la oración');
    }
  };

  const handleEditInit = (e: React.MouseEvent, oracion: Oracion) => {
    e.stopPropagation();
    setEditingOracion(oracion);
    setFormOracion({
      titulo: oracion.titulo,
      contenido: oracion.contenido,
      tags: oracion.tags || [],
      duracion_dias: oracion.duracion_dias || 30,
      anonima: oracion.anonima || false
    });
    setShowModal(true);
  };

  const handleDeleteOracion = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar esta petición de oración?')) return;

    try {
      await api.delete(`/oraciones/${id}`);
      setOraciones(prev => prev.filter(o => o.id !== id));
      toast.success('Oración eliminada');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const isOfficial = (o: Oracion) => 
    o.anonima ? false : o.autor_roles?.some(r => r === 'administrador' || r === 'pastor');

  const filteredOraciones = useMemo(() => {
    let result = oraciones;
    if (activeFilter === 'OFICIAL') {
      result = result.filter(o => isOfficial(o));
    } else if (activeFilter) {
      result = result.filter(o => o.tags?.includes(activeFilter));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => o.titulo.toLowerCase().includes(q) || o.contenido.toLowerCase().includes(q));
    }
    return result;
  }, [oraciones, activeFilter, searchQuery]);

  const toggleTag = (tagName: string) => {
    setFormOracion(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName) ? prev.tags.filter(t => t !== tagName) : [...prev.tags, tagName]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <span className="text-church-terracotta font-black uppercase tracking-widest text-[10px] mb-3 block">Muro de Intercesión</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white">Cadena de Oración</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar peticiones..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/5 border-none rounded-xl text-white text-sm focus:ring-2 focus:ring-church-terracotta/50 transition-all w-64 shadow-inner"
                />
                <svg className="w-4 h-4 absolute left-3 top-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <button onClick={() => { setEditingOracion(null); setFormOracion({titulo:'', contenido:'', tags:[], duracion_dias:30, anonima:false}); setShowModal(true); }} className="bg-church-terracotta text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-church-terracotta/90 transition-all shadow-xl text-sm">
                Pedir Oración
             </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-12 border-b pb-8">
           <button onClick={() => setActiveFilter(null)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === null ? 'bg-church-olive text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>TODOS</button>
           <button 
              onClick={() => setActiveFilter(activeFilter === 'OFICIAL' ? null : 'OFICIAL')} 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${activeFilter === 'OFICIAL' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-blue-50 border-blue-100 text-blue-400 hover:bg-blue-100'}`}
           >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              OFICIAL
           </button>
           {oracionTags.map(tag => (
              <button key={tag.id} onClick={() => setActiveFilter(activeFilter === tag.nombre ? null : tag.nombre)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeFilter === tag.nombre ? 'bg-church-terracotta border-church-terracotta text-white shadow-lg shadow-church-terracotta/20' : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'}`}>
                {tag.nombre.toUpperCase()}
              </button>
           ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div></div>
        ) : filteredOraciones.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
             <p className="text-white/40 font-serif text-xl italic">No hay peticiones en este momento.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {filteredOraciones.map((o) => (
              <div 
                key={o.id} 
                onClick={() => setViewingOracion(o)}
                className={`break-inside-avoid border rounded-2xl p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                  isOfficial(o) ? 'bg-blue-900/40 border-blue-500/30' : 'bg-slate-800/50 border-white/5 hover:border-church-terracotta/50'
                }`}
              >
                <div className={`absolute top-4 right-6 text-8xl font-serif select-none pointer-events-none opacity-5`}>"</div>
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-wrap gap-2">
                      {o.tags?.map(tag => (
                        <span key={tag} className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${isOfficial(o) ? 'bg-blue-500/20 text-blue-300' : 'bg-church-terracotta/20 text-church-terracotta'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-1">
                      {user?.id === o.id_user && (
                        <>
                          <button onClick={(e) => handleEditInit(e, o)} className="p-1.5 text-white/20 hover:text-white transition-colors bg-white/5 rounded-md"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                          <button onClick={(e) => handleDeleteOracion(e, o.id)} className="p-1.5 text-white/20 hover:text-red-400 transition-colors bg-white/5 rounded-md"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </>
                      )}
                    </div>
                  </div>
                  <h3 className={`text-xl font-serif mb-4 leading-tight text-white`}>{o.titulo}</h3>
                  <p className={`leading-relaxed italic mb-8 line-clamp-6 text-white/70 font-light`}>
                    "{o.contenido}"
                  </p>
                </div>

                <div className={`pt-6 border-t border-white/5 flex items-center justify-between`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isOfficial(o) ? 'bg-blue-600 text-white' : 'bg-church-terracotta text-white'}`}>
                      {o.autor.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-white/90">{o.autor}</span>
                      <span className="text-[9px] text-white/30">{new Date(o.fecha_creacion).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleToggleReminder(e, o.id)}
                    className={`flex items-center space-x-1.5 transition-all py-1.5 px-3 rounded-lg ${userRecordatorios.includes(o.id) ? 'bg-church-terracotta text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                     <svg className="w-4 h-4" fill={userRecordatorios.includes(o.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                     <span className="text-[10px] font-black uppercase tracking-tighter">{userRecordatorios.includes(o.id) ? 'Recordando' : 'Recordar'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 transform animate-in zoom-in duration-500 overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-serif text-slate-900 mb-2">{editingOracion ? 'Editar Petición' : 'Pedir Oración'}</h2>
            <p className="text-slate-400 text-sm mb-8">Nuestra comunidad se unirá bajo un mismo espíritu por tu petición.</p>
            <form onSubmit={handleCreateOrUpdateOracion} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Motivo breve</label>
                <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-church-terracotta text-slate-900" placeholder="Ej: Salud de mi hermano..." value={formOracion.titulo} onChange={e => setFormOracion({...formOracion, titulo: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Petición detallada</label>
                <textarea required rows={4} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-church-terracotta text-slate-900" placeholder="Comparte con confianza..." value={formOracion.contenido} onChange={e => setFormOracion({...formOracion, contenido: e.target.value})} />
              </div>
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input type="checkbox" id="anonimaForm" className="w-5 h-5 text-church-terracotta border-slate-300 rounded focus:ring-church-terracotta" checked={formOracion.anonima} onChange={e => setFormOracion({...formOracion, anonima: e.target.checked})} />
                <label htmlFor="anonimaForm" className="text-xs font-bold text-slate-600">Publicar de forma anónima</label>
              </div>
              <div className="form-group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {oracionTags.map(tag => (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.nombre)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${formOracion.tags.includes(tag.nombre) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}>{tag.nombre}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingOracion(null); }} className="px-8 py-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Cancelar</button>
                <button type="submit" className="bg-church-terracotta text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-church-terracotta/20 transition-all">{editingOracion ? 'Guardar Cambios' : 'Enviar Petición'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingOracion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className={`relative w-full max-w-2xl rounded-[3rem] p-12 transition-all shadow-3xl animate-in zoom-in duration-300 border ${isOfficial(viewingOracion) ? 'bg-blue-900/60 border-blue-500/50' : 'bg-slate-800/80 border-white/10'}`}>
              <button onClick={() => setViewingOracion(null)} className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">✕</button>
              <div className="mb-10 flex flex-wrap gap-3">
                 {viewingOracion.tags?.map(tag => <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-church-terracotta text-white shadow-lg">{tag}</span>)}
                 {isOfficial(viewingOracion) && <span className="bg-blue-600 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg">Cuenta Oficial</span>}
              </div>
              <h2 className="text-4xl md:text-5xl font-serif mb-10 leading-tight text-white">{viewingOracion.titulo}</h2>
              <p className="text-2xl leading-relaxed italic whitespace-pre-wrap text-white/80 font-light mb-12">"{viewingOracion.contenido}"</p>
              <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 rounded-2xl bg-church-terracotta text-white flex items-center justify-center font-bold text-2xl shadow-xl">{viewingOracion.autor.charAt(0).toUpperCase()}</div>
                  <div>
                    <span className="block text-xl font-bold text-white mb-1">{viewingOracion.autor}</span>
                    <span className="text-sm text-white/30 uppercase tracking-widest font-black">{new Date(viewingOracion.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="flex items-center space-x-3 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-church-terracotta hover:text-white transition-all shadow-2xl">
                   <span>Amén, me uno</span>
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OracionesPage;
