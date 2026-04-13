import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useDashboard } from '../context/DashboardContext';

interface Evento {
  id: number;
  id_user: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  aforo_max: number;
  estado: number;
  id_area: number;
  tags: string[];
  total_reservas: number;
}

const EventosPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { areas: areasList, refreshTags } = useDashboard();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [userReservas, setUserReservas] = useState<number[]>([]); 
  const [activeAreaFilter, setActiveAreaFilter] = useState<number | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_area: 0,
    aforo_max: 100,
    tags: [] as string[]
  });

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/eventos/');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setEventos(data);

      // Also fetch user's reservations if logged in
      if (user) {
        const resRes = await api.get('/reservas/');
        const resData = Array.isArray(resRes.data) ? resRes.data : resRes.data.data || [];
        const myReservas = resData
          .filter((r: any) => r.id_user === user.id && r.estado === 1)
          .map((r: any) => r.id_evento);
        setUserReservas(myReservas);
      }
    } catch (error) {
      toast.error('Error al cargar datos de eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    refreshTags();
  }, [user]);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);
    
    const result = [];
    for (let i = 0; i < offset; i++) result.push(null);
    for (let i = 1; i <= days; i++) result.push(new Date(year, month, i));
    
    return result;
  }, [currentDate]);

  const eventosFiltrados = useMemo(() => {
    let result = eventos;
    
    // Filtro por Ministerio
    if (activeAreaFilter) {
      result = result.filter(e => e.id_area === activeAreaFilter);
    }
    
    // Filtro por Pasados/Futuros
    if (!showPastEvents) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(e => new Date(e.fecha_inicio) >= today);
    }
    
    return result;
  }, [eventos, activeAreaFilter, showPastEvents]);

  const eventosPorDia = useMemo(() => {
    const map: Record<string, Evento[]> = {};
    eventosFiltrados.forEach(e => {
      const dateKey = new Date(e.fecha_inicio).toDateString();
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(e);
    });
    return map;
  }, [eventosFiltrados]);

  const selectedDayEventos = useMemo(() => {
    if (!selectedDate) return [];
    return eventosPorDia[selectedDate.toDateString()] || [];
  }, [selectedDate, eventosPorDia]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const canEdit = (e: Evento) => user?.id === e.id_user || user?.roles?.some((r: any) => {
    const roleName = (typeof r === 'string' ? r : r.nombre)?.toLowerCase();
    return roleName === 'administrador' || roleName === 'admin';
  });

  const isPrivileged = useMemo(() => {
    if (!user) return false;
    // Admin/Pastor always privileged
    const isAdmin = user.roles?.some((r: any) => {
      const roleName = (typeof r === 'string' ? r : r.nombre)?.toLowerCase();
      return ['administrador', 'admin', 'pastor'].includes(roleName || '');
    });
    if (isAdmin) return true;

    // Normal users privileged IF they have an ACTIVE Puesto
    return user.mis_puestos && user.mis_puestos.length > 0;
  }, [user]);

  const userAreas = useMemo(() => {
    if (!user) return [];
    const isAdmin = user.roles?.some((r: any) => {
      const roleName = (typeof r === 'string' ? r : r.nombre)?.toLowerCase();
      return ['administrador', 'admin', 'pastor'].includes(roleName || '');
    });
    
    // If Admin/Pastor, can see ALL areas
    if (isAdmin) return areasList;
    
    // Else, only their own areas
    const myAreaIds = user.mis_puestos?.map(p => p.id_area) || [];
    return areasList.filter(a => myAreaIds.includes(a.id));
  }, [user, areasList]);
  const handleConfirmActivity = async (id: number) => {
    try {
      await api.patch(`/eventos/${id}/confirmar`);
      toast.success('Actividad admitida y publicada');
      fetchEventos();
    } catch (error) {
      toast.error('Error al confirmar actividad');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Inicia sesión');
    
    try {
      const payload = { ...formData, id_user: user.id };
      if (editingEvento) {
        await api.put(`/eventos/${editingEvento.id}`, payload);
        toast.success('Evento actualizado');
      } else {
        await api.post('/eventos/', payload);
        toast.success('Evento creado');
      }
      setShowModal(false);
      fetchEventos();
    } catch (error) {
      toast.error('Error al guardar el evento');
    }
  };

  const handleToggleReserva = async (eventoId: number) => {
    if (!user) {
      toast.info('Inicia sesión para reservar tu plaza');
      return navigate('/login');
    }
    
    try {
      const res = await api.post('/reservas/', {
        id_user: user.id,
        id_evento: eventoId
      });
      
      if (res.data.action === 'added') {
        toast.success('¡Reserva confirmada!');
      } else {
        toast.info('Reserva cancelada');
      }
      fetchEventos();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al procesar reserva';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Borrar este evento?')) return;
    try {
      await api.delete(`/eventos/${id}`);
      toast.success('Evento eliminado');
      fetchEventos();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const openCreateModal = () => {
    if (!user) return navigate('/login');
    if (!isPrivileged) return toast.error('No tienes permiso para crear eventos');
    setEditingEvento(null);
    const initialDate = selectedDate ? new Date(selectedDate) : new Date();
    initialDate.setHours(10, 0, 0, 0);
    // Local date adjustment for datetime-local input
    const tzOffset = initialDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(initialDate.getTime() - tzOffset)).toISOString().slice(0, 16);
    
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_inicio: localISOTime,
      fecha_fin: '',
      id_area: userAreas[0]?.id || 0,
      aforo_max: 100,
      tags: []
    });
    setShowModal(true);
  };

  const openEditModal = (e: Evento) => {
    setEditingEvento(e);
    const dateStart = new Date(e.fecha_inicio);
    const tzOffset = dateStart.getTimezoneOffset() * 60000;
    const localStart = (new Date(dateStart.getTime() - tzOffset)).toISOString().slice(0, 16);
    
    setFormData({
      titulo: e.titulo,
      descripcion: e.descripcion,
      fecha_inicio: localStart,
      fecha_fin: e.fecha_fin ? (new Date(new Date(e.fecha_fin).getTime() - tzOffset)).toISOString().slice(0, 16) : '',
      id_area: e.id_area,
      aforo_max: e.aforo_max,
      tags: e.tags
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-church-beige pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-8">
          <div>
            <span className="text-church-terracotta font-bold uppercase tracking-[.3em] text-xs mb-3 block">Comunidad & Encuentros</span>
            <h1 className="text-4xl md:text-6xl font-serif text-church-olive">Calendario de Actividades</h1>
          </div>
          {(!user || isPrivileged) && (
            <button onClick={openCreateModal} className="btn-primary shadow-xl">
              Agendar Evento
            </button>
          )}
        </div>

        {/* Filtros dinámicos */}
        <div className="flex flex-wrap items-center gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveAreaFilter(null)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${!activeAreaFilter ? 'bg-church-olive text-white' : 'bg-white text-church-olive hover:bg-church-beige'}`}
          >
            Todos
          </button>
          {areasList.map(area => (
            <button 
              key={area.id}
              onClick={() => setActiveAreaFilter(area.id)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${activeAreaFilter === area.id ? 'bg-church-olive text-white' : 'bg-white text-church-olive hover:bg-church-beige'}`}
            >
              {area.nombre}
            </button>
          ))}
          
          <div className="flex items-center ml-auto bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 mr-3 uppercase tracking-wider">Ver Pasados</span>
            <button 
              onClick={() => setShowPastEvents(!showPastEvents)}
              className={`w-10 h-5 rounded-full relative transition-colors ${showPastEvents ? 'bg-church-terracotta' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showPastEvents ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <h2 className="text-2xl font-serif text-church-olive capitalize">
                {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-church-beige rounded-xl transition-all text-church-olive font-bold">←</button>
                <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-church-beige rounded-xl transition-all text-church-olive font-bold">→</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase text-gray-400 py-2">{day}</div>
              ))}
              {calendarDays.map((date, i) => {
                const dateKey = date?.toDateString();
                const hasEvent = dateKey && eventosPorDia[dateKey]?.length > 0;
                const isSelected = dateKey === selectedDate?.toDateString();
                const isToday = dateKey === new Date().toDateString();

                return (
                  <div 
                    key={i} 
                    onClick={() => date && setSelectedDate(date)}
                    className={`
                      aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all duration-300
                      ${!date ? 'pointer-events-none opacity-0' : ''}
                      ${isSelected ? 'bg-church-olive text-white shadow-xl scale-105 z-10' : 'hover:bg-church-beige text-gray-700'}
                      ${isToday && !isSelected ? 'border-2 border-church-terracotta text-church-terracotta font-bold' : ''}
                    `}
                  >
                    <span className="text-sm font-medium">{date?.getDate()}</span>
                    {hasEvent && (
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-church-terracotta'} ${isSelected ? '' : 'animate-pulse'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events Side List */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-church-terracotta mb-8 flex items-center">
                <span className="w-2 h-2 bg-church-terracotta rounded-full mr-2"></span>
                {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-church-olive"></div></div>
              ) : selectedDayEventos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <span className="text-5xl mb-4">⛪</span>
                  <p className="text-sm italic font-serif">
                    {activeAreaFilter ? 'No hay eventos de este ministerio hoy.' : 'Paz, no hay actividades programadas para este día.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayEventos.map(e => (
                    <div key={e.id} className={`p-6 rounded-2xl bg-white shadow-md border group relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${e.estado === 2 ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100/50 hover:-translate-y-1'}`}>
                      {e.estado === 2 ? (
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      ) : (
                        <div className="absolute top-0 left-0 w-1 h-full bg-church-olive opacity-20"></div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-sm ${e.estado === 2 ? 'bg-amber-100 text-amber-700' : 'bg-white text-church-olive'}`}>
                          {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center space-x-2">
                          {e.estado === 2 && isPrivileged && (
                             <button onClick={() => handleConfirmActivity(e.id)} className="bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-md hover:bg-amber-600 transition-colors">ADMITIR</button>
                          )}
                          {canEdit(e) && (
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditModal(e)} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">✎</button>
                              <button onClick={() => handleDelete(e.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">✕</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <h4 className="text-lg font-serif text-church-olive mb-2 leading-tight flex items-center gap-2">
                        {e.titulo}
                        {e.estado === 2 && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter shadow-sm border border-amber-200">Pendiente</span>}
                      </h4>
                      <p className="text-[13px] text-gray-500 line-clamp-2 italic mb-4">{e.descripcion}</p>
                      <div className="flex items-center justify-between mt-auto">
                         <span className="px-3 py-1 bg-white text-church-terracotta text-[9px] font-bold uppercase rounded-full shadow-sm">
                            {areasList.find(a => a.id === e.id_area)?.nombre || 'General'}
                         </span>
                         <div className="text-right">
                           <div className="text-[10px] font-bold text-church-olive mb-1">
                             {e.total_reservas} / {e.aforo_max} reservados
                           </div>
                           <button 
                            onClick={() => {
                              const isPast = new Date(e.fecha_inicio) < new Date();
                              if (isPast && !userReservas.includes(e.id)) return;
                              if (e.estado === 1) handleToggleReserva(e.id);
                            }}
                             className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 ${
                              e.estado === 2
                                ? 'bg-amber-100/50 text-amber-500 border border-amber-100 cursor-not-allowed italic'
                                : (new Date(e.fecha_inicio) < new Date() && !userReservas.includes(e.id))
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : userReservas.includes(e.id)
                                    ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white'
                                    : e.total_reservas >= e.aforo_max 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-church-olive text-white hover:bg-church-olive-dark'
                            }`}
                            disabled={e.estado === 2 || (new Date(e.fecha_inicio) < new Date() && !userReservas.includes(e.id)) || (!userReservas.includes(e.id) && e.total_reservas >= e.aforo_max)}
                           >
                             {e.estado === 2 ? 'Solo Lectura' : (new Date(e.fecha_inicio) < new Date() && !userReservas.includes(e.id)) ? 'Finalizado' : userReservas.includes(e.id) ? 'Anular Reserva' : e.total_reservas >= e.aforo_max ? 'Lleno' : 'Reservar Plaza'}
                           </button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Creación/Edición */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-church-olive/30 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-10 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
            <h2 className="text-3xl font-serif text-church-olive mb-8">{editingEvento ? 'Actualizar Evento' : 'Agendar Actividad'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Título del Evento</label>
                <input required className="form-input text-lg font-serif" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Pe. Culto Dominical, Reunión de Jóvenes..." />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea rows={3} className="form-input resize-none" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Indica detalles importantes del encuentro..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Fecha y Hora</label>
                  <input required type="datetime-local" className="form-input" value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Aforo Máximo</label>
                  <input required type="number" className="form-input" value={formData.aforo_max} onChange={e => setFormData({...formData, aforo_max: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ministerio Responsable</label>
                <select className="form-input" value={formData.id_area} onChange={e => setFormData({...formData, id_area: parseInt(e.target.value)})}>
                  <option value={0}>Selecciona un área...</option>
                  {userAreas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-gray-400 font-bold uppercase text-xs hover:text-gray-600 transition-colors">Cerrar</button>
                <button type="submit" className="btn-primary px-8">{editingEvento ? 'Guardar Cambios' : 'Agendar Evento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventosPage;
