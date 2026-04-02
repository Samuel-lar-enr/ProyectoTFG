import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { toast } from 'sonner';

import { useDashboard } from '../../../context/DashboardContext';

interface Reaccion {
  id: number;
  tipo: string;
  username: string;
  id_blog: number;
}

const ReactionsList: React.FC = () => {
  const { users: usersList, blogs: blogsList } = useDashboard();
  const [reacciones, setReacciones] = useState<Reaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [availableReactions, setAvailableReactions] = useState<{id: number, emoji: string}[]>([]);

  // States for searchable User selection
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // States for searchable Blog selection
  const [blogSearch, setBlogSearch] = useState('');
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  const [isBlogDropdownOpen, setIsBlogDropdownOpen] = useState(false);

  useEffect(() => {
    fetchReacciones();
    fetchAvailableReactions();
  }, []);

  const fetchAvailableReactions = async () => {
    try {
      const res = await api.get('/reacciones/');
      setAvailableReactions(res.data);
    } catch (e) {
      console.error("Error loading reaction types", e);
    }
  };

  const fetchReacciones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reaccion_blog/');
      if (response.data && Array.isArray(response.data.data)) {
        setReacciones(response.data.data);
      } else if (Array.isArray(response.data)) {
        setReacciones(response.data);
      } else {
        throw new Error('Formato inválido');
      }
    } catch (error) {
      toast.error('Error al cargar reacciones.');
    } finally {
      setLoading(false);
    }
  };

  const getReaccionIcon = (tipo: string) => {
     return tipo || '👍';
  };

  const handleSaveReaccion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());
    
    if (!selectedBlogId || !selectedUserId) {
      toast.error('Por favor selecciona un Blog y un Usuario de la lista.');
      return;
    }

    const payload = {
       id_blog: selectedBlogId,
       id_user: selectedUserId,
       id_reaccion: parseInt(rawData.id_reaccion as string)
    };

    try {
      await api.post('/reaccion_blog/', payload);
      toast.success('Reacción guardada');
      setShowModal(false);
      resetModalStates();
      fetchReacciones();
    } catch (error) {
      toast.error('Error al guardar. Verifica la conexión.');
    }
  };

  const resetModalStates = () => {
    setSelectedBlogId(null);
    setSelectedUserId(null);
    setUserSearch('');
    setBlogSearch('');
    setIsUserDropdownOpen(false);
    setIsBlogDropdownOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Borrar esta reacción?')) {
      try {
        await api.delete(`/reaccion_blog/${id}`);
        toast.success('Reacción borrada');
        fetchReacciones();
      } catch (error) {
        toast.error('Error borrando reacción');
      }
    }
  };

  const filtered = reacciones.filter(r => 
    r.id.toString().includes(searchTerm) || 
    (r.tipo && r.tipo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id_blog.toString().includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Gestión de Reacciones</h2>
        <button 
          onClick={() => { resetModalStates(); setShowModal(true); }} 
          className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 font-bold text-sm shadow-sm transition-colors"
        >
          + Nueva Reacción
        </button>
      </div>

      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar por ID, Emoji, Usuario o Ref. Blog..." 
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
                <th className="px-6 py-4 text-center">Tipo</th>
                <th className="px-6 py-4">Ref. Blog</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Sin resultados reales en DB.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">#{r.id}</td>
                    <td className="px-6 py-4 font-medium text-church-dark">{r.username}</td>
                    <td className="px-6 py-4 text-center text-xl">{getReaccionIcon(r.tipo)}</td>
                    <td className="px-6 py-4">#{r.id_blog}</td>
                    <td className="px-6 py-4 flex justify-center space-x-3">
                      <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Eliminar">
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 overflow-visible">
            <h3 className="text-xl font-bold font-serif text-church-olive mb-4">Nueva Reacción</h3>
            <form onSubmit={handleSaveReaccion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Elegir Reacción</label>
                <select name="id_reaccion" required className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive text-sm bg-white">
                  {availableReactions.map(ar => (
                    <option key={ar.id} value={ar.id}>{ar.emoji} (ID: {ar.id})</option>
                  ))}
                  {availableReactions.length === 0 && <option value="1">👍 (Default)</option>}
                </select>
              </div>

              {/* Searchable Blog Select */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog Destino</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedBlogId && (
                    <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                      <span>BLOG #{selectedBlogId}: {blogsList.find(b => b.id === selectedBlogId)?.titulo.toUpperCase()}</span>
                      <button type="button" onClick={() => setSelectedBlogId(null)} className="ml-1 text-blue-500 font-bold hover:text-blue-700">✕</button>
                    </span>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar blog por título..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-church-olive focus:border-church-olive text-sm"
                  value={blogSearch}
                  onChange={(e) => { setBlogSearch(e.target.value); setIsBlogDropdownOpen(true); }}
                  onFocus={() => setIsBlogDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsBlogDropdownOpen(false), 200)}
                />
                {isBlogDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {blogsList.filter(b => b.titulo.toLowerCase().includes(blogSearch.toLowerCase())).map(b => (
                      <div key={b.id} className="px-3 py-2 cursor-pointer hover:bg-church-beige hover:text-church-olive text-sm border-b border-gray-50 last:border-0" onClick={() => { setSelectedBlogId(b.id); setIsBlogDropdownOpen(false); setBlogSearch(''); }}>
                        {b.titulo} <span className="text-gray-400 text-xs">#{b.id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Searchable User Select */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario que Reacciona</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedUserId && (
                    <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                      <span>USUARIO: {usersList.find(u => u.id === selectedUserId)?.username.toUpperCase()}</span>
                      <button type="button" onClick={() => setSelectedUserId(null)} className="ml-1 text-green-500 font-bold hover:text-green-700">✕</button>
                    </span>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar usuario por nombre..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-church-olive focus:border-church-olive text-sm"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setIsUserDropdownOpen(true); }}
                  onFocus={() => setIsUserDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)}
                />
                {isUserDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {usersList.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                      <div key={u.id} className="px-3 py-2 cursor-pointer hover:bg-church-beige hover:text-church-olive text-sm border-b border-gray-50 last:border-0" onClick={() => { setSelectedUserId(u.id); setIsUserDropdownOpen(false); setUserSearch(''); }}>
                        {u.username} <span className="text-gray-400 text-xs">ID: {u.id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowModal(false); resetModalStates(); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-church-terracotta text-white rounded-md hover:bg-church-terracotta/90 transition-colors font-medium">
                  Guardar Reacción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionsList;
