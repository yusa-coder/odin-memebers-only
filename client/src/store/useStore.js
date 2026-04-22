import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CLUB_PASSCODE = 'secret123';
const ADMIN_PASSCODE = 'admin456';

export const useStore = create(
  persist(
    (set, get) => ({
      users: [],
      messages: [],
      currentUser: null,

      addUser: (user) => {
        set((state) => ({ users: [...state.users, user] }));
      },

      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => set({ currentUser: null }),

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      deleteMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        })),
    }),
    {
      name: 'club-messages-storage',
    }
  )
);