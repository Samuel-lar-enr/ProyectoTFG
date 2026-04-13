import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { getImageUrl } from '../utils/imageUtils';

type ActivityTab = 'reservas' | 'blogs' | 'oraciones' | 'siguiendo';

const PerfilPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityTab>('reservas');
  const [oraciones, setOraciones] = useState<any[]>((user as any)?.mis_oraciones || []);
  const [reanudando, setReanudando] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    notificaciones: user?.notificaciones || false,
    newPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewPastReservas, setViewPastReservas] = useState(false);

  if (!user) return null;

  const handleReanudar = useCallback(async (oraId: number) => {
    setReanudando(oraId);
    try {
      const res = await api.post(`/oraciones/${oraId}/reanudar`);
      const updated = res.data.oracion;
      setOraciones(prev => prev.map(o => o.id === oraId ? updated : o));
      toast.success('¡Oración reanudada! Volverá a aparecer en el muro.');
    } catch {
      toast.error('No se pudo reanudar la oración.');
    } finally {
      setReanudando(null);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('notificaciones', String(formData.notificaciones));
      
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      } else {
        formDataToSend.append('avatar', formData.avatar);
      }

      if (formData.newPassword) {
        formDataToSend.append('password', formData.newPassword);
      }

      await api.put(`/usuarios/${user.id}`, formDataToSend);
      await refreshUser();
      toast.success('¡Perfil actualizado correctamente!');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-church-beige pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Profile Info & Editing */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-32 bg-church-olive/10" />
               <div className="relative mt-8">
                 {previewUrl || user.avatar ? (
                    <img src={previewUrl || getImageUrl(user.avatar) || ''} alt="Avatar" className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover" />
                 ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-church-olive text-white flex items-center justify-center text-4xl font-serif border-4 border-white shadow-lg">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                 )}
                 <h2 className="text-3xl font-serif text-church-olive mt-6">{user.username}</h2>
                 <p className="text-sm text-gray-400 mt-1">{user.email}</p>
                 <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {user.roles?.map((r: any) => (
                        <span key={typeof r === 'string' ? r : r.nombre} className="px-3 py-1 bg-church-terracotta/10 text-church-terracotta text-[10px] font-black uppercase rounded-full tracking-widest">
                            {typeof r === 'string' ? r : r.nombre}
                        </span>
                    ))}
                 </div>
               </div>

               <form onSubmit={handleUpdate} className="mt-12 text-left space-y-5">
                  <div className="form-group">
                    <label className="form-label text-[10px]">Nombre de Usuario</label>
                    <input className="form-input bg-gray-50 border-transparent focus:bg-white" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-[10px]">Email</label>
                    <input className="form-input bg-gray-50 border-transparent focus:bg-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-[10px]">Imagen de Perfil</label>
                    <div className="mt-1 flex items-center space-x-3">
                        <label className="cursor-pointer bg-church-olive text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-church-olive/80 transition-all">
                            Seleccionar Archivo
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        {selectedFile && <span className="text-[9px] text-gray-500 truncate max-w-[150px]">{selectedFile.name}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-[10px]">Nueva Contraseña (opcional)</label>
                    <input type="password" className="form-input bg-gray-50 border-transparent focus:bg-white" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} placeholder="••••••••" />
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-church-beige/50 rounded-2xl">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, notificaciones: !formData.notificaciones})}
                        className={`w-10 h-5 rounded-full relative transition-colors ${formData.notificaciones ? 'bg-church-terracotta' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.notificaciones ? 'left-6' : 'left-1'}`} />
                    </button>
                    <span className="text-[10px] font-bold text-church-olive uppercase">Recibir Notificaciones</span>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full shadow-lg">
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
               </form>
            </div>
          </div>

          {/* User Content & Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Mis Blogs', count: (user as any).mis_blogs?.length || 0, icon: '📝' },
                  { label: 'Oraciones', count: oraciones.length || 0, icon: '🙏' },
                  { label: 'Reservas', count: (user as any).mis_reservas?.length || 0, icon: '📅' },
                  { label: 'Siguiendo', count: (user as any).mis_recordatorios?.length || 0, icon: '🔔' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl mb-2">{stat.icon}</span>
                        <span className="text-2xl font-serif text-church-olive">{stat.count}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Detailed Activity Tabs/Lists */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-serif text-church-olive">Actividad Reciente</h3>
                </div>

                {/* Tab Filters */}
                <div className="flex flex-wrap gap-2 mb-8 bg-church-beige/40 p-1.5 rounded-2xl">
                  {([
                    { key: 'reservas', label: 'Mis Reservas', icon: '📅' },
                    { key: 'blogs',    label: 'Mis Blogs',    icon: '📝' },
                    { key: 'oraciones',label: 'Oraciones',    icon: '🙏' },
                    { key: 'siguiendo',label: 'Siguiendo',    icon: '🔔' },
                  ] as { key: ActivityTab; label: string; icon: string }[]).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'bg-white shadow-md text-church-olive'
                          : 'text-gray-400 hover:text-church-olive'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Content by tab */}
                <div className="animate-in fade-in duration-300">

                  {/* RESERVAS */}
                  {activeTab === 'reservas' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-church-beige/20 p-4 rounded-2xl border border-church-olive/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          {viewPastReservas ? 'Historial de Asistencia' : 'Próximos Eventos'}
                        </span>
                        <button 
                          onClick={() => setViewPastReservas(!viewPastReservas)}
                          className="text-[10px] font-bold text-church-terracotta hover:underline uppercase tracking-widest"
                        >
                          {viewPastReservas ? 'Ver Próximos' : 'Ver Pasados'}
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {(() => {
                          const now = new Date();
                          const filtered = (user as any).mis_reservas?.filter((res: any) => {
                            const eventDate = new Date(res.fecha_evento);
                            return viewPastReservas ? eventDate < now : eventDate >= now;
                          });

                          if (!filtered || filtered.length === 0) {
                            return <p className="text-sm italic text-gray-400 col-span-2 py-4">
                              {viewPastReservas ? 'No tienes registros de asistencia pasados.' : 'No tienes próximas reservas.'}
                            </p>;
                          }

                          return filtered.map((res: any) => {
                            const isPast = new Date(res.fecha_evento) < now;
                            return (
                              <div
                                key={res.id}
                                onClick={() => navigate('/eventos')}
                                className={`p-4 rounded-2xl border transition-all flex justify-between items-center group cursor-pointer ${
                                  isPast 
                                    ? 'bg-gray-50 border-gray-100 opacity-80' 
                                    : 'bg-church-beige/30 border-transparent hover:border-church-olive/20 hover:bg-church-beige/60'
                                }`}
                              >
                                <div>
                                  <h5 className="text-sm font-bold text-church-olive group-hover:underline">{res.titulo_evento}</h5>
                                  <p className="text-[10px] text-gray-400">{new Date(res.fecha_evento).toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })}</p>
                                </div>
                                <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-lg shadow-sm ${
                                  isPast ? 'bg-gray-200 text-gray-600' : 'bg-green-50 text-green-600'
                                }`}>
                                  {isPast ? 'Asistido' : 'Confirmada'}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* BLOGS */}
                  {activeTab === 'blogs' && (
                    <div className="space-y-3">
                      {!(user as any).mis_blogs || (user as any).mis_blogs.length === 0 ? (
                        <p className="text-sm italic text-gray-400">Aún no has escrito ningún blog.</p>
                      ) : (
                        (user as any).mis_blogs?.map((blog: any) => (
                          <div
                            key={blog.id}
                            onClick={() => navigate('/blog')}
                            className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-lg bg-church-olive/10 flex items-center justify-center text-lg">📄</div>
                              <div>
                                <h5 className="text-sm font-bold text-church-olive group-hover:underline">{blog.titulo}</h5>
                                <p className="text-[10px] text-gray-400">{new Date(blog.fecha_creacion).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className="text-church-terracotta text-[10px] font-bold uppercase tracking-widest">Ver →</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ORACIONES */}
                  {activeTab === 'oraciones' && (
                    <div className="space-y-3">
                      {oraciones.length === 0 ? (
                        <p className="text-sm italic text-gray-400">No has publicado ninguna oración todavía.</p>
                      ) : (
                        oraciones.map((ora: any) => {
                          const caducada = ora.estado === 0;
                          return (
                            <div
                              key={ora.id}
                              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                caducada
                                  ? 'border-red-100 bg-red-50/40'
                                  : 'border-gray-100 hover:bg-gray-50 cursor-pointer group'
                              }`}
                              onClick={!caducada ? () => navigate('/oraciones') : undefined}
                            >
                              <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                                  caducada ? 'bg-red-100' : 'bg-church-terracotta/10'
                                }`}>
                                  {caducada ? '⏰' : '🙏'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className={`text-sm font-bold truncate ${
                                      caducada ? 'text-gray-400' : 'text-church-olive group-hover:underline'
                                    }`}>{ora.titulo}</h5>
                                    {caducada && (
                                      <span className="px-2 py-0.5 bg-red-100 text-red-500 text-[8px] font-black uppercase rounded-full tracking-widest flex-shrink-0">
                                        Finalizada
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-400">
                                    {caducada
                                      ? `Duración: ${ora.duracion_dias ?? '?'} día(s) · Creada: ${new Date(ora.fecha_creacion).toLocaleDateString()}`
                                      : new Date(ora.fecha_creacion).toLocaleDateString()
                                    }
                                  </p>
                                </div>
                              </div>
                              {caducada ? (
                                <button
                                  onClick={e => { e.stopPropagation(); handleReanudar(ora.id); }}
                                  disabled={reanudando === ora.id}
                                  className="ml-3 flex-shrink-0 px-3 py-1.5 bg-church-terracotta text-white text-[9px] font-black uppercase rounded-xl hover:bg-church-terracotta/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {reanudando === ora.id ? '...' : '🔄 Reanudar'}
                                </button>
                              ) : (
                                <span className="text-church-terracotta text-[10px] font-bold uppercase tracking-widest ml-3 flex-shrink-0">Ver →</span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* SIGUIENDO */}
                  {activeTab === 'siguiendo' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {!(user as any).mis_recordatorios || (user as any).mis_recordatorios.length === 0 ? (
                        <p className="text-sm italic text-gray-400 col-span-2">No tienes oraciones en seguimiento.</p>
                      ) : (
                        (user as any).mis_recordatorios?.map((rec: any) => (
                          <div
                            key={rec.id}
                            onClick={() => navigate('/oraciones')}
                            className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center space-x-3 hover:shadow-md cursor-pointer hover:border-church-olive/20 transition-all group"
                          >
                            <span className="text-2xl">🔔</span>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-church-olive line-clamp-1 group-hover:underline">{rec.titulo_oracion}</h5>
                              <p className="text-[9px] text-gray-400">Autor: {rec.autor_oracion}</p>
                            </div>
                            <span className="text-church-terracotta text-[9px] font-bold uppercase">Ver →</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;
