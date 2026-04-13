import React, { useState } from 'react';
import { api } from '../../../services/api';
import { toast } from 'sonner';
import { useDashboard } from '../../../context/DashboardContext';
import { Button, Input, Modal, Badge } from '../../../components/ui';
import type { User } from '../../../types/apiTypes';

const UsersList: React.FC = () => {
  const { users, loadingData: loading, refreshUsers } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalRoles, setModalRoles] = useState<string[]>([]);
  const [roleToAdd, setRoleToAdd] = useState('');
  const [filter, setFilter] = useState<'all' | 'banned'>('all');

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Instead of using the text input, we use our state
    const rolesArray = modalRoles;

    try {
      if (editingUser) {
        // PUT request to update
        await api.put(`/usuarios/${editingUser.id}`, { ...data, roles: rolesArray });
        toast.success('Usuario actualizado correctamente');
      } else {
        // POST request to create USER.
        await api.post('/usuarios/', { ...data, roles: rolesArray });
        toast.success('Usuario creado exitosamente');
      }
      setShowModal(false);
      await refreshUsers();
    } catch (error: any) {
      console.error("ERROR GUARDANDO USUARIO:", error);
      toast.error(error.response?.data?.message || 'Error al guardar el usuario.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar permanentemente a este usuario?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        toast.success('Usuario eliminado');
        refreshUsers();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleBan = async (user: User) => {
    const isBanned = user.estado === 3;
    const confirmMsg = isBanned 
      ? '¿Quieres desbanear a este usuario?' 
      : '¿Quieres banear a este usuario? No podrá crear contenido, solo leer.';

    if (window.confirm(confirmMsg)) {
      try {
        await api.patch(`/usuarios/${user.id}/ban`);
        toast.success(isBanned ? 'Usuario desbaneado' : 'Usuario baneado');
        refreshUsers();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error al procesar el baneo');
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      u.id.toString().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      new Date(u.fecha_creacion).toLocaleDateString().includes(term)
    );

    if (filter === 'banned') {
      return matchesSearch && u.estado === 3;
    }
    return matchesSearch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Gestión de Usuarios</h2>
        <button onClick={() => { setEditingUser(null); setModalRoles([]); setRoleToAdd(''); setShowModal(true); }} className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 font-bold text-sm shadow-sm transition-colors">
          + Añadir Usuario
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Buscar por ID, Usuario, Email o Fecha..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-church-olive/20 focus:border-church-olive transition-all bg-gray-50 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200/50">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${filter === 'all' ? 'bg-white shadow-md text-church-olive scale-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('banned')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${filter === 'banned' ? 'bg-white shadow-md text-red-600 scale-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Baneados ({users.filter(u => u.estado === 3).length})
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-church-beige/30 text-xs uppercase font-bold text-church-olive">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Fecha Reg.</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Cargando datos...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay resultados.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">#{u.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-church-beige text-church-olive font-bold flex items-center justify-center mr-3 text-xs border border-gray-200">
                          {u.avatar ? <img src={u.avatar} alt="avatar" className="rounded-full w-full h-full object-cover" /> : u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="font-medium text-gray-900">{u.username}</div>
                            {u.estado === 3 && (
                              <Badge variant="danger" size="xs">Baneado</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map(r => (
                           <Badge 
                            key={r} 
                            variant={r === 'administrador' ? 'danger' : r === 'pastor' ? 'primary' : 'outline'}
                          >
                             {r}
                           </Badge>
                        )) || <span className="text-gray-400 italic text-xs">Sin roles</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(u.fecha_creacion).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-3">
                        <button onClick={() => { setEditingUser(u); setModalRoles(u.roles || []); setRoleToAdd(''); setShowModal(true); }} className="text-blue-500 hover:text-blue-700 transition-colors tooltip" title="Editar Rol">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleBan(u)} 
                          className={`${u.estado === 3 ? 'text-green-500 hover:text-green-700' : 'text-orange-500 hover:text-orange-700'} transition-colors tooltip`} 
                          title={u.estado === 3 ? 'Desbanear Usuario' : 'Banear Usuario'}
                        >
                          <span className="text-xl">🔨</span>
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Eliminar Usuario">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingUser(null); }}
        title={editingUser ? 'Editar Usuario' : 'Añadir Usuario'}
      >
        <form id="user-form" onSubmit={handleSaveUser} className="space-y-6">
          <Input 
            required 
            label="Nombre de Usuario" 
            name="username" 
            defaultValue={editingUser?.username} 
          />
          <Input 
            required 
            type="email" 
            label="Email" 
            name="email" 
            defaultValue={editingUser?.email} 
          />
          {!editingUser && (
            <Input 
              required 
              type="password" 
              label="Contraseña" 
              name="password" 
            />
          )}
          <div className="form-group">
            <label className="form-label">Roles Gestionados</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {modalRoles.length === 0 && <span className="text-xs text-gray-400 italic">No tiene roles asignados</span>}
              {modalRoles.map(r => (
                <div key={r} className="group relative">
                  <Badge 
                    variant={r === 'administrador' ? 'danger' : r === 'pastor' ? 'primary' : 'outline'}
                    className="pr-6"
                  >
                    {r.toUpperCase()}
                  </Badge>
                  <button 
                    type="button" 
                    onClick={() => setModalRoles(modalRoles.filter(role => role !== r))} 
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <select 
                value="" 
                onChange={e => {
                  const val = e.target.value;
                  if(val && !modalRoles.includes(val)) {
                    setModalRoles([...modalRoles, val]);
                  }
                }} 
                className="form-input flex-1 py-2 text-xs"
              >
                <option value="">Añadir nuevo rol...</option>
                {['administrador', 'pastor', 'usuario'].filter(r => !modalRoles.includes(r)).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => { setShowModal(false); setEditingUser(null); }}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersList;
