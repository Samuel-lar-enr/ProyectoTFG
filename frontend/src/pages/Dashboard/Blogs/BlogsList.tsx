import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { useDashboard } from '../../../context/DashboardContext';

interface Blog {
  id: number;
  titulo: string;
  autor: string;
  id_user?: number;
  contenido?: string;
  imagen?: string;
  tags?: string[];
  fecha_creacion: string;
  estado: number;
}

const BlogsList: React.FC = () => {
  const { user } = useAuth();
  const { users: usersList, tags: allTags } = useDashboard();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [modalAuthorId, setModalAuthorId] = useState<number>(0);
  const [authorSearch, setAuthorSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // States for Tags selection
  const [tagSearch, setTagSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const blogTags = allTags.filter(t => t.tipo === 'blog');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSaveBlog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Asignar el autor elegido o el usuario que esta creandolo por defecto
    const payload: any = {
      ...data,
      id_user: modalAuthorId ? modalAuthorId.toString() : (user?.id || 1).toString(),
      tags: selectedTags
    };

    // Eliminar 'autor' que pusimos dummy si existiera
    if (payload.autor !== undefined) {
      delete payload.autor;
    }

    try {
      if (editingBlog) {
        await api.put(`/blogs/${editingBlog.id}`, payload);
        toast.success('Blog actualizado');
      } else {
        await api.post('/blogs/', payload);
        toast.success('Blog creado');
      }
      setShowModal(false);
      resetModalStates();
      fetchBlogs();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar.');
      setShowModal(false);
    }
  };

  const resetModalStates = () => {
    setEditingBlog(null);
    setModalAuthorId(user?.id || 0);
    setAuthorSearch('');
    setIsDropdownOpen(false);
    setSelectedTags([]);
    setTagSearch('');
    setIsTagDropdownOpen(false);
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs/');
      if (response.data && Array.isArray(response.data.data)) {
        setBlogs(response.data.data);
      } else if (Array.isArray(response.data)) {
        setBlogs(response.data);
      } else {
         setBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching blogs", error);
      toast.error('Grave problema al cargar blogs.');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este blog?')) {
      try {
        await api.delete(`/blogs/${id}`);
        toast.success('Blog eliminado correctamente');
        fetchBlogs();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.id.toString().includes(searchTerm) || 
    b.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(b.fecha_creacion).toLocaleDateString().includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Gestión de Blogs</h2>
        <button onClick={() => { setEditingBlog(null); setModalAuthorId(user?.id || 0); setAuthorSearch(''); setShowModal(true); setIsDropdownOpen(false); }} className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 font-bold text-sm shadow-sm transition-colors">
          + Nuevo Blog
        </button>
      </div>

      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar por ID, Título o Fecha..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-church-olive/20 focus:border-church-olive transition-all bg-gray-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-church-beige/30 text-xs uppercase font-bold text-church-olive">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Autor</th>
                <th className="px-6 py-4">Fecha Creación</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Cargando datos...</td></tr>
              ) : filteredBlogs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No se encontraron resultados.</td></tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">#{blog.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{blog.titulo}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span>{blog.autor}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(blog.fecha_creacion).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex justify-center space-x-3">
                      <button onClick={() => { 
                        setEditingBlog(blog); 
                        setModalAuthorId(blog.id_user || user?.id || 0); 
                        setAuthorSearch(''); 
                        setSelectedTags(blog.tags || []);
                        setShowModal(true); 
                        setIsDropdownOpen(false); 
                      }} className="text-blue-500 hover:text-blue-700 transition-colors tooltip" title="Editar">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(blog.id)} className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Borrar">
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-serif text-church-olive mb-4">
              {editingBlog ? 'Editar Blog' : 'Crear Blog'}
            </h3>
            <form onSubmit={handleSaveBlog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input required type="text" name="titulo" defaultValue={editingBlog?.titulo} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input type="text" name="imagen" defaultValue={editingBlog?.imagen} placeholder="https://ejemplo.com/imagen.jpg" className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive text-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Autor Asignado</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(() => {
                    const authorUser = usersList.find(u => u.id === modalAuthorId) || (user?.id === modalAuthorId ? user : null);
                    const authorName = authorUser ? authorUser.username : (editingBlog?.autor || 'Desconocido');
                    return (
                      <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                        <span>{authorName.toUpperCase()}</span>
                        <button type="button" className="text-blue-500 rounded-full w-4 h-4 flex items-center justify-center font-bold ml-1 pointer-events-none">
                          ✓
                        </button>
                      </span>
                    );
                  })()}
                </div>
                <div className="relative">
                  <input 
                      type="text" 
                      placeholder="Escribe el nombre del nuevo autor..." 
                      value={authorSearch}
                      onChange={(e) => {
                        setAuthorSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-church-olive focus:border-church-olive text-sm bg-white shadow-sm"
                  />
                  {isDropdownOpen && (
                    <div className="absolute z-60 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {usersList.filter(u => u.id !== modalAuthorId && u.username.toLowerCase().includes(authorSearch.toLowerCase())).map(u => (
                          <div 
                              key={u.id}
                              className="px-3 py-2 cursor-pointer hover:bg-church-beige hover:text-church-olive text-sm font-medium border-b border-gray-0:50 last:border-0"
                              onClick={() => {
                                setModalAuthorId(u.id);
                                setAuthorSearch('');
                                setIsDropdownOpen(false);
                              }}
                          >
                              {u.username} <span className="text-gray-400 font-normal text-xs">(ID: {u.id})</span>
                          </div>
                        ))}
                        {usersList.filter(u => u.id !== modalAuthorId && u.username.toLowerCase().includes(authorSearch.toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 italic">No hay resultados</div>
                        )}
                    </div>
                  )}
                </div>
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
                    {blogTags.filter(t => t.nombre.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t.nombre)).map(t => (
                      <div key={t.id} className="px-3 py-2 cursor-pointer hover:bg-church-beige hover:text-church-olive text-sm font-medium border-b border-gray-50 last:border-0" onClick={() => { setSelectedTags([...selectedTags, t.nombre]); setIsTagDropdownOpen(false); setTagSearch(''); }}>
                        {t.nombre}
                      </div>
                    ))}
                    {blogTags.filter(t => t.nombre.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t.nombre)).length === 0 && (
                       <div className="px-3 py-2 text-xs text-gray-400 italic">No hay más tags disponibles</div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea rows={5} name="contenido" defaultValue={editingBlog?.contenido} placeholder="Contenido del blog..." className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive"></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowModal(false); setEditingBlog(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-church-terracotta text-white rounded-md hover:bg-church-terracotta/90 transition-colors font-medium">
                  {editingBlog ? 'Guardar Cambios' : 'Publicar Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsList;
