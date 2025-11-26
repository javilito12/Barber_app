import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
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

  return (
    <div className="max-w-md mx-auto bg-brand-black p-10 rounded-sm border border-brand-gold/20 shadow-2xl mt-10 relative">
       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif italic font-bold text-white mb-2">Nuevo Cliente</h2>
        <p className="text-gray-400 text-sm uppercase tracking-wider">Únete al club Javier R.</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-300 px-4 py-3 mb-6 text-sm text-center">
          {error}
        </div>
      )}

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
          <input
            type="password"
            required
            className="w-full bg-black border border-gray-800 text-white px-4 py-3 focus:border-brand-gold focus:ring-0 outline-none transition-colors"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
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