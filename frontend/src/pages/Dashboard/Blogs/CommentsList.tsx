import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { toast } from 'sonner';

interface Comentario {
  id: number;
  contenido: string;
  username: string;
  fecha_creacion: string;
  id_blog: number;
}

const CommentsList: React.FC = () => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComentarios();
  }, []);

  const fetchComentarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/comentarios/');
      if (response.data && Array.isArray(response.data.data)) {
        setComentarios(response.data.data);
      } else if (Array.isArray(response.data)) {
        setComentarios(response.data);
      } else {
        throw new Error('Formato inválido');
      }
    } catch (error) {
      toast.error('Error al cargar comentarios. Usando muestra...');
      setComentarios([
        { id: 101, contenido: 'Excelente publicación, me sirvió mucho.', username: 'juanperez', fecha_creacion: '2026-03-31T12:30:00Z', id_blog: 1 },
        { id: 102, contenido: 'Amen a esta palabra.', username: 'maria_g', fecha_creacion: '2026-04-01T08:15:00Z', id_blog: 2 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Borrar definitivamente este comentario?')) {
      try {
        await api.delete(`/comentarios/${id}`);
        toast.success('Comentario borrado');
        fetchComentarios();
      } catch (error) {
        toast.error('Error borrando comentario');
      }
    }
  };

  const filtered = comentarios.filter(c => 
    c.id.toString().includes(searchTerm) || 
    c.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(c.fecha_creacion).toLocaleDateString().includes(searchTerm)
  );

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-church-olive mb-6">Gestión de Comentarios</h2>
      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar comentario por ID, Usuario, Texto o Fecha..." 
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
                <th className="px-6 py-4">Comentario</th>
                <th className="px-6 py-4">Blog Ref.</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Sin resultados.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">#{c.id}</td>
                    <td className="px-6 py-4 font-medium text-church-dark">{c.username}</td>
                    <td className="px-6 py-4 italic truncate max-w-xs" title={c.contenido}>"{c.contenido}"</td>
                    <td className="px-6 py-4">#{c.id_blog}</td>
                    <td className="px-6 py-4">{new Date(c.fecha_creacion).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex justify-center space-x-3">
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Eliminar">
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
    </div>
  );
};

export default CommentsList;
