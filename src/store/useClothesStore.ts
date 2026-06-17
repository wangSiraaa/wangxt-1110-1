import { create } from 'zustand'
import type {
  Resident,
  Volunteer,
  Appointment,
  Pickup,
  Sorting,
  SortingCategory,
  Charity,
  AppointmentStatus,
  TimeSlot,
  WeatherStatus,
  ClothesCategory,
  DestinationRule,
} from '@/types'
import {
  mockResidents,
  mockVolunteers,
  mockAppointments,
  mockPickups,
  mockSortings,
  mockCharities,
} from '@/data/mockData'

const WEIGHT_PER_BAG_ESTIMATE = 5
const WEIGHT_DEVIATION_THRESHOLD = 0.3
const BAD_WEATHER: WeatherStatus[] = ['rain', 'storm', 'snow']

const defaultCategoryDestination: Record<ClothesCategory, DestinationRule> = {
  winter: 'donate_mountain',
  children: 'donate_orphanage',
  normal: 'donate_community',
  damaged: 'recycle_process',
}

const weatherLabels: Record<WeatherStatus, string> = {
  sunny: '晴天',
  cloudy: '多云',
  rain: '下雨',
  storm: '暴雨',
  snow: '下雪',
}

const categoryLabels: Record<ClothesCategory, string> = {
  winter: '冬衣',
  children: '童装',
  normal: '普通衣物',
  damaged: '破损物品',
}

