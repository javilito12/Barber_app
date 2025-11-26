import { supabase } from '../supabaseClient';
import { User, Barber, Service, Appointment, AuthResponse, UserRole, AppointmentStatus, Review } from '../types';

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("No user found");

      // Obtener datos extendidos del usuario (rol, puntos)
      const userDetails = await api.auth.getCurrentUser();
      if (!userDetails) throw new Error("Error loading user profile");

      return {
        user: userDetails,
        token: data.session?.access_token || '',
      };
    },

    register: async (userData: any): Promise<AuthResponse> => {
      // 1. Crear usuario en Auth de Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name, // Esto se pasará al trigger handle_new_user
          },
        },
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Registration failed");

      // Esperar un momento para que el trigger de base de datos cree el perfil público
      await new Promise(r => setTimeout(r, 1000));

      const newUser: User = {
        id: data.user.id,
        email: userData.email,
        name: userData.name,
        role: UserRole.CLIENT,
        loyaltyPoints: 0
      };

      return {
        user: newUser,
        token: data.session?.access_token || '',
      };
    },

    logout: async () => {
      await supabase.auth.signOut();
    },

    getCurrentUser: async (): Promise<User | null> => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile) return null;

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
        loyaltyPoints: profile.loyalty_points,
        phone: profile.phone
      };
    }
  },

  users: {
    list: async (): Promise<User[]> => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as UserRole,
        loyaltyPoints: u.loyalty_points,
        phone: u.phone
      }));
    },
    updateRole: async (userId: string, newRole: UserRole): Promise<void> => {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
    }
  },

  barbers: {
    list: async (includeInactive = false): Promise<Barber[]> => {
      let query = supabase.from('barbers').select('*');
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) throw error;

      return data.map((b: any) => ({
        id: b.id,
        name: b.name,
        bio: b.bio,
        photoUrl: b.photo_url,
        specialties: b.specialties || [],
        isActive: b.is_active,
        rating: b.rating,
        schedule: b.schedule,
        services: [], // En una app real, esto sería una relación
        reviews: b.reviews || []
      }));
    },
    getById: async (id: string): Promise<Barber | undefined> => {
      const { data, error } = await supabase.from('barbers').select('*').eq('id', id).single();
      if (error) return undefined;
      return {
        id: data.id,
        name: data.name,
        bio: data.bio,
        photoUrl: data.photo_url,
        specialties: data.specialties || [],
        isActive: data.is_active,
        rating: data.rating,
        schedule: data.schedule,
        services: ['s1', 's2', 's3', 's4'], // Mock connection for simplicity
        reviews: data.reviews || []
      };
    },
    create: async (barber: any): Promise<void> => {
      const { error } = await supabase.from('barbers').insert([{
        name: barber.name,
        bio: barber.bio,
        photo_url: barber.photoUrl,
        specialties: barber.specialties,
        is_active: barber.isActive,
        schedule: barber.schedule
      }]);
      if (error) throw error;
    },
    update: async (id: string, updates: any): Promise<void> => {
      const payload: any = {};
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      if (updates.name) payload.name = updates.name;
      if (updates.schedule) payload.schedule = updates.schedule;
      
      const { error } = await supabase.from('barbers').update(payload).eq('id', id);
      if (error) throw error;
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('barbers').delete().eq('id', id);
      if (error) throw error;
    },
    addReview: async (barberId: string, review: any): Promise<void> => {
        // En una app real, insertarías en una tabla 'reviews' y usarías un trigger
        // Para simplificar, obtenemos, añadimos y guardamos
        const { data: barber } = await supabase.from('barbers').select('reviews').eq('id', barberId).single();
        const currentReviews = barber?.reviews || [];
        
        const newReview = {
            ...review,
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0]
        };
        const updatedReviews = [newReview, ...currentReviews];
        
        // Recalcular rating
        const total = updatedReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
        const newRating = total / updatedReviews.length;

        await supabase.from('barbers').update({
            reviews: updatedReviews,
            rating: newRating
        }).eq('id', barberId);
    }
  },

  services: {
    list: async (): Promise<Service[]> => {
      const { data, error } = await supabase.from('services').select('*');
      if (error) throw error;
      return data.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        durationMinutes: s.duration_minutes
      }));
    },
    create: async (service: any): Promise<void> => {
      const { error } = await supabase.from('services').insert([{
        name: service.name,
        description: service.description,
        price: service.price,
        duration_minutes: service.durationMinutes
      }]);
      if (error) throw error;
    },
    update: async (id: string, updates: any): Promise<void> => {
      const payload: any = {};
      if (updates.price) payload.price = updates.price;
      if (updates.name) payload.name = updates.name;
      const { error } = await supabase.from('services').update(payload).eq('id', id);
      if (error) throw error;
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    }
  },

  appointments: {
    create: async (apt: any): Promise<void> => {
      // 1. Verificar disponibilidad
      const { data: busy } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', apt.barberId)
        .eq('date', apt.date)
        .eq('time', apt.time)
        .neq('status', 'CANCELLED');
      
      if (busy && busy.length > 0) throw new Error("Horario no disponible");

      // 2. Crear cita
      const { error } = await supabase.from('appointments').insert([{
        user_id: apt.userId,
        barber_id: apt.barberId,
        service_id: apt.serviceId,
        date: apt.date,
        time: apt.time,
        total_price: apt.totalPrice,
        points_redeemed: apt.pointsRedeemed
      }]);

      if (error) throw error;

      // 3. Descontar puntos si aplica
      if (apt.pointsRedeemed > 0) {
        const { data: user } = await supabase.from('users').select('loyalty_points').eq('id', apt.userId).single();
        if (user) {
            const newPoints = user.loyalty_points - apt.pointsRedeemed;
            await supabase.from('users').update({ loyalty_points: newPoints }).eq('id', apt.userId);
        }
      }
    },

    listByUser: async (userId: string): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data.map((a: any) => mapAppointment(a));
    },

    listAll: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data.map((a: any) => mapAppointment(a));
    },

    cancel: async (id: string): Promise<{ penalized: boolean }> => {
        // Obtener cita
        const { data: apt } = await supabase.from('appointments').select('*').eq('id', id).single();
        if (!apt) throw new Error("Cita no encontrada");

        // Calcular tiempo
        const aptDate = new Date(`${apt.date}T${apt.time}`);
        const now = new Date();
        const diffHours = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Actualizar estado
        await supabase.from('appointments').update({ status: 'CANCELLED' }).eq('id', id);

        // Penalizar si es tarde
        if (diffHours < 24) {
            const { data: user } = await supabase.from('users').select('loyalty_points').eq('id', apt.user_id).single();
            if (user) {
                await supabase.from('users').update({ loyalty_points: user.loyalty_points - 10 }).eq('id', apt.user_id);
                return { penalized: true };
            }
        }
        return { penalized: false };
    },

    update: async (id: string, updates: any): Promise<void> => {
        const payload: any = {};
        if (updates.status) payload.status = updates.status;
        if (updates.date) payload.date = updates.date;
        if (updates.time) payload.time = updates.time;
        if (updates.barberId) payload.barber_id = updates.barberId;

        const { error } = await supabase.from('appointments').update(payload).eq('id', id);
        if (error) throw error;

        // Si se completa, sumar puntos
        if (updates.status === AppointmentStatus.COMPLETED) {
             const { data: apt } = await supabase.from('appointments').select('user_id').eq('id', id).single();
             if (apt) {
                const { data: user } = await supabase.from('users').select('loyalty_points').eq('id', apt.user_id).single();
                if (user) {
                    await supabase.from('users').update({ loyalty_points: user.loyalty_points + 10 }).eq('id', apt.user_id);
                }
             }
        }
    },

    getBusySlots: async (barberId: string, date: string): Promise<string[]> => {
        const { data } = await supabase
            .from('appointments')
            .select('time')
            .eq('barber_id', barberId)
            .eq('date', date)
            .neq('status', 'CANCELLED');
        return data?.map((a: any) => a.time) || [];
    },

    delete: async (id: string): Promise<void> => {
        await supabase.from('appointments').delete().eq('id', id);
    },

    clearHistory: async (userId: string): Promise<void> => {
        // En SQL real es un DELETE WHERE status IN (...)
        await supabase.from('appointments')
            .delete()
            .eq('user_id', userId)
            .in('status', ['COMPLETED', 'CANCELLED']);
    }
  }
};

const mapAppointment = (dbRecord: any): Appointment => ({
    id: dbRecord.id,
    userId: dbRecord.user_id,
    barberId: dbRecord.barber_id,
    serviceId: dbRecord.service_id,
    date: dbRecord.date,
    time: dbRecord.time,
    status: dbRecord.status as AppointmentStatus,
    totalPrice: dbRecord.total_price,
    pointsRedeemed: dbRecord.points_redeemed,
    createdAt: dbRecord.created_at
});