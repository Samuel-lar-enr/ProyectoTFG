import React, { useState } from 'react';
import { authService } from '../../services/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      if (response.status === 'success') {
        toast.success(response.message);
        setSent(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Error al solicitar la recuperación');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">¡Correo enviado!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Si el correo <span className="font-semibold text-gray-900">{email}</span> está en nuestro sistema, recibirás un enlace para restablecer tu contraseña en breve.
          </p>
          <div className="mt-6">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Volver al inicio de sesión
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
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Introduce tu correo y te enviaremos un enlace de recuperación.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="form-group pb-4">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              required
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-sm"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>

          <div className="text-center mt-6">
            <Link to="/login" className="text-sm font-bold text-church-olive hover:text-church-olive-dark transition-colors">
              ¿Recordaste tu contraseña? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

