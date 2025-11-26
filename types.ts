export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  BARBER = 'BARBER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  loyaltyPoints: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export interface BarberSchedule {
  days: number[]; // 0 = Domingo, 1 = Lunes, etc.
  startHour: string; // "09:00"
  endHour: string; // "18:00"
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Barber {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  specialties: string[];
  rating: number;
  services: string[]; // Service IDs
  schedule: BarberSchedule;
  isActive: boolean; // Para vacaciones o inhabilitar
  reviews: Review[];
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface Appointment {
  id: string;
  userId: string;
  barberId: string;
  serviceId: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  time: string; // HH:mm
  status: AppointmentStatus;
  totalPrice: number;
  pointsRedeemed?: number; // Si se usaron puntos
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}