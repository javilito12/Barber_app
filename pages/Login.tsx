import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Scissors } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.auth.login(email, password);
      login(response);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-brand-black p-10 rounded-sm border border-brand-gold/20 shadow-2xl mt-10 relative overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>

      <div className="text-center mb-10">
        <div className="inline-block p-4 rounded-full border border-brand-gold/30 mb-4 bg-black">
            {/* Logo placeholder or Icon */}
            <Scissors className="text-brand-gold h-8 w-8" />
        </div>
        <h2 className="text-4xl font-serif italic font-bold text-white mb-2">Javier. R</h2>
        <p className="text-brand-gold uppercase tracking-[0.3em] text-xs">Barbería</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-300 px-4 py-3 mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Email</label>
          <input
            type="email"
            required
            className="w-full bg-black border border-gray-800 text-white px-4 py-3 focus:border-brand-gold focus:ring-0 outline-none transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Contraseña</label>
          <input
            type="password"
            required
            className="w-full bg-black border border-gray-800 text-white px-4 py-3 focus:border-brand-gold focus:ring-0 outline-none transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-gold hover:bg-white text-black font-bold uppercase tracking-widest py-3 px-4 transition-colors disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Accediendo...' : 'Ingresar'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        ¿Primera vez aquí?{' '}
        <Link to="/register" className="text-brand-gold hover:text-white transition-colors underline decoration-brand-gold/50 underline-offset-4">
          Crear una cuenta
        </Link>
      </div>
    </div>
  );
};