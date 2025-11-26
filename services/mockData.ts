import { Barber, Service, User, UserRole } from '../types';

export const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Corte Clásico', description: 'Corte tradicional con tijera y máquina.', price: 15, durationMinutes: 40 },
  { id: 's2', name: 'Corte + Barba', description: 'Servicio completo de corte y perfilado.', price: 25, durationMinutes: 40 },
  { id: 's3', name: 'Afeitado Royal', description: 'Afeitado tradicional con navaja y toallas.', price: 20, durationMinutes: 40 },
  { id: 's4', name: 'Degradado (Fade)', description: 'Corte moderno con degradado perfecto.', price: 18, durationMinutes: 40 },
];

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'Carlos "The Blade"',
    bio: 'Especialista en cortes clásicos y afeitado a navaja.',
    photoUrl: 'https://images.unsplash.com/photo-1580852300654-03c803a14e24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    specialties: ['Old School', 'Navaja'],
    rating: 4.9,
    services: ['s1', 's2', 's3'],
    isActive: true,
    reviews: [
      { id: 'r1', userId: 'u-100', userName: 'Juan P.', rating: 5, comment: 'Excelente servicio, muy profesional.', date: '2023-10-15' }
    ],
    schedule: {
      days: [1, 2, 3, 4, 5],
      startHour: '09:00',
      endHour: '18:00'
    }
  },
  {
    id: 'b2',
    name: 'Sofía Styles',
    bio: 'Reina de los degradados y diseños modernos.',
    photoUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    specialties: ['Fade', 'Color'],
    rating: 4.8,
    services: ['s1', 's4'],
    isActive: true,
    reviews: [],
    schedule: {
      days: [2, 3, 4, 5, 6],
      startHour: '10:00',
      endHour: '19:00'
    }
  },
  {
    id: 'b3',
    name: 'Miguel Ángel',
    bio: 'Perfeccionista del estilo urbano.',
    photoUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    specialties: ['Urbano', 'Rápido'],
    rating: 4.7,
    services: ['s1', 's2', 's4'],
    isActive: true,
    reviews: [],
    schedule: {
      days: [1, 3, 5, 6],
      startHour: '08:00',
      endHour: '16:00'
    }
  }
];

export const INITIAL_ADMIN: User = {
  id: 'admin-1',
  name: 'Administrador',
  email: 'admin@barberia.com',
  role: UserRole.ADMIN,
  phone: '000-000-000',
  loyaltyPoints: 0
};

export const INITIAL_BARBER_USER: User = {
  id: 'user-b1', 
  name: 'Carlos Barbero',
  email: 'barbero@barberia.com',
  role: UserRole.BARBER,
  phone: '000-000-000',
  loyaltyPoints: 0
};

export const INITIAL_CLIENT: User = {
  id: 'client-demo-1',
  name: 'Cliente Demo',
  email: 'cliente@barberia.com',
  role: UserRole.CLIENT,
  phone: '555-010-202',
  loyaltyPoints: 0 // Inicia con 0 puntos
};