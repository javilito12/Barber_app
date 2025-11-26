import { User, Barber, Service, Appointment, AuthResponse, UserRole, AppointmentStatus, Review } from '../types';
import { INITIAL_BARBERS, INITIAL_SERVICES, INITIAL_ADMIN, INITIAL_BARBER_USER, INITIAL_CLIENT } from './mockData';

const DELAY_MS = 400;

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage Keys
const KEYS = {
  USERS: 'barber_app_users',
  BARBERS: 'barber_app_barbers',
  SERVICES: 'barber_app_services',
  APPOINTMENTS: 'barber_app_appointments',
  TOKEN: 'barber_app_token',
  CURRENT_USER: 'barber_app_current_user'
};

// Initialize DB
const initializeDB = () => {
  if (!localStorage.getItem(KEYS.BARBERS)) {
    localStorage.setItem(KEYS.BARBERS, JSON.stringify(INITIAL_BARBERS));
  }
  if (!localStorage.getItem(KEYS.SERVICES)) {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
  }
  if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    // Include the new Client Demo in initialization
    localStorage.setItem(KEYS.USERS, JSON.stringify([INITIAL_ADMIN, INITIAL_BARBER_USER, INITIAL_CLIENT]));
  }
};

initializeDB();

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      await delay(DELAY_MS);
      const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      
      // Admin Logic
      if (email === 'admin@barberia.com' && password === 'Admin123*') {
        const admin = users.find(u => u.email === email) || INITIAL_ADMIN;
        const token = `mock-admin-token-${Date.now()}`;
        localStorage.setItem(KEYS.TOKEN, token);
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(admin));
        return { user: admin, token };
      }

      // Barber Logic
      if (email === 'barbero@barberia.com' && password === 'Barber123*') {
        const barberUser = users.find(u => u.email === email) || INITIAL_BARBER_USER;
        const token = `mock-barber-token-${Date.now()}`;
        localStorage.setItem(KEYS.TOKEN, token);
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(barberUser));
        return { user: barberUser, token };
      }

      // Client Demo Logic
      if (email === 'cliente@barberia.com' && password === 'Cliente123*') {
        const clientUser = users.find(u => u.email === email) || INITIAL_CLIENT;
        const token = `mock-client-token-${Date.now()}`;
        localStorage.setItem(KEYS.TOKEN, token);
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(clientUser));
        return { user: clientUser, token };
      }

      const user = users.find(u => u.email === email);
      
      if (user && password === '123456') { 
        const token = `mock-jwt-token-${Date.now()}`;
        localStorage.setItem(KEYS.TOKEN, token);
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
        return { user, token };
      }
      throw new Error('Credenciales inválidas');
    },

    register: async (data: Omit<User, 'id' | 'role' | 'loyaltyPoints'> & { password: string }): Promise<AuthResponse> => {
      await delay(DELAY_MS);
      const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      
      if (users.find(u => u.email === data.email)) {
        throw new Error('El usuario ya existe');
      }

      const newUser: User = {
        id: `u-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: UserRole.CLIENT,
        loyaltyPoints: 0
      };

      users.push(newUser);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      
      const token = `mock-jwt-token-${Date.now()}`;
      localStorage.setItem(KEYS.TOKEN, token);
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));

      return { user: newUser, token };
    },

    logout: async () => {
      localStorage.removeItem(KEYS.TOKEN);
      localStorage.removeItem(KEYS.CURRENT_USER);
    },

    getCurrentUser: (): User | null => {
      const u = localStorage.getItem(KEYS.CURRENT_USER);
      if (!u) return null;
      // Re-fetch from DB to get updated points
      const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      const storedUser = JSON.parse(u);
      return users.find(user => user.id === storedUser.id) || storedUser;
    }
  },

  barbers: {
    list: async (includeInactive = false): Promise<Barber[]> => {
      await delay(DELAY_MS);
      const barbers: Barber[] = JSON.parse(localStorage.getItem(KEYS.BARBERS) || '[]');
      if (includeInactive) return barbers;
      return barbers.filter(b => b.isActive);
    },
    getById: async (id: string): Promise<Barber | undefined> => {
      await delay(DELAY_MS);
      const barbers: Barber[] = JSON.parse(localStorage.getItem(KEYS.BARBERS) || '[]');
      return barbers.find(b => b.id === id);
    },
    create: async (barber: Omit<Barber, 'id' | 'rating' | 'reviews'>): Promise<Barber> => {
        await delay(DELAY_MS);
        const barbers: Barber[] = JSON.parse(localStorage.getItem(KEYS.BARBERS) || '[]');
        const newBarber: Barber = {
            ...barber,
            id: `b-${Date.now()}`,
            rating: 5.0,
            reviews: [],
            isActive: true
        };
        barbers.push(newBarber);
        localStorage.setItem(KEYS.BARBERS, JSON.stringify(barbers));
        return newBarber;
    },
    update: async (id: string, updates: Partial<Barber>): Promise<Barber> => {
        await delay(DELAY_MS);
        const barbers: Barber[] = JSON.parse(localStorage.getItem(KEYS.BARBERS) || '[]');
        const index = barbers.findIndex(b => b.id === id);
        if (index === -1) throw new Error("Barbero no encontrado");
        
        barbers[index] = { ...barbers[index], ...updates };
        localStorage.setItem(KEYS.BARBERS, JSON.stringify(barbers));
        return barbers[index];
    },
    delete: async (id: string): Promise<void> => {
        await delay(DELAY_MS);
        let barbers: Barber[] = JSON.parse(localStorage.getItem(KEYS.BARBERS) || '[]');
        barbers = barbers.filter(b => b.id !== id);
        localStorage.setItem(KEYS.BARBERS, JSON.stringify(barbers));
    },
    addReview: async (barberId: string, review: Omit<Review, 'id' | 'date'>): Promise<void> => {
      await delay(DELAY_MS);
      const barbers: Barber[] = JSON.parse(localStorage.getItem(KEYS.BARBERS) || '[]');
      const index = barbers.findIndex(b => b.id === barberId);
      if (index === -1) throw new Error("Barbero no encontrado");

      const newReview: Review = {
        ...review,
        id: `rev-${Date.now()}`,
        date: new Date().toISOString().split('T')[0]
      };

      const currentReviews = barbers[index].reviews || [];
      const updatedReviews = [newReview, ...currentReviews];
      
      // Recalculate average
      const totalStars = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = totalStars / updatedReviews.length;

      barbers[index] = { 
        ...barbers[index], 
        reviews: updatedReviews,
        rating: Number(avg.toFixed(1))
      };
      
      localStorage.setItem(KEYS.BARBERS, JSON.stringify(barbers));
    }
  },

  services: {
    list: async (): Promise<Service[]> => {
      await delay(DELAY_MS);
      return JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]');
    },
    create: async (service: Omit<Service, 'id'>): Promise<Service> => {
      await delay(DELAY_MS);
      const services: Service[] = JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]');
      const newService = { ...service, id: `s-${Date.now()}` };
      services.push(newService);
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
      return newService;
    },
    update: async (id: string, updates: Partial<Service>): Promise<Service> => {
      await delay(DELAY_MS);
      const services: Service[] = JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]');
      const index = services.findIndex(s => s.id === id);
      if(index === -1) throw new Error("Servicio no encontrado");
      services[index] = { ...services[index], ...updates };
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
      return services[index];
    },
    delete: async (id: string): Promise<void> => {
      await delay(DELAY_MS);
      let services: Service[] = JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]');
      services = services.filter(s => s.id !== id);
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
    }
  },

  appointments: {
    create: async (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt'>): Promise<Appointment> => {
      await delay(DELAY_MS);
      const appointments: Appointment[] = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
      
      const conflict = appointments.find(
        a => a.barberId === appointmentData.barberId && 
             a.date === appointmentData.date && 
             a.time === appointmentData.time &&
             a.status !== AppointmentStatus.CANCELLED
      );

      if (conflict) {
        throw new Error('Este horario ya no está disponible.');
      }

      // Check for lunch break
      const [hour] = appointmentData.time.split(':').map(Number);
      if (hour >= 12 && hour < 14) {
          throw new Error('El barbero está en horario de descanso (12:00 - 14:00).');
      }

      const newAppointment: Appointment = {
        ...appointmentData,
        id: `apt-${Date.now()}`,
        status: AppointmentStatus.CONFIRMED,
        createdAt: new Date().toISOString()
      };

      appointments.push(newAppointment);
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));

      // Update User Points - ONLY DEDUCT here, do NOT add
      const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      const userIndex = users.findIndex(u => u.id === appointmentData.userId);
      if (userIndex !== -1) {
        let points = users[userIndex].loyaltyPoints || 0;
        
        // Deduct points if used
        if (appointmentData.pointsRedeemed) {
          points -= appointmentData.pointsRedeemed;
          users[userIndex].loyaltyPoints = points;
          localStorage.setItem(KEYS.USERS, JSON.stringify(users));
          
          // Update current user session if needed
          const currentUser = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || '{}');
          if (currentUser.id === users[userIndex].id) {
            localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
          }
        }
      }

      return newAppointment;
    },

    listByUser: async (userId: string): Promise<Appointment[]> => {
      await delay(DELAY_MS);
      const appointments: Appointment[] = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
      return appointments.filter(a => a.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    listAll: async (): Promise<Appointment[]> => {
        await delay(DELAY_MS);
        const appointments: Appointment[] = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
        return appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    update: async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
        await delay(DELAY_MS);
        const appointments: Appointment[] = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
        const index = appointments.findIndex(a => a.id === id);
        if (index === -1) throw new Error("Cita no encontrada");
        
        const oldStatus = appointments[index].status;
        
        // Apply updates
        appointments[index] = { ...appointments[index], ...updates };
        
        // ADD POINTS LOGIC: If status changed TO Completed
        if (updates.status === AppointmentStatus.COMPLETED && oldStatus !== AppointmentStatus.COMPLETED) {
            const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
            const userIndex = users.findIndex(u => u.id === appointments[index].userId);
            if (userIndex !== -1) {
                // Add 10 points
                users[userIndex].loyaltyPoints = (users[userIndex].loyaltyPoints || 0) + 10;
                localStorage.setItem(KEYS.USERS, JSON.stringify(users));
                
                // Refresh session if it's the current user (unlikely for admin action, but safe)
                const currentUser = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || '{}');
                if (currentUser.id === users[userIndex].id) {
                    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
                }
            }
        }

        localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
        return appointments[index];
    },

    cancel: async (appointmentId: string): Promise<{ penalized: boolean }> => {
      await delay(DELAY_MS);
      const appointments: Appointment[] = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
      const index = appointments.findIndex(a => a.id === appointmentId);
      
      let penalized = false;

      if (index !== -1) {
        const apt = appointments[index];
        const aptDate = new Date(`${apt.date}T${apt.time}`);
        const now = new Date();
        
        // Calculate hours difference
        const diffInMs = aptDate.getTime() - now.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        appointments[index].status = AppointmentStatus.CANCELLED;
        localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));

        // Penalty Logic: If cancellation is less than 24 hours before
        if (diffInHours < 24) {
            const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
            const userIndex = users.findIndex(u => u.id === apt.userId);
            if(userIndex !== -1) {
                users[userIndex].loyaltyPoints -= 10; // Can go negative
                localStorage.setItem(KEYS.USERS, JSON.stringify(users));
                
                // Refresh session if it's current user
                const currentUser = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || '{}');
                if (currentUser.id === users[userIndex].id) {
                    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
                }
                penalized = true;
            }
        }
      }
      return { penalized };
    },

    // Eliminar una cita específica del historial (Borrar permanentemente)
    delete: async (appointmentId: string): Promise<void> => {
      await delay(DELAY_MS);
      let appointments: Appointment[] = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
      appointments = appointments.filter(a => a.id !== appointmentId);
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
    },

    // Limpiar historial de citas finalizadas/canceladas de un usuario
    clearHistory: async (userId: string): Promise<void> => {
      await delay(DELAY_MS);
      let appointments: Appointment[] = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
      
      // Mantener solo las que NO son del usuario O las que son del usuario pero están PENDING/CONFIRMED
      appointments = appointments.filter(a => {
        if (a.userId !== userId) return true;
        return a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED;
      });

      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
    },
    
    getBusySlots: async (barberId: string, date: string): Promise<string[]> => {
      await delay(300);
      const appointments: Appointment[] = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
      return appointments
        .filter(a => a.barberId === barberId && a.date === date && a.status !== AppointmentStatus.CANCELLED)
        .map(a => a.time);
    }
  }
};