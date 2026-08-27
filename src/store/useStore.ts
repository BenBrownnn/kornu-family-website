import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
}

interface AppState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  lightboxImage: string | null;
  setLightboxImage: (img: string | null) => void;
  rsvpedEvents: string[];
  toggleRSVP: (eventId: string) => void;
  initAuth: () => void;
  fetchRSVPs: () => void;
}


export const useStore = create<AppState>((set, get) => ({
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  isAuthenticated: false,
  currentUser: null,

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role, avatar')
      .eq('id', data.user.id)
      .single();
    set({
      isAuthenticated: true,
      currentUser: {
        id: data.user.id,
        email: data.user.email!,
        name: profile?.name || data.user.email!,
        role: (profile?.role as 'admin' | 'member') || 'member',
        avatar: profile?.avatar,
      },
    });
    get().fetchRSVPs();

    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, currentUser: null, currentPage: 'home' });
  },

  initAuth: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role, avatar')
        .eq('id', data.session.user.id)
        .single();

      set({
        isAuthenticated: true,
        currentUser: {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: profile?.name || data.session.user.email!,
          role: (profile?.role as 'admin' | 'member') || 'member',
          avatar: profile?.avatar,
        },
      });
      get().fetchRSVPs();
    }
  },

  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  lightboxImage: null,
  setLightboxImage: (img) => set({ lightboxImage: img }),

  rsvpedEvents: [],

fetchRSVPs: async () => {
  const user = get().currentUser;
  if (!user) return;
  const { data } = await supabase
    .from('rsvps')
    .select('event_id')
    .eq('user_id', user.id);
  set({ rsvpedEvents: data?.map((r) => r.event_id) || [] });
},

toggleRSVP: async (eventId: string) => {
  const user = get().currentUser;
  if (!user) return; // must be logged in
  const current = get().rsvpedEvents;
  const isRsvped = current.includes(eventId);

  if (isRsvped) {
    await supabase.from('rsvps').delete().eq('user_id', user.id).eq('event_id', eventId);
    set({ rsvpedEvents: current.filter((id) => id !== eventId) });
  } else {
    await supabase.from('rsvps').insert({ user_id: user.id, event_id: eventId });
    set({ rsvpedEvents: [...current, eventId] });
  }
},
}));