const destinationRuleLabels: Record<DestinationRule, string> = {
  donate_mountain: '捐赠山区',
  donate_orphanage: '捐赠孤儿院',
  donate_community: '社区救助',
  recycle_process: '回收处理',
  destroy: '销毁处理',
}

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

  createAppointment: (
    data: Omit<
      Appointment,
      | 'id'
      | 'status'
      | 'bagLocked'
      | 'createdAt'
      | 'volunteerId'
      | 'weightDeviation'
      | 'reviewNotes'
      | 'reviewedAt'
      | 'orderIndex'
    >
  ) => string
  updateAppointmentBagCount: (id: string, bagCount: number) => boolean

  acceptAppointment: (
    appointmentId: string,
    volunteerId: string
  ) => { success: boolean; reason?: string }
  checkTimeConflict: (volunteerId: string, date: string, timeSlot: TimeSlot) => boolean
  checkRouteConflict: (volunteerId: string, appointmentId: string) => boolean
  checkWeather: (date: string) => WeatherStatus
  autoReassign: (
    appointmentId: string,
    reason: string
  ) => { success: boolean; newVolunteerId?: string; reason?: string }

  completePickup: (
    appointmentId: string,
    data: {
      isDamp: boolean
      isDamaged: boolean
      pickupNotes: string
      actualWeight: number
      weather: WeatherStatus
    }
  ) => { needReview: boolean; deviation: number }
  getWeightDeviation: (bagCount: number, actualWeight: number) => number

  confirmReview: (
    appointmentId: string,
    data: { approved: boolean; reviewNotes: string }
  ) => void

  confirmSorting: (
    appointmentId: string,
    data: {
      categories: SortingCategory[]
      sortedBy: string
    }
  ) => void

  addCharity: (
    sortingId: string,
    data: {
      region: string
      organization: string
      quantity: number
      weight: number
      clothesCategory: ClothesCategory
      destinationRule: DestinationRule
    }
  ) => void

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
  getReviewingAppointments: () => Appointment[]
  getSortedAppointments: () => Appointment[]

  getWeatherLabel: (w: WeatherStatus) => string
  getCategoryLabel: (c: ClothesCategory) => string
  getDestinationRuleLabel: (d: DestinationRule) => string
  getDefaultDestination: (c: ClothesCategory) => DestinationRule
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const mockWeatherMap: Record<string, WeatherStatus> = {
  '2026-06-18': 'sunny',
  '2026-06-19': 'cloudy',
  '2026-06-20': 'rain',
  '2026-06-21': 'storm',
}

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
    const maxOrderIndex = get().appointments.reduce(
      (max, a) => Math.max(max, a.orderIndex),
      -1
    )
    const newAppointment: Appointment = {
      ...data,
      id,
      volunteerId: null,
      status: 'pending',
      bagLocked: false,
      weightDeviation: null,
      reviewNotes: null,
      reviewedAt: null,
      orderIndex: maxOrderIndex + 1,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ appointments: [...state.appointments, newAppointment] }))
    return id
  },

  updateAppointmentBagCount: (id, bagCount) => {
    const apt = get().appointments.find((a) => a.id === id)
    if (!apt || apt.bagLocked) return false
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, bagCount } : a
      ),
    }))
    return true
  },

  checkTimeConflict: (volunteerId, date, timeSlot) => {
    const volunteerApts = get().appointments.filter(
      (a) =>
        a.volunteerId === volunteerId &&
        a.status !== 'completed' &&
        a.date === date &&
        a.timeSlot === timeSlot
    )
    return volunteerApts.length > 0
  },

  checkRouteConflict: (volunteerId, appointmentId) => {
    const apt = get().appointments.find((a) => a.id === appointmentId)
    if (!apt) return false
    const resident = get().getResidentById(apt.residentId)
    if (!resident) return false

    const volunteerApts = get().appointments.filter(
      (a) =>
        a.volunteerId === volunteerId &&
        a.status !== 'completed' &&
        a.date === apt.date &&
        a.id !== appointmentId
    )

    for (const va of volunteerApts) {
      const vr = get().getResidentById(va.residentId)
      if (!vr) continue
      const addr1 = resident.address
      const addr2 = vr.address
      if (addr1 !== addr2 && !addr1.startsWith(addr2.split('栋')[0])) {
        return true
      }
    }
    return false
  },

  checkWeather: (date) => {
    return mockWeatherMap[date] || 'sunny'
  },

  acceptAppointment: (appointmentId, volunteerId) => {
    const apt = get().appointments.find((a) => a.id === appointmentId)
    if (!apt) return { success: false, reason: '预约单不存在' }

    if (get().checkTimeConflict(volunteerId, apt.date, apt.timeSlot)) {
      return {
        success: false,
        reason: `该时段与已接单冲突（${apt.date} ${apt.timeSlot}）`,
      }
    }

    const weather = get().checkWeather(apt.date)
    if (BAD_WEATHER.includes(weather)) {
      return {
        success: false,
        reason: `${apt.date}天气为${weatherLabels[weather]}，不适合上门，系统将自动转派`,
      }
    }

    if (get().checkRouteConflict(volunteerId, appointmentId)) {
      return {
        success: false,
        reason: '该订单与已有任务路线冲突，系统将自动转派',
      }
    }

    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, volunteerId, status: 'picking_up' as AppointmentStatus }
          : a
      ),
    }))
    return { success: true }
  },

  autoReassign: (appointmentId, reason) => {
    const apt = get().appointments.find((a) => a.id === appointmentId)
    if (!apt) return { success: false, reason: '预约单不存在' }

    const originalVolunteerId = apt.volunteerId

    for (const v of get().volunteers) {
      if (v.id === originalVolunteerId) continue
      if (get().checkTimeConflict(v.id, apt.date, apt.timeSlot)) continue
      if (get().checkRouteConflict(v.id, appointmentId)) continue

      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === appointmentId
            ? {
                ...a,
                volunteerId: v.id,
                status: 'picking_up' as AppointmentStatus,
              }
            : a
        ),
        pickups: state.pickups.map((p) =>
          p.appointmentId === appointmentId
            ? {
                ...p,
                autoReassigned: true,
                originalVolunteerId,
                reassignReason: reason,
              }
            : p
        ),
      }))
      return { success: true, newVolunteerId: v.id, originalVolunteerId }
    }
    return { success: false, reason: '暂无可用志愿者，保留原预约顺序等待' }
  },

  getWeightDeviation: (bagCount, actualWeight) => {
    const estimated = bagCount * WEIGHT_PER_BAG_ESTIMATE
    if (estimated === 0) return 0
    return Math.abs(actualWeight - estimated) / estimated
  },

  completePickup: (appointmentId, data) => {
    const apt = get().appointments.find((a) => a.id === appointmentId)
    if (!apt) return { needReview: false, deviation: 0 }

    const deviation = get().getWeightDeviation(apt.bagCount, data.actualWeight)
    const needReview = deviation > WEIGHT_DEVIATION_THRESHOLD

    const pickup: Pickup = {
      id: generateId('pickup'),
      appointmentId,
      volunteerId: apt.volunteerId ?? '',
      actualWeight: data.actualWeight,
      weather: data.weather,
      hasRouteConflict: false,
      autoReassigned: false,
      originalVolunteerId: null,
      reassignReason: null,
      ...data,
      pickedUpAt: new Date().toISOString(),
    }

    set((state) => ({
      pickups: [...state.pickups, pickup],
      appointments: state.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              weightDeviation: deviation,
              status: needReview
                ? ('reviewing' as AppointmentStatus)
                : ('sorted' as AppointmentStatus),
            }
          : a
      ),
    }))

    return { needReview, deviation }
  },

  confirmReview: (appointmentId, data) => {
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: data.approved
                ? ('sorted' as AppointmentStatus)
                : ('picking_up' as AppointmentStatus),
              bagLocked: data.approved,
              reviewNotes: data.reviewNotes,
              reviewedAt: new Date().toISOString(),
            }
          : a
      ),
    }))
  },

  confirmSorting: (appointmentId, data) => {
    const categoriesWithDestination = data.categories.map((c) => ({
      ...c,
      destinationRule: c.destinationRule || defaultCategoryDestination[c.category],
    }))

    const totalWeight = categoriesWithDestination.reduce((s, c) => s + c.weight, 0)
    const donatableWeight = categoriesWithDestination
      .filter((c) => c.category !== 'damaged')
      .reduce((s, c) => s + c.weight, 0)
    const processableWeight = categoriesWithDestination
      .filter((c) => c.category === 'damaged')
      .reduce((s, c) => s + c.weight, 0)

    const sorting: Sorting = {
      id: generateId('sorting'),
      appointmentId,
      categories: categoriesWithDestination,
      donatableWeight,
      processableWeight,
      totalWeight,
      sortedAt: new Date().toISOString(),
      sortedBy: data.sortedBy,
    }

    set((state) => ({
      sortings: [...state.sortings, sorting],
      appointments: state.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'sorted' as AppointmentStatus, bagLocked: true }
          : a
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
        a.id === appointmentId
          ? { ...a, status: 'completed' as AppointmentStatus }
          : a
      ),
    }))
  },

  getResidentById: (id) => get().residents.find((r) => r.id === id),
  getVolunteerById: (id) => get().volunteers.find((v) => v.id === id),
  getPickupByAppointmentId: (appointmentId) =>
    get().pickups.find((p) => p.appointmentId === appointmentId),
  getSortingByAppointmentId: (appointmentId) =>
    get().sortings.find((s) => s.appointmentId === appointmentId),
  getCharitiesBySortingId: (sortingId) =>
    get().charities.filter((c) => c.sortingId === sortingId),
  getAppointmentsByResidentId: (residentId) =>
    get().appointments.filter((a) => a.residentId === residentId),
  getAppointmentsByVolunteerId: (volunteerId) =>
    get().appointments.filter((a) => a.volunteerId === volunteerId),
  getPendingAppointments: () =>
    get()
      .appointments.filter((a) => a.status === 'pending')
      .sort((a, b) => a.orderIndex - b.orderIndex),
  getPickingUpAppointments: () =>
    get().appointments.filter((a) => a.status === 'picking_up'),
  getReviewingAppointments: () =>
    get().appointments.filter((a) => a.status === 'reviewing'),
  getSortedAppointments: () =>
    get().appointments.filter((a) => a.status === 'sorted'),

  getWeatherLabel: (w) => weatherLabels[w],
  getCategoryLabel: (c) => categoryLabels[c],
  getDestinationRuleLabel: (d) => destinationRuleLabels[d],
  getDefaultDestination: (c) => defaultCategoryDestination[c],
}))
