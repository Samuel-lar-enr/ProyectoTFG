import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { toast } from 'sonner';

interface Rol {
  id: number;
  nombre: string;
}

const RolesList: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roles/');
      if (res.data && Array.isArray(res.data.data)) {
        setRoles(res.data.data);
      } else if (Array.isArray(res.data)) {
        setRoles(res.data);
      }
    } catch (error) {
      toast.error('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingRol) {
        await api.put(`/roles/${editingRol.id}`, data);
        toast.success('Rol actualizado');
      } else {
        await api.post('/roles/', data);
        toast.success('Rol creado');
      }
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar este rol?')) {
      try {
        await api.delete(`/roles/${id}`);
        toast.success('Rol eliminado');
        fetchRoles();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const filtered = roles.filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Roles de Sistema</h2>
        <button onClick={() => { setEditingRol(null); setShowModal(true); }} className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 transition-colors shadow-sm font-bold text-sm">
          + Nuevo Rol
        </button>
      </div>

      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar rol..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-church-olive/20 bg-gray-50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-church-beige/30 text-xs uppercase font-bold text-church-olive">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nombre del Rol</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-gray-400 font-mono">#{r.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{r.nombre}</td>
                <td className="px-6 py-4 flex justify-center space-x-3">
                  <button onClick={() => { setEditingRol(r); setShowModal(true); }} className="text-blue-500 hover:text-blue-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-serif text-church-olive mb-4">{editingRol ? 'Editar Rol' : 'Nuevo Rol'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required type="text" name="nombre" defaultValue={editingRol?.nombre} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-church-terracotta text-white rounded-md hover:bg-church-terracotta/90 transition-colors font-medium">{editingRol ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesList;
