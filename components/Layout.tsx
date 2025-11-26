import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, Calendar, LogOut, Menu, X, Shield, Users, Gem, List, UserCog } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin, isBarber } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
          isActive 
            ? 'text-brand-gold bg-white/5 border border-brand-gold/20 font-medium' 
            : 'text-gray-400 hover:text-brand-gold hover:bg-white/5'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-gray-100 font-sans">
      {/* Navbar */}
      <nav className="border-b border-brand-gold/20 bg-brand-black sticky top-0 z-50 shadow-md shadow-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20"> {/* Aumentado altura para el logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                {/* Logo Image */}
                <div className="relative h-14 w-14 rounded-full border-2 border-brand-gold/50 overflow-hidden shadow-[0_0_15px_rgba(230,194,104,0.2)] group-hover:shadow-[0_0_20px_rgba(230,194,104,0.4)] transition-all">
                    {/* Asegúrate de poner tu imagen logo.png en la carpeta public */}
                    <img 
                        src="/logo.png" 
                        alt="Javier R Logo" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            // Fallback si no encuentran la imagen
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <div className="hidden h-full w-full bg-black flex items-center justify-center">
                        <Scissors className="text-brand-gold h-6 w-6" />
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <span className="text-2xl font-serif italic font-bold tracking-wide text-brand-gold leading-none">
                        Javier. R
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-sans mt-0.5">
                        Barbería
                    </span>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {!isBarber && <NavItem to="/" icon={Scissors} label="Reservar" />}
                  
                  {isAdmin && (
                    <>
                      <NavItem to="/admin/barbers" icon={Users} label="Barberos" />
                      <NavItem to="/admin/services" icon={List} label="Servicios" />
                      <NavItem to="/admin/users" icon={UserCog} label="Usuarios" />
                      <NavItem to="/admin/appointments" icon={Shield} label="Panel Citas" />
                    </>
                  )}

                  {isBarber && (
                     <NavItem to="/admin/appointments" icon={Calendar} label="Mi Agenda" />
                  )}

                  {!isAdmin && !isBarber && (
                    <NavItem to="/appointments" icon={Calendar} label="Mis Citas" />
                  )}

                  <div className="h-6 w-px bg-gray-800 mx-2"></div>
                  
                  {/* Loyalty Display */}
                  {!isAdmin && !isBarber && (
                    <div className="flex items-center text-brand-gold mr-4 px-3 py-1 bg-gradient-to-r from-brand-gold/20 to-transparent rounded-full border border-brand-gold/20" title="Tus puntos de fidelidad">
                      <Gem size={14} className="mr-1" />
                      <span className="font-bold">{user.loyaltyPoints} pts</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 ml-2">
                    <span className="text-sm text-gray-300">
                        {isAdmin && <span className="text-brand-gold font-bold mr-1">[ADMIN]</span>}
                        {isBarber && <span className="text-brand-gold font-bold mr-1">[BARBER]</span>}
                        Hola, {user.name.split(' ')[0]}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-brand-gold transition-colors"
                      title="Cerrar sesión"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-x-4 flex items-center">
                  <Link to="/login" className="text-brand-gold hover:text-white transition-colors font-serif italic text-lg">Entrar</Link>
                  <Link to="/register" className="bg-brand-gold hover:bg-white text-black px-5 py-2 rounded-sm font-bold tracking-wide transition-colors uppercase text-xs">
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-brand-gold hover:text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-brand-black border-b border-gray-800 pb-4 px-4 shadow-xl">
            <div className="flex flex-col space-y-2 mt-2">
              {user ? (
                <>
                  {!isBarber && <NavItem to="/" icon={Scissors} label="Reservar" />}
                  
                  {isAdmin && (
                    <>
                      <NavItem to="/admin/barbers" icon={Users} label="Barberos" />
                      <NavItem to="/admin/services" icon={List} label="Servicios" />
                      <NavItem to="/admin/users" icon={UserCog} label="Usuarios" />
                      <NavItem to="/admin/appointments" icon={Shield} label="Panel Citas" />
                    </>
                  )}

                  {isBarber && (
                     <NavItem to="/admin/appointments" icon={Calendar} label="Mi Agenda" />
                  )}

                  {!isAdmin && !isBarber && (
                     <NavItem to="/appointments" icon={Calendar} label="Mis Citas" />
                  )}

                  <div className="border-t border-gray-800 my-2 pt-2">
                    <div className="flex items-center justify-between px-3 py-2 text-gray-400">
                      <span>{user.email}</span>
                      <button onClick={handleLogout} className="text-brand-gold font-medium">Salir</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-3 mt-4">
                  <Link to="/login" className="text-center w-full py-3 text-brand-gold border border-brand-gold/30 rounded font-serif italic">Iniciar Sesión</Link>
                  <Link to="/register" className="text-center w-full py-3 bg-brand-gold text-black font-bold uppercase tracking-widest text-xs rounded">Registrarse</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-black border-t border-brand-gold/20 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
             {/* Footer Logo Mini */}
             <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-full border border-gray-600" 
                 onError={(e) => e.currentTarget.style.display = 'none'} />
             <span className="font-serif italic text-xl text-gray-400">Javier. R</span>
          </div>
          <p className="text-gray-500 text-sm uppercase tracking-widest">&copy; {new Date().getFullYear()} Javier R. Barbería. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};