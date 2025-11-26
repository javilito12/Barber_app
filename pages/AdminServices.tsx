import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Service } from '../types';
import { Plus, Trash2, Edit, Save, X, List } from 'lucide-react';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Service>>({});

  const fetchServices = async () => {
    const data = await api.services.list();
    setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (s: Service) => {
    setEditingId(s.id);
    setFormData(s);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: 0, durationMinutes: 40 });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return alert("Nombre y precio requeridos");
    
    try {
      if (isCreating) {
        await api.services.create(formData as any);
      } else if (editingId) {
        await api.services.update(editingId, formData);
      }
      handleCancel();
      fetchServices();
    } catch (e) {
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("¿Eliminar este servicio?")) return;
    await api.services.delete(id);
    fetchServices();
  };

  if (loading) return <div className="p-8 text-center">Cargando servicios...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
            <List className="mr-3 text-brand-gold" />
            Gestión de Servicios y Precios
        </h1>
        <button 
            onClick={handleCreate}
            className="bg-brand-gold hover:bg-brand-gold-dark text-black font-bold px-4 py-2 rounded-lg flex items-center transition-colors"
        >
            <Plus size={20} className="mr-2" />
            Nuevo Servicio
        </button>
      </div>

      {isCreating && (
        <div className="bg-gray-900 border border-brand-gold/50 p-6 rounded-xl mb-8 animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-4">Crear Nuevo Servicio</h3>
          <ServiceForm formData={formData} setFormData={setFormData} onSave={handleSave} onCancel={handleCancel} />
        </div>
      )}

      <div className="grid gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-brand-black border border-gray-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-gray-600">
             {editingId === service.id ? (
                <div className="w-full">
                    <ServiceForm formData={formData} setFormData={setFormData} onSave={handleSave} onCancel={handleCancel} />
                </div>
             ) : (
                <>
                  <div>
                    <h3 className="text-xl font-bold text-white">{service.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{service.description}</p>
                    <div className="flex gap-4 text-sm font-medium">
                        <span className="text-brand-gold text-lg">${service.price}</span>
                        <span className="text-gray-500 bg-gray-900 px-2 py-0.5 rounded flex items-center">
                            {service.durationMinutes} min
                        </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(service)} className="p-2 text-blue-400 hover:bg-blue-900/20 rounded"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(service.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded"><Trash2 size={18}/></button>
                  </div>
                </>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ServiceForm = ({ formData, setFormData, onSave, onCancel }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="md:col-span-2">
            <label className="text-xs text-gray-500">Nombre</label>
            <input 
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" 
                value={formData.name || ''} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
            />
        </div>
        <div className="md:col-span-2">
            <label className="text-xs text-gray-500">Descripción</label>
            <input 
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" 
                value={formData.description || ''} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
            />
        </div>
        <div>
            <label className="text-xs text-gray-500">Precio ($)</label>
            <input 
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" 
                value={formData.price || 0} 
                onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
            />
        </div>
        <div>
            <label className="text-xs text-gray-500">Duración (min)</label>
            <input 
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" 
                value={formData.durationMinutes || 40} 
                onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} 
            />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white flex items-center"><X size={16} className="mr-1"/> Cancelar</button>
            <button onClick={onSave} className="px-4 py-2 bg-brand-gold text-black font-bold rounded flex items-center hover:bg-white"><Save size={16} className="mr-1"/> Guardar</button>
        </div>
    </div>
);