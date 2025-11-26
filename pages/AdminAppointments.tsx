import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Appointment, Barber, Service, AppointmentStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { XCircle, Shield, Edit, Calendar, CheckCircle } from 'lucide-react';

interface EnrichedAppointment extends Appointment {
  barber?: Barber;
  service?: Service;
}

export const AdminAppointments: React.FC = () => {
  const { isBarber, user, isAdmin } = useAuth();
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingApt, setEditingApt] = useState<EnrichedAppointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newBarberId, setNewBarberId] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const [apts, allBarbers, services] = await Promise.all([
        api.appointments.listAll(),
        api.barbers.list(true),
        api.services.list()
    ]);

    setBarbers(allBarbers);

    let filteredApts = apts;
    
    // Si es barbero, solo ve sus citas
    if (isBarber && user) {
        // Simulación: Si es el usuario barbero@barberia.com, es ID 'b1'
        const myBarberId = user.email === 'barbero@barberia.com' ? 'b1' : 'unknown';
        filteredApts = apts.filter(a => a.barberId === myBarberId);
    }

    const enriched = filteredApts.map(a => ({
        ...a,
        barber: allBarbers.find(b => b.id === a.barberId),
        service: services.find(s => s.id === a.serviceId)
    }));
    
    setAppointments(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  const handleCancel = async (id: string) => {
      if(!window.confirm("¿Liberar esta cita?")) return;
      await api.appointments.cancel(id);
      fetchAll();
  }

  const handleComplete = async (id: string) => {
      if(!window.confirm("¿Marcar cita como completada? Se sumarán 10 puntos al cliente.")) return;
      try {
          await api.appointments.update(id, { status: AppointmentStatus.COMPLETED });
          fetchAll();
      } catch (e) {
          alert("Error al actualizar estado");
      }
  }

  const openEditModal = (apt: EnrichedAppointment) => {
      setEditingApt(apt);
      setNewDate(apt.date);
      setNewTime(apt.time);
      setNewBarberId(apt.barberId);
  }

  const handleSaveEdit = async () => {
      if(!editingApt) return;
      try {
          // Check availability (basic check)
          const busy = await api.appointments.getBusySlots(newBarberId, newDate);
          if(busy.includes(newTime) && (newDate !== editingApt.date || newTime !== editingApt.time || newBarberId !== editingApt.barberId)) {
             if(!window.confirm("Ese horario ya parece ocupado. ¿Forzar cambio?")) return;
          }

          await api.appointments.update(editingApt.id, {
              date: newDate,
              time: newTime,
              barberId: newBarberId
          });
          setEditingApt(null);
          fetchAll();
      } catch (e) {
          alert("Error al actualizar");
      }
  }

  if (loading) return <div className="p-10 text-center">Cargando agenda...</div>;

  return (
    <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white flex items-center mb-8">
            {isAdmin ? <Shield className="mr-3 text-brand-gold" /> : <Calendar className="mr-3 text-brand-gold" />}
            {isAdmin ? 'Panel Global de Citas' : 'Mi Agenda'}
        </h1>

        <div className="bg-brand-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Fecha/Hora</th>
                            <th className="px-6 py-4">Barbero</th>
                            <th className="px-6 py-4">Servicio</th>
                            <th className="px-6 py-4">Cliente (ID)</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                        {appointments.length === 0 && (
                            <tr><td colSpan={6} className="p-6 text-center text-gray-500">No hay citas registradas.</td></tr>
                        )}
                        {appointments.map(apt => (
                            <tr key={apt.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white">
                                    <div className="font-bold text-brand-gold">{apt.date}</div>
                                    <div className="text-gray-400">{apt.time}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {apt.barber?.name}
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {apt.service?.name} (${apt.totalPrice})
                                    {apt.pointsRedeemed ? <span className="block text-xs text-yellow-500">Con Puntos</span> : ''}
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    {apt.userId}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-1 rounded border ${
                                        apt.status === AppointmentStatus.CONFIRMED ? 'bg-green-900/30 text-green-400 border-green-800' :
                                        apt.status === AppointmentStatus.CANCELLED ? 'bg-red-900/30 text-red-400 border-red-800' :
                                        apt.status === AppointmentStatus.COMPLETED ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                                        'text-gray-400'
                                    }`}>
                                        {apt.status === AppointmentStatus.CONFIRMED ? 'Confirmada' : 
                                         apt.status === AppointmentStatus.CANCELLED ? 'Cancelada' : 
                                         apt.status === AppointmentStatus.COMPLETED ? 'Completada' :
                                         apt.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex items-center space-x-2">
                                    {apt.status === AppointmentStatus.CONFIRMED && (
                                        <>
                                            <button onClick={() => handleComplete(apt.id)} className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded" title="Marcar como Completada (Suma Puntos)">
                                                <CheckCircle size={18} />
                                            </button>
                                            <button onClick={() => openEditModal(apt)} className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded" title="Reprogramar/Mover">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleCancel(apt.id)} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded" title="Liberar Cita">
                                                <XCircle size={18} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal de Edición */}
        {editingApt && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-brand-black border border-gray-700 p-6 rounded-xl w-full max-w-md">
                    <h3 className="text-xl font-bold text-white mb-4">Reprogramar / Mover Cita</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Fecha</label>
                            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Hora</label>
                            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                        </div>
                        {isAdmin && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Asignar Barbero</label>
                                <select value={newBarberId} onChange={e => setNewBarberId(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                                    {barbers.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} {b.isActive ? '' : '(Inactivo)'}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setEditingApt(null)} className="px-4 py-2 rounded text-gray-400 hover:text-white">Cancelar</button>
                        <button onClick={handleSaveEdit} className="px-4 py-2 rounded bg-brand-gold text-black font-bold hover:bg-white">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};