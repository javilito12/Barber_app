import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { UserCog, Search } from 'lucide-react';


export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchUsers = async () => {
    try {
        const data = await api.users.list();
        setUsers(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
      if(!window.confirm(`¿Cambiar rol del usuario a ${newRole}?`)) return;
      try {
          await api.users.updateRole(userId, newRole);
          fetchUsers();
      } catch (e: any) {
          alert(e.message || "Error al actualizar rol");
      }
  };

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(filter.toLowerCase()) || 
      u.email.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Cargando usuarios...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
            <UserCog className="mr-3 text-brand-gold" />
            Gestión de Usuarios
        </h1>
        <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
                type="text"
                placeholder="Buscar usuario..."
                className="w-full bg-black border border-gray-800 rounded pl-10 pr-4 py-2 text-white focus:border-brand-gold outline-none"
                value={filter}
                onChange={e => setFilter(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-brand-black border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-900 text-gray-400 text-sm uppercase">
                    <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Email / Teléfono</th>
                        <th className="px-6 py-4">Puntos</th>
                        <th className="px-6 py-4">Rol</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <span className="font-medium text-white block">{user.name}</span>
                                <span className="text-xs text-gray-500">ID: {user.id}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                                <div className="text-sm">{user.email}</div>
                                <div className="text-xs text-gray-500">{user.phone || 'Sin teléfono'}</div>
                            </td>
                            <td className="px-6 py-4 text-brand-gold font-bold">
                                {user.loyaltyPoints}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-xs px-2 py-1 rounded border font-bold ${
                                    user.role === UserRole.ADMIN ? 'bg-red-900/30 text-red-400 border-red-800' :
                                    user.role === UserRole.BARBER ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                                    'bg-green-900/30 text-green-400 border-green-800'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <select 
                                    className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded p-1 focus:border-brand-gold outline-none"
                                    value={user.role}
                                    onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole)}
                                    disabled={user.email === 'admin@barberia.com'} // Protect main admin
                                >
                                    <option value={UserRole.CLIENT}>Cliente</option>
                                    <option value={UserRole.BARBER}>Barbero</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                </select>
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