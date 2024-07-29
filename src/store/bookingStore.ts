// src/store/bookingStore.ts
import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { IFormEvent } from "../types/interfaces/event";

interface BookingState {
  bookingId: string | null;
  bookingDetails: IFormEvent | null; // Use IBookingAPI instead of BookingDetails
  setBookingId: (id: string) => void;
  setBookingDetails: (details: IFormEvent) => void; // Update to use IBookingAPI
  clearBookingId: () => void;
  clearBookingDetails: () => void;
}

const useBookingStore = create<BookingState>()(
  devtools(
    persist(
      (set) => ({
        bookingId: null,
        bookingDetails: null,
        setBookingId: (id) => set(() => ({ bookingId: id })),
        setBookingDetails: (details) => set(() => ({ bookingDetails: details })),
        clearBookingId: () => set(() => ({ bookingId: null })),
        clearBookingDetails: () => set(() => ({ bookingDetails: null }))
      }),
      {
        name: "booking-storage",
        storage: createJSONStorage(() => sessionStorage)
      }
    )
  )
);

export default useBookingStore;
