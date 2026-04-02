import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { toast } from 'sonner';

interface Tag {
  id: number;
  nombre: string;
  tipo: string;
}

const TagsList: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleSaveTag = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingTag) {
        await api.put(`/tags/${editingTag.id}`, data);
        toast.success('Tag actualizado exitosamente');
      } else {
        await api.post('/tags/', data);
        toast.success('Tag creado exitosamente');
      }
      setShowModal(false);
      fetchTags();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar. Usando simulación local.');
      if (editingTag) {
        setTags(tags.map(t => t.id === editingTag.id ? { ...t, nombre: data.nombre as string, tipo: data.tipo as string } : t));
      } else {
        setTags([{ id: Date.now(), nombre: data.nombre as string, tipo: data.tipo as string }, ...tags]);
      }
      setShowModal(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tags/');
      if (response.data && Array.isArray(response.data.data)) {
        setTags(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTags(response.data);
      } else {
        throw new Error('Formato de datos no válido');
      }
    } catch (error) {
      toast.error('Error al cargar tags. Utilizando datos de demostración...');
      setTags([
        { id: 1, nombre: 'Jóvenes', tipo: 'blog' },
        { id: 2, nombre: 'Estudio Bíblico', tipo: 'evento' },
        { id: 3, nombre: 'Sanidad', tipo: 'oracion' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Borrar definitivamente este tag?')) {
      try {
        await api.delete(`/tags/${id}`);
        toast.success('Tag eliminado');
        fetchTags();
      } catch (error) {
        toast.error('Error eliminando tag');
      }
    }
  };

  const filtered = tags.filter(t => 
    t.id.toString().includes(searchTerm) || 
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Gestión de Tags</h2>
        <button onClick={() => { setEditingTag(null); setShowModal(true); }} className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 font-bold text-sm shadow-sm transition-colors">
          + Nuevo Tag
        </button>
      </div>
      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar tag por ID, Nombre o Tipo..." 
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
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Tipo (Uso)</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Sin resultados.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">#{t.id}</td>
                    <td className="px-6 py-4 font-medium text-church-dark">
                       <span className="px-3 py-1 bg-church-beige text-church-olive rounded-full text-xs font-bold border border-church-olive/10">
                         {t.nombre}
                       </span>
                    </td>
                    <td className="px-6 py-4 uppercase text-xs tracking-wider text-gray-500">{t.tipo}</td>
                    <td className="px-6 py-4 flex justify-center space-x-3">
                      <button onClick={() => { setEditingTag(t); setShowModal(true); }} className="text-blue-500 hover:text-blue-700 transition-colors tooltip" title="Editar">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Eliminar">
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 overflow-y-auto">
            <h3 className="text-xl font-bold font-serif text-church-olive mb-4">
              {editingTag ? 'Editar Tag' : 'Nuevo Tag'}
            </h3>
            <form onSubmit={handleSaveTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required type="text" name="nombre" defaultValue={editingTag?.nombre} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de uso</label>
                <select 
                  required 
                  name="tipo" 
                  defaultValue={editingTag?.tipo || 'blog'} 
                  className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive text-sm bg-white"
                >
                  <option value="blog">Blog</option>
                  <option value="evento">Evento</option>
                  <option value="oracion">Oración</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => { setShowModal(false); setEditingTag(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-church-terracotta text-white rounded-md hover:bg-church-terracotta/90 transition-colors">
                  {editingTag ? 'Guardar Cambios' : 'Crear Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsList;
