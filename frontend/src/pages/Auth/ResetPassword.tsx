import React, { useState, useEffect } from 'react';
import { authService } from '../../services/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Token no encontrado en la URL');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword({ token, password });
      if (response.status === 'success') {
        toast.success(response.message);
        setSuccess(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">¡Contraseña restablecida!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión.
          </p>
          <div className="mt-6">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-church-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        <Link to="/" className="inline-flex items-center text-xs font-bold text-church-olive hover:text-church-terracotta transition-colors mb-4 group">
          <svg className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          VOLVER AL INICIO
        </Link>
        <div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-church-olive tracking-tight">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Introduce tu nueva contraseña a continuación.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="space-y-1">
            <div className="form-group">
              <label htmlFor="password" title="password" className="form-label">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="form-group pb-4">
              <label htmlFor="confirmPassword" title="confirmPassword" className="form-label">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                required
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !token}
            className="btn-primary w-full py-4 text-sm"
          >
            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
