import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useDashboard } from '../context/DashboardContext';

interface Blog {
  id: number;
  id_user: number;
  autor: string;
  titulo: string;
  contenido: string;
  imagen?: string | null;
  fecha_creacion: string;
  estado: number;
  tags: string[];
  stats_reacciones: Record<string, number>;
  user_reaccion_ids: number[];
  n_comentarios: number;
}

interface Comentario {
  id: number;
  id_user: number;
  username: string;
  avatar: string | null;
  id_blog: number;
  id_padre: number | null;
  contenido: string;
  imagen: string | null;
  fecha_creacion: string;
  n_respuestas: number;
  estado: number;
}

interface RenderCommentProps {
  comment: Comentario;
  getCommentsTree: (parentId: number | null) => Comentario[];
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handleCreateComentario: (parentId: number | null) => void;
  handleDeleteComentario: (id: number) => void;
  level: number;
  user: any;
}

const RenderComment: React.FC<RenderCommentProps> = ({ 
  comment, 
  getCommentsTree, 
  replyingTo, 
  setReplyingTo, 
  replyText, 
  setReplyText, 
  handleCreateComentario,
  handleDeleteComentario,
  level,
  user
}) => {
  const replies = getCommentsTree(comment.id);
  const isReplying = replyingTo === comment.id;
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className={`${level === 0 ? 'bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100' : 'mt-6 ml-4 md:ml-10 border-l-2 border-church-beige pl-6 md:pl-10 relative'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`${level === 0 ? 'w-10 h-10' : 'w-8 h-8'} rounded-xl bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden`}>
            {comment.avatar ? (
              <img src={comment.avatar} alt={comment.username} className="w-full h-full object-cover" />
            ) : (
              <span className={`font-bold text-church-olive ${level === 0 ? 'text-base' : 'text-xs'}`}>
                {comment.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <span className={`block font-black uppercase tracking-widest text-church-olive ${level === 0 ? 'text-sm' : 'text-[11px]'}`}>
              {comment.username}
            </span>
            <span className="text-[10px] text-gray-400">{new Date(comment.fecha_creacion).toLocaleDateString()}</span>
          </div>
        </div>
        
        {user?.id === comment.id_user && (
          <button onClick={() => handleDeleteComentario(comment.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
      </div>
      
      <p className={`text-gray-700 leading-relaxed italic ${level === 0 ? 'mb-6 text-base' : 'mb-4 text-sm'}`}>
        "{comment.contenido}"
      </p>
      
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => {
            if (isReplying) {
              setReplyingTo(null);
            } else {
              setReplyingTo(comment.id);
              setReplyText("");
            }
          }}
          className="text-[10px] font-black uppercase tracking-widest text-church-terracotta hover:text-church-terracotta/70 transition-colors"
        >
          {isReplying ? 'CANCELAR RESPUESTA' : 'RESPONDER'}
        </button>

        {replies.length > 0 && (
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-church-olive transition-colors flex items-center space-x-1"
          >
            <span>{showReplies ? 'OCULTAR' : 'VER'} {replies.length} {replies.length === 1 ? 'RESPUESTA' : 'RESPUESTAS'}</span>
            <svg className={`w-3 h-3 transition-transform ${showReplies ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
        )}
      </div>

      {isReplying && (
        <div className="mt-4 flex space-x-3 animate-in slide-in-from-top-2 duration-300">
          <div className="w-8 h-8 rounded-lg bg-church-olive shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <textarea 
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-church-terracotta transition-all min-h-[80px]" 
              placeholder={`Responde a ${comment.username}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end mt-2">
              <button 
                onClick={() => handleCreateComentario(comment.id)}
                disabled={!replyText.trim()}
                className="bg-church-terracotta text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-church-terracotta/90 transition-all disabled:opacity-50"
              >
                Enviar respuesta
              </button>
            </div>
          </div>
        </div>
      )}

      {replies.length > 0 && showReplies && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {replies.map(reply => (
            <RenderComment 
              key={reply.id}
              comment={reply}
              getCommentsTree={getCommentsTree}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              handleCreateComentario={handleCreateComentario}
              handleDeleteComentario={handleDeleteComentario}
              level={level + 1}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BlogsPage: React.FC = () => {
  const { user } = useAuth();
  const { tags: allTags, refreshTags } = useDashboard();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reaccionesDisponibles, setReaccionesDisponibles] = useState<any[]>([]);

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [, setLoadingComentarios] = useState(false);
  const [newComentario, setNewComentario] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [blogData, setBlogData] = useState({
    titulo: '',
    contenido: '',
    imagen: '',
    tags: [] as string[]
  });
  
  const blogTags = allTags.filter(t => t.tipo === 'blog');

  const fetchBlogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/blogs/');
      const activeBlogs = (Array.isArray(res.data) ? res.data : res.data.data || []).filter((b: Blog) => b.estado === 1);
      setBlogs(activeBlogs);
      
      if (viewingBlog) {
        const updated = activeBlogs.find((b: Blog) => b.id === viewingBlog.id);
        if (updated) setViewingBlog(updated);
      }
    } catch (error) {
      if (!silent) toast.error('Error al cargar los blogs');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchComentarios = async (blogId: number) => {
    try {
      setLoadingComentarios(true);
      const res = await api.get(`/comentarios/?blog_id=${blogId}`);
      setComentarios(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error("Error al cargar comentarios", error);
    } finally {
      setLoadingComentarios(false);
    }
  };

  const fetchReacciones = async () => {
    try {
      const res = await api.get('/reacciones/');
      setReaccionesDisponibles(res.data);
    } catch (error) {
      console.error("Error al cargar reacciones", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchReacciones();
    refreshTags();
  }, []);

  useEffect(() => {
    if (viewingBlog) {
      fetchComentarios(viewingBlog.id);
    } else {
      setComentarios([]);
      setReplyingTo(null);
    }
  }, [viewingBlog]);

  const handleCreateOrUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Inicia sesión para publicar');

    try {
      if (editingBlog) {
        await api.put(`/blogs/${editingBlog.id}`, { ...blogData, id_user: user.id });
        toast.success('Entrada de blog actualizada');
      } else {
        await api.post('/blogs/', { ...blogData, id_user: user.id });
        toast.success('Entrada de blog publicada');
      }
      setShowModal(false);
      setEditingBlog(null);
      setBlogData({ titulo: '', contenido: '', imagen: '', tags: [] });
      fetchBlogs();
    } catch (error) {
      toast.error('Error al procesar el blog');
    }
  };

  const handleEditInit = (e: React.MouseEvent, blog: Blog) => {
    e.stopPropagation();
    setEditingBlog(blog);
    setBlogData({
      titulo: blog.titulo,
      contenido: blog.contenido,
      imagen: blog.imagen || '',
      tags: blog.tags
    });
    setShowModal(true);
  };

  const handleCreateComentario = async (idPadre: number | null = null) => {
    if (!user) return toast.error('Inicia sesión para comentar');
    if (!viewingBlog) return;

    const contenido = idPadre ? replyText : newComentario;
    if (!contenido.trim()) return;

    try {
      await api.post('/comentarios/', {
        id_blog: viewingBlog.id,
        id_user: user.id,
        id_padre: idPadre,
        contenido: contenido
      });
      
      if (idPadre) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setNewComentario('');
      }
      
      fetchComentarios(viewingBlog.id);
      fetchBlogs(true);
      toast.success('Comentario añadido');
    } catch (error) {
      toast.error('Error al añadir comentario');
    }
  };

  const handleDeleteComentario = async (id: number) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;
    try {
      await api.delete(`/comentarios/${id}`);
      setComentarios(prev => prev.filter(c => c.id !== id));
      fetchBlogs(true);
      toast.success('Comentario eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleReaccion = async (blogId: number, reaccionId: number, emoji: string) => {
    if (!user) return toast.error('Inicia sesión para reaccionar');
    
    setBlogs(prev => prev.map(b => {
      if (b.id !== blogId) return b;
      const newStats = { ...b.stats_reacciones };
      let newUsersIds = [...b.user_reaccion_ids];
      if (newUsersIds.includes(reaccionId)) {
        newStats[emoji] = Math.max(0, (newStats[emoji] || 1) - 1);
        newUsersIds = newUsersIds.filter(id => id !== reaccionId);
      } else {
        newStats[emoji] = (newStats[emoji] || 0) + 1;
        newUsersIds.push(reaccionId);
      }
      return { ...b, stats_reacciones: newStats, user_reaccion_ids: newUsersIds };
    }));

    try {
      await api.post('/reaccion_blog/', { id_user: user.id, id_blog: blogId, id_reaccion: reaccionId });
      fetchBlogs(true);
    } catch (error) {
      toast.error('Error al reaccionar');
      fetchBlogs(true);
    }
  };

  const isOfficial = (b: Blog) => b.autor === 'pastor' || b.autor === 'administrador';

  const filteredBlogs = useMemo(() => {
    let result = blogs;
    if (activeFilter === 'OFICIAL') {
      result = result.filter(b => isOfficial(b));
    } else if (activeFilter) {
      result = result.filter(b => b.tags?.includes(activeFilter));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.titulo.toLowerCase().includes(q) || b.contenido.toLowerCase().includes(q));
    }
    return result;
  }, [blogs, activeFilter, searchQuery]);

  const getCommentsTree = (parentId: number | null = null): Comentario[] => {
    return comentarios
      .filter(c => c.id_padre === parentId && c.estado !== 3)
      .sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime());
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <span className="text-church-terracotta font-bold uppercase tracking-[.3em] text-xs mb-3 block">Comunidad & Palabra</span>
            <h1 className="text-4xl md:text-5xl font-serif text-church-olive">Blog de la Iglesia</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar posts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-church-olive/20 transition-all w-64 shadow-inner"
                />
                <svg className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <button onClick={() => { setEditingBlog(null); setBlogData({titulo:'', contenido:'', imagen:'', tags:[]}); setShowModal(true); }} className="bg-church-olive text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-church-olive/90 transition-all shadow-lg text-sm">
                Nuevo Post
             </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-12 border-b pb-8">
           <button onClick={() => setActiveFilter(null)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === null ? 'bg-church-olive text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>TODOS</button>
           <button 
              onClick={() => setActiveFilter(activeFilter === 'OFICIAL' ? null : 'OFICIAL')} 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${activeFilter === 'OFICIAL' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-blue-50 border-blue-100 text-blue-400 hover:bg-blue-100'}`}
           >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              OFICIAL
           </button>
           {blogTags.map(tag => (
              <button key={tag.id} onClick={() => setActiveFilter(activeFilter === tag.nombre ? null : tag.nombre)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeFilter === tag.nombre ? 'bg-church-terracotta border-church-terracotta text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400'}`}>
                {tag.nombre.toUpperCase()}
              </button>
           ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-olive"></div></div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
             <p className="text-gray-400 font-serif text-xl italic">No se han encontrado mensajes con ese criterio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {filteredBlogs.map((b) => (
              <article key={b.id} onClick={() => setViewingBlog(b)} className="group cursor-pointer flex flex-col transition-all hover:translate-y-[-4px]">
                {b.imagen && (
                  <div className="aspect-video w-full rounded-3xl overflow-hidden mb-6 shadow-xl relative">
                    <img src={b.imagen} alt={b.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${isOfficial(b) ? 'bg-blue-600' : 'bg-church-olive'}`}>
                      {b.autor.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-church-olive">{b.autor}</span>
                      <span className="text-[10px] text-gray-400 block">{new Date(b.fecha_creacion).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {user?.id === b.id_user && (
                    <button onClick={(e) => handleEditInit(e, b)} className="p-2 text-gray-300 hover:text-church-terracotta transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  )}
                </div>
                <h2 className="text-3xl font-serif text-church-olive mb-3 group-hover:text-church-terracotta transition-colors">{b.titulo}</h2>
                <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6 font-light">{b.contenido}</p>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center space-x-4">
                       <div className="flex items-center space-x-2 text-gray-400">
                          <span className="text-[10px] font-bold">{Object.values(b.stats_reacciones).reduce((a, b) => a + b, 0)} ❤️</span>
                       </div>
                       <div className="flex items-center space-x-1 text-gray-400">
                          <span className="text-[10px] font-bold">{b.n_comentarios || 0} 💬</span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       {b.tags.map(tag => <span key={tag} className="text-[9px] font-bold uppercase tracking-widest text-church-terracotta">#{tag}</span>)}
                    </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {viewingBlog && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-right duration-500">
          <div className="min-h-screen flex flex-col items-center">
            <div className="max-w-4xl w-full py-20 px-8 relative">
              <button onClick={() => setViewingBlog(null)} className="fixed top-8 right-8 md:top-12 md:right-12 p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-all font-bold z-50 shadow-sm border border-gray-100">✕</button>
              
              <header className="mb-12">
                <div className="flex flex-wrap gap-2 mb-8 uppercase tracking-widest text-[10px] font-black text-church-terracotta">
                  {viewingBlog.tags.map(t => <span key={t}>{t}</span>)}
                </div>
                <h1 className="text-4xl md:text-7xl font-serif text-church-olive mb-8 leading-tight italic">{viewingBlog.titulo}</h1>
                {viewingBlog.imagen && (
                  <div className="aspect-video w-full rounded-3xl overflow-hidden mb-12 shadow-2xl">
                    <img src={viewingBlog.imagen} alt={viewingBlog.titulo} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center space-x-4 border-t border-gray-100 pt-8">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${isOfficial(viewingBlog) ? 'bg-blue-600' : 'bg-church-olive'}`}>{viewingBlog.autor.charAt(0).toUpperCase()}</div>
                  <div>
                    <span className="block font-bold text-church-olive">{viewingBlog.autor}</span>
                    <span className="text-xs text-gray-400">{new Date(viewingBlog.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                </div>
              </header>

              <div className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-20 whitespace-pre-wrap font-light italic opacity-90">{viewingBlog.contenido}</div>

              <footer className="border-t border-gray-100 pt-12">
                <div className="mb-12 flex flex-wrap gap-3">
                  {reaccionesDisponibles.map(r => (
                    <button key={r.id} onClick={() => handleReaccion(viewingBlog.id, r.id, r.emoji)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${viewingBlog.user_reaccion_ids?.includes(r.id) ? 'bg-church-olive text-white border-church-olive' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                      <span>{r.emoji}</span>
                      <span className="text-xs font-bold">{viewingBlog.stats_reacciones[r.emoji] || 0}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-gray-50 -mx-8 px-8 py-16 rounded-t-[3rem]">
                  <h3 className="text-2xl font-serif text-church-olive mb-12">Conversación ({viewingBlog.n_comentarios || 0})</h3>
                  <div className="mb-8 flex space-x-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-church-terracotta shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm">{user?.username?.charAt(0).toUpperCase() || '?'}</div>
                    <div className="flex-1 relative">
                      <textarea className="w-full bg-white border border-gray-100 rounded-2xl p-4 pr-12 text-base shadow-sm focus:ring-1 focus:ring-church-terracotta transition-all min-h-[56px] resize-none overflow-hidden" placeholder="Añade un comentario..." value={newComentario} onChange={(e) => setNewComentario(e.target.value)} />
                      <button onClick={() => handleCreateComentario()} disabled={!newComentario.trim()} className="absolute right-2 bottom-2 p-2 bg-church-olive text-white rounded-lg transition-all disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {getCommentsTree(null).map(comment => (
                      <RenderComment key={comment.id} comment={comment} getCommentsTree={getCommentsTree} replyingTo={replyingTo} setReplyingTo={setReplyingTo} replyText={replyText} setReplyText={setReplyText} handleCreateComentario={handleCreateComentario} handleDeleteComentario={handleDeleteComentario} level={0} user={user} />
                    ))}
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-church-olive/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-serif text-church-olive mb-8">{editingBlog ? 'Editar Entrada' : 'Escribir nueva entrada'}</h2>
            <form onSubmit={handleCreateOrUpdateBlog} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Título del Post</label>
                <input required type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-church-terracotta text-xl" placeholder="Escribe algo inspirador..." value={blogData.titulo} onChange={e => setBlogData({...blogData, titulo: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Imagen de Portada (URL)</label>
                <input type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-church-terracotta text-sm" placeholder="URL de la imagen (Unsplash, etc...)" value={blogData.imagen} onChange={e => setBlogData({...blogData, imagen: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Contenido</label>
                <textarea required rows={6} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-church-terracotta text-lg" placeholder="Desarrolla tu mensaje aquí..." value={blogData.contenido} onChange={e => setBlogData({...blogData, contenido: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Categorías</label>
                <div className="flex flex-wrap gap-2">
                  {blogTags.map(tag => (
                    <button key={tag.id} type="button" onClick={() => {
                      const exists = blogData.tags.includes(tag.nombre);
                      setBlogData({...blogData, tags: exists ? blogData.tags.filter(t => t !== tag.nombre) : [...blogData.tags, tag.nombre]});
                    }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${blogData.tags.includes(tag.nombre) ? 'bg-church-terracotta border-church-terracotta text-white' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300'}`}>{tag.nombre}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingBlog(null); }} className="px-8 py-4 text-gray-400 font-bold uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="bg-church-terracotta text-white px-10 py-4 rounded-xl font-bold uppercase shadow-lg hover:bg-church-terracotta/90 transition-all">{editingBlog ? 'Guardar Cambios' : 'Publicar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsPage;
