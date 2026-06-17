import { create } from 'zustand'
import type { Resident, Volunteer, Appointment, Pickup, Sorting, Charity, AppointmentStatus, TimeSlot } from '@/types'
import { mockResidents, mockVolunteers, mockAppointments, mockPickups, mockSortings, mockCharities } from '@/data/mockData'

interface ClothesStore {
  residents: Resident[]
  volunteers: Volunteer[]
  appointments: Appointment[]
  pickups: Pickup[]
  sortings: Sorting[]
  charities: Charity[]

  currentResidentId: string
  currentVolunteerId: string

  setCurrentResident: (id: string) => void
  setCurrentVolunteer: (id: string) => void

  createAppointment: (data: Omit<Appointment, 'id' | 'status' | 'bagLocked' | 'createdAt' | 'volunteerId'>) => string
  updateAppointmentBagCount: (id: string, bagCount: number) => boolean
  acceptAppointment: (appointmentId: string, volunteerId: string) => { success: boolean; reason?: string }
  completePickup: (appointmentId: string, data: { isDamp: boolean; isDamaged: boolean; pickupNotes: string }) => void
  confirmSorting: (appointmentId: string, data: { donatableCount: number; processableCount: number; sortedBy: string }) => void
  addCharity: (sortingId: string, data: { region: string; organization: string; quantity: number }) => void
  completeAppointment: (appointmentId: string) => void

  getResidentById: (id: string) => Resident | undefined
  getVolunteerById: (id: string) => Volunteer | undefined
  getPickupByAppointmentId: (appointmentId: string) => Pickup | undefined
  getSortingByAppointmentId: (appointmentId: string) => Sorting | undefined
  getCharitiesBySortingId: (sortingId: string) => Charity[]
  getAppointmentsByResidentId: (residentId: string) => Appointment[]
  getAppointmentsByVolunteerId: (volunteerId: string) => Appointment[]
  getPendingAppointments: () => Appointment[]
  getPickingUpAppointments: () => Appointment[]
  getSortedAppointments: () => Appointment[]
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const useClothesStore = create<ClothesStore>((set, get) => ({
  residents: mockResidents,
  volunteers: mockVolunteers,
  appointments: mockAppointments,
  pickups: mockPickups,
  sortings: mockSortings,
  charities: mockCharities,

  currentResidentId: 'resident-1',
  currentVolunteerId: 'volunteer-1',

  setCurrentResident: (id) => set({ currentResidentId: id }),
  setCurrentVolunteer: (id) => set({ currentVolunteerId: id }),

  createAppointment: (data) => {
    const id = generateId('apt')
    const newAppointment: Appointment = {
      ...data,
      id,
      volunteerId: null,
      status: 'pending',
      bagLocked: false,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ appointments: [...state.appointments, newAppointment] }))
    return id
  },

  updateAppointmentBagCount: (id, bagCount) => {
    const apt = get().appointments.find((a) => a.id === id)
    if (!apt || apt.bagLocked) return false
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, bagCount } : a)),
    }))
    return true
  },

  acceptAppointment: (appointmentId, volunteerId) => {
    const apt = get().appointments.find((a) => a.id === appointmentId)
    if (!apt) return { success: false, reason: '预约单不存在' }

    const volunteerApts = get().appointments.filter(
      (a) => a.volunteerId === volunteerId && a.status !== 'completed' && a.date === apt.date && a.timeSlot === apt.timeSlot
    )
    if (volunteerApts.length > 0) {
      return { success: false, reason: `该时段与已接单冲突（${apt.date} ${apt.timeSlot}）` }
    }

    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, volunteerId, status: 'picking_up' as AppointmentStatus } : a
      ),
    }))
    return { success: true }
  },

  completePickup: (appointmentId, data) => {
    const pickup: Pickup = {
      id: generateId('pickup'),
      appointmentId,
      volunteerId: get().appointments.find((a) => a.id === appointmentId)?.volunteerId ?? '',
      ...data,
      pickedUpAt: new Date().toISOString(),
    }
    set((state) => ({ pickups: [...state.pickups, pickup] }))
  },

  confirmSorting: (appointmentId, data) => {
    const sorting: Sorting = {
      id: generateId('sorting'),
      appointmentId,
      ...data,
      sortedAt: new Date().toISOString(),
    }
    set((state) => ({
      sortings: [...state.sortings, sorting],
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'sorted' as AppointmentStatus, bagLocked: true } : a
      ),
    }))
  },

  addCharity: (sortingId, data) => {
    const charity: Charity = {
      id: generateId('charity'),
      sortingId,
      ...data,
      donatedAt: new Date().toISOString(),
    }
    set((state) => ({ charities: [...state.charities, charity] }))
  },

  completeAppointment: (appointmentId) => {
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'completed' as AppointmentStatus } : a
      ),
    }))
  },

  getResidentById: (id) => get().residents.find((r) => r.id === id),
  getVolunteerById: (id) => get().volunteers.find((v) => v.id === id),
  getPickupByAppointmentId: (appointmentId) => get().pickups.find((p) => p.appointmentId === appointmentId),
  getSortingByAppointmentId: (appointmentId) => get().sortings.find((s) => s.appointmentId === appointmentId),
  getCharitiesBySortingId: (sortingId) => get().charities.filter((c) => c.sortingId === sortingId),
  getAppointmentsByResidentId: (residentId) => get().appointments.filter((a) => a.residentId === residentId),
  getAppointmentsByVolunteerId: (volunteerId) => get().appointments.filter((a) => a.volunteerId === volunteerId),
  getPendingAppointments: () => get().appointments.filter((a) => a.status === 'pending'),
  getPickingUpAppointments: () => get().appointments.filter((a) => a.status === 'picking_up'),
  getSortedAppointments: () => get().appointments.filter((a) => a.status === 'sorted'),
}))
