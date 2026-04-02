import React, { useState } from 'react';
import { api } from '../../../services/api';
import { toast } from 'sonner';
import { useDashboard } from '../../../context/DashboardContext';
import type { User } from '../../../types/apiTypes';

const UsersList: React.FC = () => {
  const { users, loadingData: loading, refreshUsers } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalRoles, setModalRoles] = useState<string[]>([]);
  const [roleToAdd, setRoleToAdd] = useState('');

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
        // POST request to create.
        await api.post('/usuarios/', { ...data, roles: rolesArray });
        toast.success('Usuario creado exitosamente');
      }
      setShowModal(false);
      refreshUsers();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el usuario.');
      setShowModal(false);
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

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.id.toString().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      new Date(u.fecha_creacion).toLocaleDateString().includes(term)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Gestión de Usuarios</h2>
        <button onClick={() => { setEditingUser(null); setModalRoles([]); setRoleToAdd(''); setShowModal(true); }} className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 font-bold text-sm shadow-sm transition-colors">
          + Añadir Usuario
        </button>
      </div>

      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar por ID, Usuario, Email o Fecha..." 
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
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Fecha Reg.</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Cargando datos...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay resultados.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">#{u.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-church-beige text-church-olive font-bold flex items-center justify-center mr-3 text-xs border border-gray-200">
                          {u.avatar ? <img src={u.avatar} alt="avatar" className="rounded-full w-full h-full object-cover" /> : u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.username}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map(r => (
                           <span key={r} className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${r === 'administrador' ? 'bg-red-100 text-red-700' : r === 'pastor' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                             {r}
                           </span>
                        )) || <span className="text-gray-400 italic">Sin roles</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(u.fecha_creacion).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex justify-center space-x-3">
                      <button onClick={() => { setEditingUser(u); setModalRoles(u.roles || []); setRoleToAdd(''); setShowModal(true); }} className="text-blue-500 hover:text-blue-700 transition-colors tooltip" title="Editar Rol">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 transition-colors tooltip" title="Eliminar Usuario">
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-serif text-church-olive mb-4">
              {editingUser ? 'Editar Usuario' : 'Añadir Usuario'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                <input required type="text" name="username" defaultValue={editingUser?.username} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" name="email" defaultValue={editingUser?.email} className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input required type="password" name="password" className="w-full px-3 py-2 border rounded-md focus:ring-church-olive focus:border-church-olive" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles Gestionados</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {modalRoles.length === 0 && <span className="text-sm text-gray-400 italic">No tiene roles asignados</span>}
                  {modalRoles.map(r => (
                    <span key={r} className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${r === 'administrador' ? 'bg-red-100 text-red-700 border border-red-200' : r === 'pastor' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                      <span>{r.toUpperCase()}</span>
                      <button 
                        type="button" 
                        onClick={() => setModalRoles(modalRoles.filter(role => role !== r))} 
                        className="text-red-500 hover:bg-red-200 rounded-full w-4 h-4 flex items-center justify-center font-bold transition-colors ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <select 
                    value={roleToAdd} 
                    onChange={e => setRoleToAdd(e.target.value)} 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-church-olive focus:border-church-olive text-sm"
                  >
                    <option value="">Seleccionar nuevo rol...</option>
                    {['administrador', 'pastor', 'usuario'].filter(r => !modalRoles.includes(r)).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => {
                      if(roleToAdd && !modalRoles.includes(roleToAdd)) {
                        setModalRoles([...modalRoles, roleToAdd]);
                        setRoleToAdd('');
                      }
                    }} 
                    className="bg-church-olive text-white px-4 py-2 rounded-md hover:bg-church-olive/90 transition-colors font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowModal(false); setEditingUser(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-church-terracotta text-white rounded-md hover:bg-church-terracotta/90 transition-colors font-medium">
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
