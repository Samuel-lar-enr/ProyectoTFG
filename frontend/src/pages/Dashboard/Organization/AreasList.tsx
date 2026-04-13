import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { toast } from 'sonner';
import { Button, Input, Modal } from '../../../components/ui';
import type { Area } from '../../../types/apiTypes';

const AreasList: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/areas/');
      if (res.data && Array.isArray(res.data.data)) {
        setAreas(res.data.data);
      } else if (Array.isArray(res.data)) {
        setAreas(res.data);
      }
    } catch (error) {
      toast.error('Error al cargar áreas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      if (editingArea) {
        await api.put(`/areas/${editingArea.id}`, formData);
        toast.success('Área actualizada');
      } else {
        await api.post('/areas/', formData);
        toast.success('Área creada');
      }
      setShowModal(false);
      fetchAreas();
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar esta área integrada?')) {
      try {
        await api.delete(`/areas/${id}`);
        toast.success('Área eliminada');
        fetchAreas();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const filtered = areas.filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-church-olive">Gestión de Áreas</h2>
        <button onClick={() => { setEditingArea(null); setShowModal(true); }} className="bg-church-terracotta text-white px-4 py-2 rounded-md hover:bg-church-terracotta/90 font-bold text-sm shadow-sm transition-colors">
          + Nueva Área
        </button>
      </div>

      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar área por nombre..." 
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
                <th className="px-6 py-4">Nombre del Área</th>
                <th className="px-6 py-4">Resumen</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">No hay áreas configuradas.</td></tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">#{a.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{a.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{a.resumen || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-3">
                        <button onClick={() => { setEditingArea(a); setShowModal(true); }} className="text-blue-500 hover:text-blue-700 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 transition-colors">
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
        onClose={() => setShowModal(false)}
        title={editingArea ? 'Editar Área' : 'Nueva Área'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" form="area-form">{editingArea ? 'Guardar' : 'Crear'}</Button>
          </>
        }
        size="sm"
      >
        <form id="area-form" onSubmit={handleSave} className="space-y-4">
          <Input 
            required 
            label="Nombre del Área" 
            name="nombre" 
            defaultValue={editingArea?.nombre} 
            placeholder="Ej: Jóvenes, Alabanza..." 
          />
          <Input 
            label="Resumen (Hover)" 
            name="resumen" 
            defaultValue={editingArea?.resumen} 
            placeholder="Ej: Actividades para los más pequeños..." 
          />
          <div className="form-group">
            <label className="form-label">Descripción Completa</label>
            <textarea 
              rows={3} 
              name="descripcion" 
              defaultValue={editingArea?.descripcion} 
              placeholder="Detalles completos sobre el área..." 
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Imagen del Área (Opcional)</label>
            <input 
              type="file" 
              name="imagen_file" 
              accept="image/*" 
              className="form-input file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-church-terracotta file:text-white hover:file:bg-church-terracotta-dark" 
            />
            {editingArea?.imagen && (
              <p className="text-[10px] text-gray-500 mt-2">
                Imagen actual: <a href={`http://localhost:5000${editingArea.imagen}`} target="_blank" rel="noreferrer" className="text-church-olive underline font-bold">Ver imagen</a>
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AreasList;
