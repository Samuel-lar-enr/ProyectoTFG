import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { toast } from 'sonner';
import { useDashboard } from '../../../context/DashboardContext';
import type { Puesto } from '../../../types/apiTypes';

const PuestosList: React.FC = () => {
  const { users, areas, loadingData } = useDashboard();
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingPuesto, setEditingPuesto] = useState<Puesto | null>(null);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const fetchPuestos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/puestos/');
      if (res.data && Array.isArray(res.data.data)) {
        setPuestos(res.data.data);
      } else if (Array.isArray(res.data)) {
        setPuestos(res.data);
      }
    } catch (error) {
      toast.error('Error al cargar la tabla de puestos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuestos();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUserId || !selectedAreaId) {
      toast.error('Debes seleccionar Usuario y Área');
      return;
    }

    const payload = {
      id_user: selectedUserId,
      id_area: selectedAreaId,
      requiere_confirmacion: (e.currentTarget.elements.namedItem('requiere_confirmacion') as HTMLInputElement).checked ? 1 : 0,
      estado: (e.currentTarget.elements.namedItem('estado') as HTMLSelectElement).value === '1' ? 1 : 0
    };

    try {
      if (editingPuesto) {
        await api.put(`/puestos/${editingPuesto.id}`, payload);
        toast.success('Puesto actualizado');
      } else {
        await api.post('/puestos/', payload);
        toast.success('Puesto asignado correctamente');
      }
      setShowModal(false);
      fetchPuestos();
    } catch (error) {
      toast.error('Error al guardar la asignación');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar esta asignación de puesto?')) {
      try {
        await api.delete(`/puestos/${id}`);
        toast.success('Asignación eliminada');
        fetchPuestos();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const getUserName = (id: number) => users.find(u => u.id === id)?.username || `User #${id}`;
  const getAreaName = (id: number) => areas.find(a => a.id === id)?.nombre || `Area #${id}`;

  const filtered = puestos.filter(p => 
    getUserName(p.id_user).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAreaName(p.id_area).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Puestos Estructurales</h2>
        <button onClick={() => { 
          setEditingPuesto(null); 
          setSelectedUserId(null); 
          setSelectedAreaId(null); 
          setShowModal(true); 
        }} className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 transition-colors shadow-sm font-bold text-sm">
          + Asignar Puesto
        </button>
      </div>

      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Filtrar por usuario, ministerio o rol..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-church-olive/20 bg-gray-50 transition-all font-medium text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-church-beige/30 text-xs uppercase font-bold text-church-olive">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Ministerio / Área</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading || loadingData ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Cargando datos estructurales...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">No hay puestos asignados.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{getUserName(p.id_user)}</div>
                  <div className="text-[10px] text-gray-400">ID Usuario: {p.id_user}</div>
                </td>
                <td className="px-6 py-4 uppercase text-xs font-bold text-purple-700">
                  <span className="bg-purple-50 px-2 py-1 rounded border border-purple-100">{getAreaName(p.id_area)}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.estado === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-center space-x-3 text-gray-400">
                  <button onClick={() => { 
                    setEditingPuesto(p); 
                    setSelectedUserId(p.id_user); 
                    setSelectedAreaId(p.id_area); 
                    setShowModal(true); 
                  }} className="text-blue-500 hover:text-blue-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-serif text-church-olive mb-4">
              {editingPuesto ? 'Editar Puesto' : 'Nueva Asignación de Puesto'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Buscador de Usuario */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <div className="mb-2">
                  {selectedUserId && (
                    <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                      <span>{getUserName(selectedUserId).toUpperCase()}</span>
                      <button type="button" onClick={() => setSelectedUserId(null)} className="text-blue-500 hover:text-red-500">✕</button>
                    </div>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="Escribir para buscar usuario..." 
                  className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive text-sm"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setIsUserDropdownOpen(true); }}
                  onFocus={() => setIsUserDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)}
                />
                {isUserDropdownOpen && (
                  <div className="absolute z-60 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-40 overflow-y-auto">
                    {users.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                      <div key={u.id} className="px-3 py-2 cursor-pointer hover:bg-church-beige hover:text-church-olive text-sm font-semibold border-b last:border-0" onClick={() => { setSelectedUserId(u.id); setIsUserDropdownOpen(false); setUserSearch(''); }}>
                        {u.username} <span className="text-gray-400 font-normal text-[10px]">#{u.id} - {u.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ministerio / Área</label>
                  <select required value={selectedAreaId || ''} onChange={e => setSelectedAreaId(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive text-sm bg-white">
                    <option value="">Seleccionar área...</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="requiere_confirmacion" name="requiere_confirmacion" defaultChecked={editingPuesto?.requiere_confirmacion} className="w-4 h-4 text-church-olive border-gray-300 rounded focus:ring-church-olive" />
                <label htmlFor="requiere_confirmacion" className="text-sm font-medium text-gray-700">Requiere confirmación del encargado</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de la Asignación</label>
                <select name="estado" defaultValue={editingPuesto?.estado || 1} className="w-full px-3 py-2 border rounded-md text-sm bg-white">
                  <option value="1">Activo</option>
                  <option value="0">Inactivo / En espera</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-church-terracotta text-white rounded-md transition-colors font-medium">
                  {editingPuesto ? 'Guardar Cambios' : 'Confirmar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuestosList;
