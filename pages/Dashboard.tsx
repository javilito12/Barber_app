import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Barber } from '../types';
import { Star, ChevronRight, Search } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        // Only fetch active barbers for client dashboard
        const data = await api.barbers.list(false);
        setBarbers(data);
      } catch (error) {
        console.error('Failed to load barbers', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBarbers();
  }, []);

  const filteredBarbers = barbers.filter(b => 
    b.name.toLowerCase().includes(filter.toLowerCase()) || 
    b.specialties.some(s => s.toLowerCase().includes(filter.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-sm overflow-hidden bg-brand-black h-80 flex items-center shadow-2xl border border-brand-gold/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/50 via-black/80 to-black z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1503951914875-452162b7f304?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
          alt="Barbershop Atmosphere" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
        />
        <div className="relative z-20 px-8 max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif italic font-bold text-brand-gold mb-4 tracking-tight drop-shadow-lg">
            Excelencia & Estilo
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-8 font-light tracking-wide uppercase">
            Javier R. Barbería — Donde la tradición encuentra la perfección.
          </p>
          <div className="inline-block border-b-2 border-brand-gold w-24"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-800 pb-4">
        <div>
            <h2 className="text-3xl font-serif text-white italic">Nuestro Equipo</h2>
            <p className="text-gray-500 text-sm mt-1">Selecciona a tu profesional de confianza</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gold" size={18} />
          <input 
            type="text" 
            placeholder="Buscar barbero o estilo..." 
            className="w-full bg-black border border-gray-700 text-white rounded-sm py-2.5 pl-10 pr-4 focus:outline-none focus:border-brand-gold transition-colors placeholder-gray-600"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBarbers.map(barber => (
          <div key={barber.id} className="bg-brand-black border border-gray-800 rounded-sm overflow-hidden group hover:border-brand-gold/40 transition-all duration-300 shadow-lg hover:shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
            <div className="h-64 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60"></div>
              <img src={barber.photoUrl} alt={barber.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter grayscale group-hover:grayscale-0" />
              <div className="absolute top-0 right-0 p-3 z-20">
                 <div className="bg-black/90 backdrop-blur-sm px-2 py-1 flex items-center space-x-1 border border-brand-gold/30">
                    <Star size={14} className="text-brand-gold fill-current" />
                    <span className="text-xs font-bold text-brand-gold tracking-widest">{barber.rating.toFixed(1)}</span>
                 </div>
              </div>
            </div>
            <div className="p-6 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-gold h-1 w-12 group-hover:w-24 transition-all duration-500"></div>
              
              <h3 className="text-2xl font-serif italic text-white mb-2 text-center">{barber.name}</h3>
              
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {barber.specialties.map(spec => (
                  <span key={spec} className="text-[10px] uppercase tracking-wider bg-gray-900 text-brand-gold px-2 py-1 border border-gray-800">
                    {spec}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-500 text-sm text-center mb-6 h-10 line-clamp-2 font-light leading-relaxed">{barber.bio}</p>
              
              <Link 
                to={`/barber/${barber.id}`}
                className="w-full border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black font-bold uppercase text-xs tracking-[0.2em] py-3 px-4 flex items-center justify-center transition-all duration-300"
              >
                <span>Reservar Cita</span>
                <ChevronRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>
        ))}

        {filteredBarbers.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500 bg-gray-900/10 border border-gray-800">
            <p className="font-serif italic text-xl">No se encontraron barberos disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
};