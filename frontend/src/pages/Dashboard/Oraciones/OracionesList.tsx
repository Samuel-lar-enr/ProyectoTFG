import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { useDashboard } from '../../../context/DashboardContext';

interface Oracion {
  id: number;
  id_user: number;
  autor: string;
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  duracion_dias?: number;
  estado: number;
}

const OracionesList: React.FC = () => {
  const { user } = useAuth();
  const { users: usersList, tags: allTags } = useDashboard();
  const [oraciones, setOraciones] = useState<Oracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingOracion, setEditingOracion] = useState<Oracion | null>(null);

  // States for searchable User selection
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // States for Tags selection
  const [tagSearch, setTagSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const oracionTags = allTags.filter(t => t.tipo === 'oracion');

  const handleSaveOracion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const userId = selectedUserId || user?.id || 0;
    
    const payload = {
      ...data,
      id_user: userId,
      duracion_dias: data.duracion_dias ? parseInt(data.duracion_dias as string) : null,
      estado: editingOracion ? editingOracion.estado : 1,
      tags: selectedTags
    };

    try {
      if (editingOracion) {
        await api.put(`/oraciones/${editingOracion.id}`, payload);
        toast.success('Oración actualizada');
      } else {
        await api.post('/oraciones/', payload);
        toast.success('Oración creada');
      }
      setShowModal(false);
      resetModalStates();
      fetchOraciones();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la oración.');
    }
  };

  const resetModalStates = () => {
    setEditingOracion(null);
    setSelectedUserId(null);
    setUserSearch('');
    setIsUserDropdownOpen(false);
    setSelectedTags([]);
    setTagSearch('');
    setIsTagDropdownOpen(false);
  };

  useEffect(() => {
    fetchOraciones();
  }, []);

  const fetchOraciones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/oraciones/');
      if (response.data && Array.isArray(response.data.data)) {
        setOraciones(response.data.data);
      } else if (Array.isArray(response.data)) {
        setOraciones(response.data);
      } else {
        throw new Error('Formato de datos no válido');
      }
    } catch (error) {
      toast.error('Error al cargar oraciones.');
      setOraciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Borrar esta oración?')) {
      try {
        await api.delete(`/oraciones/${id}`);
        toast.success('Oración eliminada');
        fetchOraciones();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const filtered = oraciones.filter(o => 
    o.id.toString().includes(searchTerm) || 
    o.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.autor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Gestión de Oraciones</h2>
        <button onClick={() => { resetModalStates(); setShowModal(true); }} className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 font-bold text-sm shadow-sm transition-colors">
          + Nueva Oración
        </button>
      </div>
      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar oración por ID, Título o Usuario..." 
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
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Plazo (Días)</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Sin resultados.</td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">#{o.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{o.autor}</td>
                    <td className="px-6 py-4">{o.titulo}</td>
                    <td className="px-6 py-4">{new Date(o.fecha_creacion).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                       {o.duracion_dias ? (
                         <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md font-bold text-xs border border-amber-100">
                           {o.duracion_dias} días
                         </span>
                       ) : (
                         <span className="text-gray-400 italic text-xs">Permanente</span>
                       )}
                    </td>
                    <td className="px-6 py-4 flex justify-center space-x-3">
                      <button onClick={() => { setEditingOracion(o); setSelectedUserId(o.id_user); setShowModal(true); }} className="text-blue-500 hover:text-blue-700 transition-colors tooltip" title="Editar">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(o.id)} className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Eliminar">
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 overflow-visible animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-serif text-church-olive mb-4">
              {editingOracion ? 'Editar Oración' : 'Nueva Oración'}
            </h3>
            <form onSubmit={handleSaveOracion} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor de la Oración</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedUserId && (
                    <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm animate-in fade-in zoom-in duration-200">
                      <span>{usersList.find(u => u.id === selectedUserId)?.username.toUpperCase() || 'AUTOR'}</span>
                      <button type="button" onClick={() => setSelectedUserId(null)} className="ml-1 text-green-500 font-bold hover:text-green-700">✕</button>
                    </span>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar usuario..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-church-olive focus:border-church-olive text-sm shadow-sm"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setIsUserDropdownOpen(true); }}
                  onFocus={() => setIsUserDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)}
                />
                {isUserDropdownOpen && (
                  <div className="absolute z-60 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-40 overflow-y-auto">
                    {usersList.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                      <div key={u.id} className="px-3 py-2 cursor-pointer hover:bg-church-beige hover:text-church-olive text-sm font-medium border-b border-gray-50 last:border-0" onClick={() => { setSelectedUserId(u.id); setIsUserDropdownOpen(false); setUserSearch(''); }}>
                        {u.username} <span className="text-gray-400 text-xs font-normal">ID: {u.id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Oración</label>
                <input required type="text" name="titulo" defaultValue={editingOracion?.titulo} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
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
                    {oracionTags.filter(t => t.nombre.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t.nombre)).map(t => (
                      <div key={t.id} className="px-3 py-2 cursor-pointer hover:bg-church-beige hover:text-church-olive text-sm font-medium border-b border-gray-50 last:border-0" onClick={() => { setSelectedTags([...selectedTags, t.nombre]); setIsTagDropdownOpen(false); setTagSearch(''); }}>
                        {t.nombre}
                      </div>
                    ))}
                    {oracionTags.filter(t => t.nombre.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t.nombre)).length === 0 && (
                       <div className="px-3 py-2 text-xs text-gray-400 italic">No hay más tags disponibles</div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (Días activa)</label>
                <input type="number" name="duracion_dias" defaultValue={editingOracion?.duracion_dias} placeholder="Ejem: 7 (Deja vacío para permanente)" className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive text-sm" min="1" />
                <p className="mt-1 text-[10px] text-gray-400">Pasado este tiempo, la oración pasará a estado inactivo (0) automáticamente.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detalle de la Oración</label>
                <textarea rows={3} required name="contenido" defaultValue={editingOracion?.contenido} placeholder="Escribe el fondo de la oración..." className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive text-sm" />
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowModal(false); resetModalStates(); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-church-terracotta text-white rounded-md hover:bg-church-terracotta/90 transition-colors font-medium">
                  {editingOracion ? 'Guardar Cambios' : 'Crear Oración'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OracionesList;
