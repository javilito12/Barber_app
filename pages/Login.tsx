import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Scissors, Eye, EyeOff, X } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
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

  const handleSocialLogin = async (provider: 'google') => {
    try {
      setError('');
      await api.auth.loginWithProvider(provider);
      // La redirección la maneja Supabase automáticamente
    } catch (err: any) {
      setError(`Error con ${provider}: ${err.message}`);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetLoading(true);

    try {
      await api.auth.resetPasswordForEmail(resetEmail);
      setResetMessage('Si el correo existe, recibirás un enlace de recuperación en breve.');
      setResetEmail('');
    } catch (err: any) {
      setResetError(err.message || 'Error al enviar correo');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-brand-black p-10 rounded-sm border border-brand-gold/20 shadow-2xl mt-10 relative overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>

      <div className="text-center mb-8">
        <div className="inline-block p-4 rounded-full border border-brand-gold/30 mb-4 bg-black">
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

      <div className="mb-6">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          className="w-full flex items-center justify-center bg-white hover:bg-gray-100 text-gray-900 py-2.5 px-4 rounded transition-colors font-medium text-sm"
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
          Continuar con Google
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
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs uppercase tracking-wider text-gray-500">Contraseña</label>
            <button 
                type="button" 
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-brand-gold hover:text-white transition-colors"
            >
                ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full bg-black border border-gray-800 text-white px-4 py-3 focus:border-brand-gold focus:ring-0 outline-none transition-colors pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
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

      {/* MODAL DE RECUPERACIÓN DE CONTRASEÑA */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-brand-black border border-brand-gold/50 rounded-lg p-6 w-full max-w-sm relative shadow-2xl">
                <button 
                    onClick={() => setShowForgotPassword(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-2">Recuperar Contraseña</h3>
                <p className="text-sm text-gray-400 mb-4">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu acceso.
                </p>

                {resetMessage && (
                    <div className="bg-green-900/30 border border-green-800 text-green-400 px-3 py-2 rounded text-sm mb-4">
                        {resetMessage}
                    </div>
                )}
                
                {resetError && (
                    <div className="bg-red-900/30 border border-red-800 text-red-400 px-3 py-2 rounded text-sm mb-4">
                        {resetError}
                    </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <input 
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="w-full bg-black border border-gray-700 text-white rounded p-3 focus:border-brand-gold outline-none"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={resetLoading}
                        className="w-full bg-brand-gold hover:bg-white text-black font-bold py-2 rounded transition-colors disabled:opacity-50"
                    >
                        {resetLoading ? 'Enviando...' : 'Enviar Correo'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};