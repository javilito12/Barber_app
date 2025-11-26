import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Barber } from '../types';
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';

export const AdminBarberForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Barber>>({
    name: '',
    bio: '',
    photoUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    specialties: [],
    services: ['s1'],
    isActive: true,
    schedule: {
        days: [1,2,3,4,5],
        startHour: '09:00',
        endHour: '18:00'
    }
  });

  const [specialtyInput, setSpecialtyInput] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
        api.barbers.getById(id).then(b => {
            if(b) setFormData(b);
        });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if(isEdit && id) {
            await api.barbers.update(id, formData);
        } else {
            await api.barbers.create(formData as any);
        }
        navigate('/admin/barbers');
    } catch (error) {
        alert("Error al guardar");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      setUploading(true);
      try {
          const publicUrl = await api.barbers.uploadPhoto(file);
          setFormData({ ...formData, photoUrl: publicUrl });
      } catch (error: any) {
          alert("Error al subir imagen: " + error.message);
      } finally {
          setUploading(false);
      }
  };

  const toggleDay = (day: number) => {
    const currentDays = formData.schedule?.days || [];
    const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
    setFormData({
        ...formData,
        schedule: { ...formData.schedule!, days: newDays }
    });
  };

  const handleAddSpecialty = () => {
      if(!specialtyInput.trim()) return;
      setFormData({
          ...formData,
          specialties: [...(formData.specialties || []), specialtyInput]
      });
      setSpecialtyInput('');
  }

  const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/admin/barbers')} className="flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft size={20} className="mr-2" /> Volver
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">{isEdit ? 'Editar Barbero' : 'Nuevo Barbero'}</h1>

        <form onSubmit={handleSubmit} className="bg-brand-black border border-gray-800 rounded-xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                    <input 
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Foto del Barbero</label>
                    
                    <div className="flex items-center gap-4 mb-2">
                        {formData.photoUrl && (
                            <img src={formData.photoUrl} alt="Preview" className="h-16 w-16 rounded-full object-cover border border-brand-gold" />
                        )}
                        <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center border border-gray-600">
                            {uploading ? (
                                <span className="animate-pulse">Subiendo...</span>
                            ) : (
                                <>
                                    <Upload size={16} className="mr-2" />
                                    Subir Imagen
                                </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                        </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">O usa URL externa:</span>
                        <input 
                            className="flex-1 bg-gray-900 border border-gray-700 rounded p-1 text-xs text-gray-400"
                            value={formData.photoUrl}
                            onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Bio</label>
                <textarea 
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-24"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                />
            </div>

            <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded border border-gray-700">
                <input 
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 accent-brand-gold"
                />
                <label htmlFor="isActive" className="text-white font-medium">Barbero Activo (Visible en reservas)</label>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Especialidades</label>
                <div className="flex gap-2 mb-2">
                    <input 
                        className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white"
                        value={specialtyInput}
                        onChange={e => setSpecialtyInput(e.target.value)}
                        placeholder="Ej: Fade"
                    />
                    <button type="button" onClick={handleAddSpecialty} className="bg-gray-700 px-4 rounded text-white hover:bg-gray-600">Agregar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.specialties?.map(s => (
                        <span key={s} className="bg-gray-800 px-2 py-1 rounded text-sm border border-gray-700 flex items-center">
                            {s} 
                            <button type="button" onClick={() => setFormData({...formData, specialties: formData.specialties?.filter(sp => sp !== s)})} className="ml-2 text-red-400">×</button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Horario Laboral</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Hora Inicio</label>
                        <input 
                            type="time"
                            className="bg-gray-900 border border-gray-700 rounded p-2 text-white w-full"
                            value={formData.schedule?.startHour}
                            onChange={e => setFormData({...formData, schedule: {...formData.schedule!, startHour: e.target.value}})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Hora Fin</label>
                        <input 
                            type="time"
                            className="bg-gray-900 border border-gray-700 rounded p-2 text-white w-full"
                            value={formData.schedule?.endHour}
                            onChange={e => setFormData({...formData, schedule: {...formData.schedule!, endHour: e.target.value}})}
                        />
                    </div>
                </div>

                <label className="block text-sm text-gray-400 mb-2">Días Laborales</label>
                <div className="flex flex-wrap gap-2">
                    {daysMap.map((day, idx) => (
                        <button
                            type="button"
                            key={day}
                            onClick={() => toggleDay(idx)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                                formData.schedule?.days.includes(idx)
                                    ? 'bg-brand-gold text-black font-bold'
                                    : 'bg-gray-800 text-gray-400'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-brand-gold text-black font-bold py-3 rounded-lg hover:bg-white transition-colors flex justify-center items-center disabled:opacity-50">
                <Save size={20} className="mr-2" />
                {uploading ? 'Subiendo Imagen...' : 'Guardar Barbero'}
            </button>
        </form>
    </div>
  );
};