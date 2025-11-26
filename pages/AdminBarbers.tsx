import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Barber } from '../types';
import { Edit, Trash2, Plus, User, ToggleLeft, ToggleRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminBarbers: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBarbers = async () => {
    // True to fetch all, including inactive
    const data = await api.barbers.list(true);
    setBarbers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const handleDelete = async (id: string) => {
      if(!window.confirm("¿Seguro que quieres eliminar este barbero?")) return;
      await api.barbers.delete(id);
      fetchBarbers();
  };

  const toggleActive = async (barber: Barber) => {
      await api.barbers.update(barber.id, { isActive: !barber.isActive });
      fetchBarbers();
  };

  if (loading) return <div className="p-8 text-center">Cargando gestión...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
            <User className="mr-3 text-brand-gold" />
            Gestión de Barberos
        </h1>
        <Link 
            to="/admin/barbers/new"
            className="bg-brand-gold hover:bg-brand-gold-dark text-black font-bold px-4 py-2 rounded-lg flex items-center transition-colors"
        >
            <Plus size={20} className="mr-2" />
            Nuevo Barbero
        </Link>
      </div>

      <div className="bg-brand-black border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-900 text-gray-400 text-sm uppercase">
                    <tr>
                        <th className="px-6 py-4">Barbero</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4">Rating</th>
                        <th className="px-6 py-4">Horario</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {barbers.map(barber => (
                        <tr key={barber.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="relative">
                                        <img src={barber.photoUrl} alt="" className={`h-10 w-10 rounded-full object-cover mr-3 ${!barber.isActive ? 'grayscale' : ''}`} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{barber.name}</div>
                                        <div className="text-xs text-gray-500">ID: {barber.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <button 
                                    onClick={() => toggleActive(barber)}
                                    className={`flex items-center text-xs font-bold px-2 py-1 rounded border ${
                                        barber.isActive 
                                        ? 'bg-green-900/30 text-green-400 border-green-800 hover:bg-green-900/50' 
                                        : 'bg-red-900/30 text-red-400 border-red-800 hover:bg-red-900/50'
                                    }`}
                                >
                                    {barber.isActive ? 'ACTIVO' : 'INACTIVO'}
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center text-brand-gold">
                                    <Star size={14} fill="currentColor" className="mr-1"/>
                                    {barber.rating.toFixed(1)}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                                {barber.schedule.startHour} - {barber.schedule.endHour}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <Link to={`/admin/barbers/edit/${barber.id}`} className="inline-block p-2 text-blue-400 hover:bg-blue-900/20 rounded">
                                    <Edit size={18} />
                                </Link>
                                <button onClick={() => handleDelete(barber.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};