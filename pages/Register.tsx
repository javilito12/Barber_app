import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setIsLoading(false);
        return;
    }

    try {
      const response = await api.auth.register(formData);
      login(response);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setError('');
      await api.auth.loginWithProvider(provider);
      // La redirección la maneja Supabase automáticamente
    } catch (err: any) {
      setError(`Error con ${provider}: ${err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-brand-black p-10 rounded-sm border border-brand-gold/20 shadow-2xl mt-10 relative">
       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>

      <div className="text-center mb-6">
        <h2 className="text-3xl font-serif italic font-bold text-white mb-2">Nuevo Cliente</h2>
        <p className="text-gray-400 text-sm uppercase tracking-wider">Únete al club Javier R.</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-300 px-4 py-3 mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-900 py-2.5 px-4 rounded transition-colors font-medium text-sm"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 4.66c1.61 0 3.06.55 4.21 1.64l3.15-3.15C17.45 1.14 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin('apple')}
          className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-900 py-2.5 px-4 rounded transition-colors font-medium text-sm"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05 1.88-3.3 1.88-1.3 0-2.4-.6-3.7-.6s-2.4.6-3.7.6c-1.2 0-2.3-.98-3.3-1.98C.73 17.55 0 13.98 0 11.33c0-4.13 2.5-6.65 5.5-6.65 1.3 0 2.45.65 3.3.65.8 0 1.95-.65 3.35-.65 1.25 0 2.45.45 3.4 1.15-2.45 1.35-2.75 4.9.45 6.35-.55 2.8-2 5.55-3.95 8.1M13 2.5c-.3 1.9-1.95 3.35-3.75 3.35-.2 0-.4 0-.6-.05.35-2.15 2.1-3.6 3.9-3.6.15 0 .3 0 .45.05z" />
          </svg>
          Apple
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-brand-black px-2 text-gray-500">O con email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Nombre Completo</label>
          <input
            type="text"
            required
            className="w-full bg-black border border-gray-800 text-white px-4 py-3 focus:border-brand-gold focus:ring-0 outline-none transition-colors"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Email</label>
          <input
            type="email"
            required
            className="w-full bg-black border border-gray-800 text-white px-4 py-3 focus:border-brand-gold focus:ring-0 outline-none transition-colors"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Teléfono (Opcional)</label>
            <input
                type="tel"
                className="w-full bg-black border border-gray-800 text-white px-4 py-3 focus:border-brand-gold focus:ring-0 outline-none transition-colors"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Contraseña</label>
          <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-black border border-gray-800 text-white px-4 py-3 focus:border-brand-gold focus:ring-0 outline-none transition-colors pr-12"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-gold"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-gold hover:bg-white text-black font-bold uppercase tracking-widest py-3 px-4 transition-colors disabled:opacity-50 mt-4"
        >
          {isLoading ? 'Procesando...' : 'Registrarse'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        ¿Ya eres miembro?{' '}
        <Link to="/login" className="text-brand-gold hover:text-white transition-colors underline decoration-brand-gold/50 underline-offset-4">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
};