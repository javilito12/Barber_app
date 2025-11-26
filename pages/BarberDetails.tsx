import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Barber, Service, Review } from '../types';
import { Star, Clock, Check, AlertCircle, Gem, MessageSquare, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BarberDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [barber, setBarber] = useState<Barber | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Loyalty State
  const [redeemOption, setRedeemOption] = useState<'none' | 'free' | 'combo'>('none');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  // Generar próximos 14 días
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start tomorrow
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const [barberData, allServices] = await Promise.all([
          api.barbers.getById(id),
          api.services.list()
        ]);
        
        if (!barberData) throw new Error('Barber not found');
        setBarber(barberData);

        // LÓGICA ROBUSTA: Si el barbero tiene servicios asignados, intentamos filtrar.
        // Si el filtro resulta vacío o el barbero no tiene IDs, MOSTRAR TODOS (Fallback).
        if (barberData.services && barberData.services.length > 0) {
            const filtered = allServices.filter(s => barberData.services.includes(s.id));
            setServices(filtered.length > 0 ? filtered : allServices);
        } else {
            // Si no hay asignación específica, asumimos que hace todo.
            setServices(allServices);
        }

      } catch (err) {
        console.error(err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  useEffect(() => {
    if (barber && selectedDate) {
      setBookingStatus('idle');
      setSelectedTime(null);
      api.appointments.getBusySlots(barber.id, selectedDate)
        .then(setBusySlots);
    }
  }, [selectedDate, barber]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/barber/${id}` } });
      return;
    }
    if (!selectedServiceId || !selectedDate || !selectedTime || !barber) return;

    setBookingStatus('submitting');
    try {
      const service = services.find(s => s.id === selectedServiceId);
      
      let price = service?.price || 0;
      let pointsCost = 0;

      if (redeemOption === 'free') {
          price = 0;
          pointsCost = 50;
      } else if (redeemOption === 'combo') {
          price = 0; // Asumimos gratis o descuento total
          pointsCost = 80;
      }

      await api.appointments.create({
        userId: user.id,
        barberId: barber.id,
        serviceId: selectedServiceId,
        date: selectedDate,
        time: selectedTime,
        totalPrice: price,
        pointsRedeemed: pointsCost
      });

      refreshUser(); // Actualizar puntos en el contexto
      setBookingStatus('success');
      setTimeout(() => navigate('/appointments'), 2000);
    } catch (err: any) {
      setBookingStatus('error');
      setErrorMsg(err.message || 'Error al crear la cita');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!barber || !user) return;
    await api.barbers.addReview(barber.id, {
        userId: user.id,
        userName: user.name,
        rating: newReview.rating,
        comment: newReview.comment
    });
    // Reload barber
    const b = await api.barbers.getById(barber.id);
    if(b) setBarber(b);
    setShowReviewForm(false);
    setNewReview({ rating: 5, comment: '' });
  };

  // Helper para generar slots CADA 40 MINUTOS con DESCANSO
  const getDailySlots = (dateString: string) => {
    if (!barber) return [];
    
    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday

    if (!barber.schedule.days.includes(dayOfWeek)) return [];

    const slots = [];
    const [startH, startM] = barber.schedule.startHour.split(':').map(Number);
    const [endH, endM] = barber.schedule.endHour.split(':').map(Number);
    
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + 40 <= endMinutes) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        
        // Lunch Break Check: 12:00 (720 min) to 14:00 (840 min)
        if (h >= 12 && h < 14) {
            currentMinutes += 40;
            continue;
        }

        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        slots.push(timeStr);
        currentMinutes += 40; // Incremento de 40 min
    }
    return slots;
  };

  if (loading || !barber) return <div className="text-center p-10">Cargando...</div>;

  const selectedService = services.find(s => s.id === selectedServiceId);
  const slotsForSelectedDate = selectedDate ? getDailySlots(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Col: Barber Info & Services */}
      <div className="lg:col-span-2 space-y-8">
        {/* Barber Header */}
        <div className="bg-brand-black border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Star size={120} />
          </div>
          <img src={barber.photoUrl} alt={barber.name} className="w-32 h-32 rounded-full object-cover border-4 border-brand-gold shadow-lg z-10" />
          <div className="z-10">
            <h1 className="text-3xl font-bold text-white mb-2">{barber.name}</h1>
            <div className="flex items-center space-x-2 text-brand-gold mb-3">
              <Star className="fill-current" size={20} />
              <span className="text-lg font-bold">{barber.rating}</span>
              <span className="text-gray-500 text-sm">({barber.reviews.length} reseñas)</span>
            </div>
            <p className="text-gray-400 mb-3">{barber.bio}</p>
            {!barber.isActive && (
                <span className="inline-block bg-red-900/50 text-red-200 border border-red-800 px-3 py-1 rounded text-sm font-bold">
                    Temporalmente no disponible
                </span>
            )}
          </div>
        </div>

        {/* Services Selection */}
        {barber.isActive ? (
            <div>
              <h2 className="text-xl font-semibold text-brand-gold-light mb-4">1. Elige un Servicio</h2>
              {services.length === 0 ? (
                 <div className="p-4 bg-yellow-900/20 text-yellow-500 border border-yellow-800 rounded">
                    No hay servicios configurados en el sistema. Contacta al administrador.
                 </div>
              ) : (
                <div className="space-y-3">
                    {services.map(service => (
                    <div 
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group ${
                        selectedServiceId === service.id 
                            ? 'bg-brand-gold/10 border-brand-gold ring-1 ring-brand-gold' 
                            : 'bg-brand-black border-gray-800 hover:border-gray-600'
                        }`}
                    >
                        <div>
                        <h3 className="font-bold text-white">{service.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                            <span className="flex items-center"><Clock size={12} className="mr-1"/> {service.durationMinutes} min</span>
                        </div>
                        </div>
                        <div className="text-right">
                        <span className="block text-xl font-bold text-brand-gold">${service.price}</span>
                        {selectedServiceId === service.id && <Check className="ml-auto mt-2 text-brand-gold" size={20} />}
                        </div>
                    </div>
                    ))}
                </div>
              )}
            </div>
        ) : (
            <div className="p-8 border border-dashed border-gray-700 rounded-xl text-center text-gray-500">
                Este barbero no está aceptando citas en este momento.
            </div>
        )}

        {/* Reviews Section */}
        <div className="border-t border-gray-800 pt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-brand-gold-light">Opiniones de Clientes</h2>
                {user && !showReviewForm && (
                    <button onClick={() => setShowReviewForm(true)} className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-white transition-colors">
                        Escribir Reseña
                    </button>
                )}
            </div>

            {showReviewForm && (
                <form onSubmit={submitReview} className="bg-gray-900/50 p-4 rounded-lg mb-6 border border-gray-800">
                    <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">Puntuación</label>
                        <select 
                            value={newReview.rating} 
                            onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}
                            className="bg-black border border-gray-700 rounded px-2 py-1 text-white"
                        >
                            <option value="5">5 Estrellas</option>
                            <option value="4">4 Estrellas</option>
                            <option value="3">3 Estrellas</option>
                            <option value="2">2 Estrellas</option>
                            <option value="1">1 Estrella</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">Comentario</label>
                        <textarea 
                            required
                            className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm"
                            rows={3}
                            value={newReview.comment}
                            onChange={e => setNewReview({...newReview, comment: e.target.value})}
                            placeholder="Cuéntanos tu experiencia..."
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowReviewForm(false)} className="text-xs text-gray-400 hover:text-white">Cancelar</button>
                        <button type="submit" className="bg-brand-gold text-black text-xs font-bold px-3 py-1.5 rounded">Publicar</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {barber.reviews.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">No hay reseñas aún.</p>
                ) : (
                    barber.reviews.map(r => (
                        <div key={r.id} className="bg-gray-900/30 p-4 rounded-lg border border-gray-800/50">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-white text-sm">{r.userName}</span>
                                <div className="flex text-brand-gold">
                                    {Array.from({length: r.rating}).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm">{r.comment}</p>
                            <span className="text-xs text-gray-600 mt-2 block">{r.date}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* Right Col: Calendar & Summary */}
      <div className="space-y-6">
        <div className="bg-brand-black border border-gray-800 rounded-2xl p-6 sticky top-24 shadow-2xl">
          <h2 className="text-xl font-semibold text-brand-gold-light mb-4">2. Fecha y Hora</h2>
          
          {/* Date Picker (Extended) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Próximos 14 días</label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {availableDates.map(date => {
                 const [y,m,d] = date.split('-');
                 const dateObj = new Date(date);
                 const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
                 const dayOfWeek = dateObj.getDay();
                 const isWorkingDay = barber.schedule.days.includes(dayOfWeek);

                 if (!isWorkingDay) return null;

                 return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    disabled={!barber.isActive}
                    className={`p-2 rounded-lg text-center text-sm border transition-colors ${
                      selectedDate === date 
                        ? 'bg-brand-gold text-black font-bold border-brand-gold' 
                        : 'border-gray-700 text-gray-400 hover:border-brand-gold/50 hover:text-white'
                    } ${!barber.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="block uppercase text-xs opacity-75">{dayName}</span>
                    <span className="block text-lg">{d}</span>
                  </button>
                 );
              })}
            </div>
          </div>

          {/* Time Picker */}
          {selectedDate && barber.isActive && (
             <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center justify-between">
                  <span>Horarios (40 min)</span>
                  <span className="text-xs text-gray-500 flex items-center"><Coffee size={10} className="mr-1"/> 12:00-14:00 Break</span>
              </label>
              {slotsForSelectedDate.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay horarios disponibles.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                    {slotsForSelectedDate.map(time => {
                    const isTaken = busySlots.includes(time);
                    return (
                        <button
                        key={time}
                        disabled={isTaken}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded border text-sm transition-all ${
                            isTaken 
                            ? 'bg-gray-800 text-gray-600 border-transparent cursor-not-allowed line-through' 
                            : selectedTime === time 
                                ? 'bg-white text-black border-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                : 'border-gray-700 text-gray-300 hover:border-brand-gold/50'
                        }`}
                        >
                        {time}
                        </button>
                    );
                    })}
                </div>
              )}
             </div>
          )}

          {/* Loyalty Options */}
          {user && (user.loyaltyPoints >= 50) && (
             <div className="mb-6 bg-brand-gold/10 border border-brand-gold/30 rounded-lg p-3">
                 <div className="flex items-center gap-2 text-brand-gold font-bold mb-2">
                     <Gem size={16} /> 
                     <span>Canjear Puntos ({user.loyaltyPoints})</span>
                 </div>
                 <div className="space-y-2">
                     {user.loyaltyPoints >= 50 && (
                         <label className="flex items-center space-x-2 cursor-pointer">
                             <input type="radio" name="redeem" checked={redeemOption === 'free'} onChange={() => setRedeemOption('free')} className="accent-brand-gold" />
                             <span className="text-sm text-gray-300">Corte Gratis (50 pts)</span>
                         </label>
                     )}
                     {user.loyaltyPoints >= 80 && (
                         <label className="flex items-center space-x-2 cursor-pointer">
                             <input type="radio" name="redeem" checked={redeemOption === 'combo'} onChange={() => setRedeemOption('combo')} className="accent-brand-gold" />
                             <span className="text-sm text-gray-300">Corte + Barba (80 pts)</span>
                         </label>
                     )}
                     <label className="flex items-center space-x-2 cursor-pointer">
                         <input type="radio" name="redeem" checked={redeemOption === 'none'} onChange={() => setRedeemOption('none')} className="accent-brand-gold" />
                         <span className="text-sm text-gray-300">Guardar puntos</span>
                     </label>
                 </div>
             </div>
          )}

          <div className="border-t border-gray-800 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Servicio</span>
              <span className="text-white">{selectedService ? selectedService.name : '-'}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Fecha</span>
              <span className="text-white">{selectedDate || '-'}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Hora</span>
              <span className="text-white">{selectedTime || '-'}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-800 mt-2">
              <span>Total</span>
              <span className={redeemOption !== 'none' ? 'text-green-400 line-through decoration-brand-gold' : 'text-brand-gold'}>
                  ${selectedService ? selectedService.price : '0'}
              </span>
              {redeemOption !== 'none' && <span className="text-brand-gold ml-2">$0</span>}
            </div>
            {redeemOption === 'none' && user && (
                <div className="text-right text-xs text-brand-gold italic">Ganarás 10 puntos al finalizar el servicio</div>
            )}
          </div>

          <button
            onClick={handleBooking}
            disabled={!selectedServiceId || !selectedDate || !selectedTime || bookingStatus === 'submitting' || !barber.isActive}
            className={`w-full mt-6 py-3 rounded-lg font-bold flex justify-center items-center transition-all ${
              !selectedServiceId || !selectedDate || !selectedTime || !barber.isActive
                ? 'bg-gray-800 cursor-not-allowed text-gray-500'
                : 'bg-brand-gold hover:bg-white text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
            }`}
          >
            {bookingStatus === 'submitting' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
            ) : bookingStatus === 'success' ? (
              <span className="flex items-center"><Check className="mr-2"/> ¡Confirmado!</span>
            ) : (
              'Confirmar Reserva'
            )}
          </button>
          
          {bookingStatus === 'error' && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs flex items-center">
              <AlertCircle size={14} className="mr-2 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};