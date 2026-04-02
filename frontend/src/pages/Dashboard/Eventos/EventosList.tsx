import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { useDashboard } from '../../../context/DashboardContext';

interface Evento {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  id_area: number;
  aforo_max: number;
}

const EventosList: React.FC = () => {
  const { user } = useAuth();
  const { areas: areasList, tags: allTags } = useDashboard();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);

  // States for searchable Area selection
  const [areaSearch, setAreaSearch] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);

  // States for Tags selection
  const [tagSearch, setTagSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const eventTags = allTags.filter(t => t.tipo === 'evento');

  const handleSaveEvento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (!selectedAreaId) {
      toast.error('Por favor selecciona un Ministerio/Área de la lista.');
      return;
    }

    const payload: any = {
      ...data,
      id_user: (user?.id || 0).toString(),
      id_area: selectedAreaId.toString(),
      tags: selectedTags
    };

    // Data conversions
    if (!payload.fecha_fin) {
        delete payload.fecha_fin;
    }
    
    try {
      if (editingEvento) {
        await api.put(`/eventos/${editingEvento.id}`, payload);
        toast.success('Evento actualizado exitosamente');
      } else {
        await api.post('/eventos/', payload);
        toast.success('Evento creado exitosamente');
      }
      setShowModal(false);
      resetModalStates();
      fetchEventos();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar. Verifica los datos.');
      setShowModal(false);
    }
  };

  const resetModalStates = () => {
    setSelectedAreaId(null);
    setAreaSearch('');
    setIsAreaDropdownOpen(false);
    setSelectedTags([]);
    setTagSearch('');
    setIsTagDropdownOpen(false);
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/eventos/');
      if (response.data && Array.isArray(response.data.data)) {
        setEventos(response.data.data);
      } else if (Array.isArray(response.data)) {
        setEventos(response.data);
      } else {
        throw new Error('Formato de datos no válido');
      }
    } catch (error) {
      toast.error('Error al cargar eventos.');
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Borrar este evento?')) {
      try {
        await api.delete(`/eventos/${id}`);
        toast.success('Evento eliminado');
        fetchEventos();
      } catch (error) {
        toast.error('Error eliminando evento');
      }
    }
  };

  const getAreaName = (id: number) => {
    const area = areasList.find(a => a.id === id);
    return area ? area.nombre : `ID ${id}`;
  };

  const filtered = eventos.filter(e => 
    e.id.toString().includes(searchTerm) || 
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAreaName(e.id_area).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Gestión de Eventos</h2>
        <button onClick={() => { setEditingEvento(null); resetModalStates(); setShowModal(true); }} className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 font-bold text-sm shadow-sm transition-colors">
          + Nuevo Evento
        </button>
      </div>
      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar evento por ID, Título, Ministerio o Fecha..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-church-olive/20 focus:border-church-olive transition-all bg-gray-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-church-beige/30 text-xs uppercase font-bold text-church-olive">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Título del Evento</th>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Ministerio (Área)</th>
                <th className="px-6 py-4 text-center">Aforo Max</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Sin resultados.</td></tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">#{e.id}</td>
                    <td className="px-6 py-4 font-medium text-church-dark">{e.titulo}</td>
                    <td className="px-6 py-4">
                      {new Date(e.fecha_inicio).toLocaleDateString()} a las {new Date(e.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-bold text-[10px] uppercase border border-purple-100">
                         {getAreaName(e.id_area)}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs border border-blue-100">
                        {e.aforo_max || 'Ilimitado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center space-x-3">
                      <button onClick={() => { setEditingEvento(e); setSelectedAreaId(e.id_area); setShowModal(true); }} className="text-blue-500 hover:text-blue-700 transition-colors tooltip" title="Editar">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Eliminar">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-visible">
            <h3 className="text-xl font-bold font-serif text-church-olive mb-4">
              {editingEvento ? 'Editar Evento' : 'Nuevo Evento'}
            </h3>
            <form onSubmit={handleSaveEvento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input required type="text" name="titulo" defaultValue={editingEvento?.titulo} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive shadow-sm" />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Responsable</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedAreaId && (
                    <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 shadow-sm animate-in fade-in zoom-in duration-200">
                      <span>{getAreaName(selectedAreaId).toUpperCase()}</span>
                      <button type="button" onClick={() => setSelectedAreaId(null)} className="ml-1 text-purple-500 font-bold hover:text-purple-700">✕</button>
                    </span>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar área (Jóvenes, Alabanza...)" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-church-olive focus:border-church-olive text-sm shadow-sm"
                  value={areaSearch}
                  onChange={(e) => { setAreaSearch(e.target.value); setIsAreaDropdownOpen(true); }}
                  onFocus={() => setIsAreaDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsAreaDropdownOpen(false), 200)}
                />
                {isAreaDropdownOpen && (
                  <div className="absolute z-60 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-40 overflow-y-auto">
                    {areasList.filter(a => a.nombre.toLowerCase().includes(areaSearch.toLowerCase())).map(a => (
                      <div key={a.id} className="px-3 py-2 cursor-pointer hover:bg-church-beige hover:text-church-olive text-sm font-medium border-b border-gray-50 last:border-0" onClick={() => { setSelectedAreaId(a.id); setIsAreaDropdownOpen(false); setAreaSearch(''); }}>
                        {a.nombre} <span className="text-gray-400 text-xs font-normal">#{a.id}</span>
                      </div>
                    ))}
                    {areasList.filter(a => a.nombre.toLowerCase().includes(areaSearch.toLowerCase())).length === 0 && (
                       <div className="px-3 py-2 text-xs text-gray-400 italic">No se encontraron áreas</div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Etiquetas)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tagName => (
                    <span key={tagName} className="flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold bg-church-beige text-church-olive border border-church-olive/20 shadow-sm animate-in fade-in zoom-in duration-200">
                      <span>{tagName.toUpperCase()}</span>
                      <button type="button" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tagName))} className="ml-1 text-church-olive/60 hover:text-church-olive">✕</button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar tags..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-church-olive focus:border-church-olive text-sm shadow-sm"
                  value={tagSearch}
                  onChange={(e) => { setTagSearch(e.target.value); setIsTagDropdownOpen(true); }}
                  onFocus={() => setIsTagDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsTagDropdownOpen(false), 200)}
                />
                {isTagDropdownOpen && (
                  <div className="absolute z-60 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-40 overflow-y-auto">
                    {eventTags.filter(t => t.nombre.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t.nombre)).map(t => (
                      <div key={t.id} className="px-3 py-2 cursor-pointer hover:bg-church-beige hover:text-church-olive text-sm font-medium border-b border-gray-50 last:border-0" onClick={() => { setSelectedTags([...selectedTags, t.nombre]); setIsTagDropdownOpen(false); setTagSearch(''); }}>
                        {t.nombre}
                      </div>
                    ))}
                    {eventTags.filter(t => t.nombre.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t.nombre)).length === 0 && (
                       <div className="px-3 py-2 text-xs text-gray-400 italic">No hay más tags disponibles</div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea rows={2} name="descripcion" defaultValue={editingEvento?.descripcion} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive shadow-sm"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input required type="datetime-local" name="fecha_inicio" defaultValue={editingEvento?.fecha_inicio ? new Date(editingEvento.fecha_inicio).toISOString().slice(0,16) : ''} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (Opcional)</label>
                    <input type="datetime-local" name="fecha_fin" defaultValue={editingEvento?.fecha_fin ? new Date(editingEvento.fecha_fin).toISOString().slice(0,16) : ''} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aforo Max</label>
                    <input required type="number" name="aforo_max" defaultValue={editingEvento?.aforo_max || 100} min="1" className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
                  </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => { setShowModal(false); setEditingEvento(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-church-terracotta text-white rounded-md hover:bg-church-terracotta/90 transition-colors">
                  {editingEvento ? 'Guardar Cambios' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventosList;
