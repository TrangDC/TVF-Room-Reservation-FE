import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";

interface UserState {
  user: {
    username: string;
    email: string;
    role?: string;
  };
  setUser: (user: { username: string; email: string; role: string }) => void;
  deleteUser: () => void;
}

const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: {
          username: "",
          email: "",
          role: ""
        },
        setUser: (data) => set(() => ({ user: data })),
        deleteUser: () => set(() => ({ user: { username: "", email: "", role: "" } }))
      }),
      {
        name: "user-storage",
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);

export default useUserStore;
