import { create } from "zustand";

const useAppStore = create((set) => ({
    // ── User ──────────────────────────────────────────────────────
    loggedInUserId: null,
    loggedInUserName: null,
    loggedInUserRole: null,
    loggedInSalary: null,
    loggedInDepartment: null,
    loggedInDesignation: null,
    loggedInJoiningDate: null,

    setLoggedInUser: (userData) => set({ ...userData }),

    // ── Employees ─────────────────────────────────────────────────
    employees: [],
    setEmployees: (data) => set({ employees: data }),

    // ── Attendance ────────────────────────────────────────────────
    allAttendance: [],
    setAllAttendance: (data) => set({ allAttendance: data }),

    // ── Leaves ───────────────────────────────────────────────────
    allLeaves: [],
    setAllLeaves: (data) => set({ allLeaves: data }),
}));

export default useAppStore;