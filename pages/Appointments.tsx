import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Appointment, Barber, Service, AppointmentStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Scissors, XCircle, CheckCircle, Gem, Trophy, Trash2, History, Gift, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnrichedAppointment extends Appointment {
  barber?: Barber;
  service?: Service;
}

export const Appointments: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if(!user) return;
    try {
      const [apts, barbers, services] = await Promise.all([
        api.appointments.listByUser(user.id),
        api.barbers.list(true), // Include all barbers even if inactive
        api.services.list()
      ]);

      const enriched = apts.map(a => ({
        ...a,
        barber: barbers.find(b => b.id === a.barberId),
        service: services.find(s => s.id === a.serviceId)
      }));

      setAppointments(enriched);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const handleCancel = async (id: string, date: string, time: string) => {
    const aptDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diffHours = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isLate = diffHours < 24;

    const msg = isLate 
        ? "ATENCIÓN: Estás cancelando con menos de 24h de antelación. Se te descontarán 10 puntos de fidelidad. ¿Continuar?" 
        : "¿Seguro que quieres liberar esta cita?";

    if (!window.confirm(msg)) return;
    
    try {
      const result = await api.appointments.cancel(id);
      if (result.penalized) {
          alert("Cita cancelada. Se han descontado 10 puntos por cancelación tardía.");
          refreshUser(); // Update points in navbar
      }
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error al cancelar');
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if(!window.confirm("¿Eliminar esta cita de tu historial?")) return;
    try {
        await api.appointments.delete(id);
        fetchData();
    } catch (error) {
        alert("Error al eliminar");
    }
  };

  const handleClearHistory = async () => {
      if(!user) return;
      if(!window.confirm("¿Estás seguro de borrar todo tu historial de citas pasadas y canceladas? Esta acción no se puede deshacer.")) return;
      try {
          await api.appointments.clearHistory(user.id);
          fetchData();
      } catch (error) {
          alert("Error al limpiar historial");
      }
  }

  if (loading) return <div className="text-center p-10">Cargando tus citas...</div>;

  const hasHistory = appointments.some(a => a.status === AppointmentStatus.COMPLETED || a.status === AppointmentStatus.CANCELLED);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Rewards Box Section */}
      <div className="bg-gradient-to-br from-brand-black to-gray-900 border border-brand-gold/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <Trophy size={150} />
        </div>
        
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center mb-1">
                        <Gem className="mr-2 text-brand-gold" /> Recompensas de Fidelidad
                    </h2>
                    <p className="text-gray-400 text-sm">Gana 10 puntos por cada corte completado.</p>
                </div>
                <div className="mt-4 md:mt-0 bg-brand-gold/10 px-4 py-2 rounded-lg border border-brand-gold/20">
                    <span className="text-3xl font-bold text-brand-gold block text-center">{user?.loyaltyPoints || 0}</span>
                    <span className="text-xs text-brand-gold uppercase tracking-wider">Puntos Disponibles</span>
                </div>
            </div>

            {/* Progress Bar (Visual approximation) */}
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-6 relative">
                 <div 
                    className="bg-brand-gold h-2.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(((user?.loyaltyPoints || 0) / 80) * 100, 100)}%` }}
                 ></div>
                 {/* Markers */}
                 <div className="absolute top-4 left-[62%] -translate-x-1/2 flex flex-col items-center">
                    <div className="h-2 w-0.5 bg-gray-600 mb-1"></div>
                    <span className="text-[10px] text-gray-500">50</span>
                 </div>
                 <div className="absolute top-4 right-0 flex flex-col items-center">
                    <div className="h-2 w-0.5 bg-gray-600 mb-1"></div>
                    <span className="text-[10px] text-gray-500">80</span>
                 </div>
            </div>

            {/* Redeemable Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    (user?.loyaltyPoints || 0) >= 50 
                    ? 'bg-brand-gold text-black border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
                    : 'bg-gray-800/50 text-gray-500 border-gray-700'
                }`}>
                    <div className="flex items-center">
                        <Gift size={24} className="mr-3" />
                        <div>
                            <span className="block font-bold">Corte Gratis</span>
                            <span className="text-xs opacity-75">Coste: 50 Puntos</span>
                        </div>
                    </div>
                    {(user?.loyaltyPoints || 0) >= 50 ? <CheckCircle size={20}/> : <Lock size={18} />}
                </div>

                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    (user?.loyaltyPoints || 0) >= 80 
                    ? 'bg-brand-gold text-black border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
                    : 'bg-gray-800/50 text-gray-500 border-gray-700'
                }`}>
                    <div className="flex items-center">
                        <Trophy size={24} className="mr-3" />
                        <div>
                            <span className="block font-bold">Corte + Barba</span>
                            <span className="text-xs opacity-75">Coste: 80 Puntos</span>
                        </div>
                    </div>
                    {(user?.loyaltyPoints || 0) >= 80 ? <CheckCircle size={20}/> : <Lock size={18} />}
                </div>
            </div>
            
            <p className="mt-4 text-xs text-gray-500 text-center italic">
                Canjea tus puntos al momento de reservar tu próxima cita.
            </p>
        </div>
      </div>

      {/* Appointments List Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
                <Calendar className="mr-3 text-brand-gold" /> Mis Citas
            </h1>
            {hasHistory && (
                <button 
                    onClick={handleClearHistory}
                    className="text-xs flex items-center text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-1.5 rounded transition-colors"
                >
                    <History size={14} className="mr-1"/> Limpiar Historial
                </button>
            )}
        </div>

        {appointments.length === 0 ? (
            <div className="bg-brand-black border border-gray-800 rounded-xl p-10 text-center">
            <p className="text-gray-400 mb-4">No tienes citas programadas ni historial.</p>
            <button onClick={() => navigate('/')} className="text-brand-gold hover:underline">
                Buscar un barbero
            </button>
            </div>
        ) : (
            <div className="space-y-4">
            {appointments.map(apt => (
                <div 
                key={apt.id} 
                className={`bg-brand-black border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                    apt.status === AppointmentStatus.CANCELLED ? 'border-gray-800 opacity-60' : 
                    apt.status === AppointmentStatus.COMPLETED ? 'border-blue-900 bg-blue-900/10' :
                    'border-gray-700 hover:border-brand-gold/50'
                }`}
                >
                <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${
                        apt.status === AppointmentStatus.CANCELLED ? 'bg-gray-800 text-gray-500' : 
                        apt.status === AppointmentStatus.COMPLETED ? 'bg-blue-900/30 text-blue-400' :
                        'bg-brand-gold/10 text-brand-gold'
                    }`}>
                    {apt.status === AppointmentStatus.COMPLETED ? <CheckCircle size={24} /> : <Scissors size={24} />}
                    </div>
                    <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{apt.service?.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        apt.status === AppointmentStatus.CONFIRMED ? 'bg-green-900/20 text-green-400 border-green-800' :
                        apt.status === AppointmentStatus.CANCELLED ? 'bg-gray-800 text-gray-500 border-gray-700' :
                        apt.status === AppointmentStatus.COMPLETED ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                        'bg-yellow-900/30 text-yellow-400 border-yellow-800'
                        }`}>
                        {apt.status === AppointmentStatus.CONFIRMED ? 'Confirmada' : 
                        apt.status === AppointmentStatus.CANCELLED ? 'Cancelada' : 
                        apt.status === AppointmentStatus.COMPLETED ? 'Completada' :
                        apt.status}
                        </span>
                        {apt.pointsRedeemed ? <span className="text-xs text-brand-gold border border-brand-gold/30 px-2 rounded-full">Puntos Canjeados</span> : null}
                    </div>
                    <p className="text-gray-400 text-sm mb-1">con <span className="text-gray-200">{apt.barber?.name}</span></p>
                    <div className="flex items-center text-sm text-gray-500 gap-4">
                        <span className="flex items-center"><Calendar size={14} className="mr-1"/> {apt.date}</span>
                        <span className="flex items-center"><Clock size={14} className="mr-1"/> {apt.time}</span>
                        <span>${apt.totalPrice}</span>
                    </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {apt.status === AppointmentStatus.CONFIRMED && (
                        <button 
                        onClick={() => handleCancel(apt.id, apt.date, apt.time)}
                        className="text-sm text-red-500 hover:text-red-400 hover:bg-red-900/20 px-3 py-1.5 rounded-md transition-colors flex items-center border border-transparent hover:border-red-900"
                        >
                        <XCircle size={16} className="mr-1" />
                        Liberar Cita
                        </button>
                    )}
                    
                    {/* Botón borrar historial (solo para completadas/canceladas) */}
                    {(apt.status === AppointmentStatus.COMPLETED || apt.status === AppointmentStatus.CANCELLED) && (
                        <button 
                        onClick={() => handleDeleteHistoryItem(apt.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-full transition-colors"
                        title="Eliminar del historial"
                        >
                        <Trash2 size={18} />
                        </button>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};