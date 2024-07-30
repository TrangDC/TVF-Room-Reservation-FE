// src/store/bookingStore.ts
import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { IFormEvent } from "../types/interfaces/event";
import { IDateRange } from "../types/interfaces/booking";

interface BookingState {
  bookingId: string | null;
  bookingDetails: IFormEvent | null; // Use IBookingAPI instead of BookingDetails
  dateRange: IDateRange;
  officeId: string;
  setOfficeId: (officeId: string) => void;
  setDateRange: (dateRange: IDateRange) => void;
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
        dateRange: {
          startDate: "",
          endDate: ""
        },
        officeId: "",
        setOfficeId: (officeId) => set(() => ({ officeId })),
        setDateRange: (dateRange) => set((state) => ({ ...state, dateRange })),
        setBookingId: (id) => set(() => ({ bookingId: id })),
        setBookingDetails: (details) => set(() => ({ bookingDetails: details })),
        clearDateRange: () => {
          localStorage.removeItem("dateRange");
        },
        clearBookingId: () => set(() => ({ bookingId: null })),
        clearBookingDetails: () => localStorage.removeItem("bookingDetails")
      }),
      {
        name: "booking-storage",
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);

export default useBookingStore;
