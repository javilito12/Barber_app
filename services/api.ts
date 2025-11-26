import { supabase } from '../supabaseClient';
import { User, Barber, Service, Appointment, AuthResponse, UserRole, AppointmentStatus, Review } from '../types';

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      // 1. Intentar Loguear en el sistema de Autenticación
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error Auth:", error);
        if (error.message.includes("Email not confirmed")) {
           throw new Error("Debes confirmar tu email antes de entrar (o desactiva 'Confirm Email' en Supabase > Auth > Providers).");
        }
        if (error.message.includes("Invalid login credentials")) {
           throw new Error("Contraseña incorrecta o email no encontrado.");
        }
        throw new Error(error.message);
      }

      if (!data.user) throw new Error("No se pudo iniciar sesión");

      // 2. Intentar buscar el perfil en la tabla 'users'
      let { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error base de datos:", profileError);
        throw new Error("Error de conexión al buscar tu perfil.");
      }

      // ---------------------------------------------------------
      // AUTOREPARACIÓN: Si el usuario existe en Auth pero no en DB
      // ---------------------------------------------------------
      if (!profile) {
        console.warn("Usuario sin perfil en tabla pública. Intentando autoreparación...");
        
        const newProfile = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || 'Usuario',
            role: 'CLIENT',
            loyalty_points: 0
        };

        const { error: createError } = await supabase.from('users').insert([newProfile]);
        
        if (createError) {
             console.error("Error autoreparación:", createError);
             throw new Error("Tu cuenta existe pero no tiene perfil de datos y no se pudo crear automáticamente.");
        }

        // Usamos el perfil recién creado
        profile = newProfile;
      }

      // 3. Normalizar ROL (Evitar errores por mayúsculas/espacios)
      let roleRaw = (profile.role || 'CLIENT').toUpperCase().trim();
      let safeRole = UserRole.CLIENT;
      
      if (roleRaw === 'ADMIN') safeRole = UserRole.ADMIN;
      else if (roleRaw === 'BARBER') safeRole = UserRole.BARBER;

      // 4. Construir el objeto usuario
      const userDetails: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: safeRole,
        loyaltyPoints: profile.loyalty_points || 0,
        phone: profile.phone
      };

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
      if (!data.user) throw new Error("Fallo en el registro");

      // Si Supabase requiere confirmación de email y no hay sesión iniciada:
      if (!data.session) {
         // Retornamos el usuario pero sin token válido para forzar revisión de email o login manual
         throw new Error("Registro exitoso. Por favor revisa tu email para confirmar tu cuenta antes de iniciar sesión.");
      }

      // Esperar un momento para que el trigger de base de datos cree el perfil público
      await new Promise(r => setTimeout(r, 1500));

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

      let { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // Autoreparación silenciosa en getCurrentUser
      if (!profile) {
          const newProfile = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || 'Usuario',
            role: 'CLIENT',
            loyalty_points: 0
          };
          const { error } = await supabase.from('users').insert([newProfile]);
          if (!error) profile = newProfile;
          else return null;
      }

      // Normalizar Rol
      let roleRaw = (profile.role || 'CLIENT').toUpperCase().trim();
      let safeRole = UserRole.CLIENT;
      if (roleRaw === 'ADMIN') safeRole = UserRole.ADMIN;
      else if (roleRaw === 'BARBER') safeRole = UserRole.BARBER;

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: safeRole,
        loyaltyPoints: profile.loyalty_points || 0,
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
        role: (u.role || 'CLIENT').toUpperCase().trim() as UserRole,
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

      // FIX: Obtener todos los servicios disponibles en la BD para asignarlos al barbero
      // Esto soluciona el problema de que no aparezcan servicios al reservar
      const { data: servicesData } = await supabase.from('services').select('id');
      const allServiceIds = servicesData ? servicesData.map((s: any) => s.id) : [];

      return {
        id: data.id,
        name: data.name,
        bio: data.bio,
        photoUrl: data.photo_url,
        specialties: data.specialties || [],
        isActive: data.is_active,
        rating: data.rating,
        schedule: data.schedule,
        services: allServiceIds, // Asignamos IDs reales
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
      if (updates.bio) payload.bio = updates.bio;
      if (updates.photoUrl) payload.photo_url = updates.photoUrl;
      if (updates.specialties) payload.specialties = updates.specialties;
      if (updates.schedule) payload.schedule = updates.schedule;
      
      const { error } = await supabase.from('barbers').update(payload).eq('id', id);
      if (error) throw error;
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('barbers').delete().eq('id', id);
      if (error) throw error;
    },
    // NUEVO: Subir foto
    uploadPhoto: async (file: File): Promise<string> => {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}`;
        const { data, error } = await supabase.storage.from('barber-photos').upload(fileName, file);
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage.from('barber-photos').getPublicUrl(fileName);
        return publicUrl;
    },
    addReview: async (barberId: string, review: any): Promise<void> => {
        const { data: barber } = await supabase.from('barbers').select('reviews').eq('id', barberId).single();
        const currentReviews = barber?.reviews || [];
        
        const newReview = {
            ...review,
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0]
        };
        const updatedReviews = [newReview, ...currentReviews];
        
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
      if (updates.description) payload.description = updates.description;
      if (updates.durationMinutes) payload.duration_minutes = updates.durationMinutes;

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
            const newPoints = Math.max(0, user.loyalty_points - apt.pointsRedeemed);
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
        const { data: apt } = await supabase.from('appointments').select('*').eq('id', id).single();
        if (!apt) throw new Error("Cita no encontrada");

        const aptDate = new Date(`${apt.date}T${apt.time}`);
        const now = new Date();
        const diffHours = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        await supabase.from('appointments').update({ status: 'CANCELLED' }).eq('id', id);

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

        if (updates.status === AppointmentStatus.COMPLETED) {
             const { data: apt } = await supabase.from('appointments').select('user_id').eq('id', id).single();
             if (apt) {
                const { data: user } = await supabase.from('users').select('loyalty_points').eq('id', apt.user_id).single();
                if (user) {
                    await supabase.from('users').update({ loyalty_points: (user.loyalty_points || 0) + 10 }).eq('id', apt.user_id);
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