export type AppointmentStatus =
  | 'pending'
  | 'picking_up'
  | 'reviewing'
  | 'sorted'
  | 'completed'

export type TimeSlot =
  | '上午(9:00-12:00)'
  | '下午(13:00-17:00)'
  | '晚间(18:00-20:00)'

export type WeatherStatus =
  | 'sunny'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'snow'

export type ClothesCategory =
  | 'winter'
  | 'children'
  | 'normal'
  | 'damaged'

export type DestinationRule =
  | 'donate_mountain'
  | 'donate_orphanage'
  | 'donate_community'
  | 'recycle_process'
  | 'destroy'

export interface Resident {
  id: string
  name: string
  phone: string
  address: string
}

export interface Volunteer {
  id: string
  name: string
  phone: string
}

export interface Appointment {
  id: string
  residentId: string
  volunteerId: string | null
  bagCount: number
  estimatedWeight: number
  date: string
  timeSlot: TimeSlot
  status: AppointmentStatus
  notes: string
  bagLocked: boolean
  weightDeviation: number | null
  reviewNotes: string | null
  reviewedAt: string | null
  orderIndex: number
  createdAt: string
}

export interface Pickup {
  id: string
  appointmentId: string
  volunteerId: string
  isDamp: boolean
  isDamaged: boolean
  pickupNotes: string
  actualWeight: number
  weather: WeatherStatus
  hasRouteConflict: boolean
  autoReassigned: boolean
  originalVolunteerId: string | null
  reassignReason: string | null
  pickedUpAt: string
}

export interface SortingCategory {
  category: ClothesCategory
  weight: number
  bags: number
  destinationRule: DestinationRule
}

export interface Sorting {
  id: string
  appointmentId: string
  categories: SortingCategory[]
  donatableWeight: number
  processableWeight: number
  totalWeight: number
  sortedAt: string
  sortedBy: string
}

export interface Charity {
  id: string
  sortingId: string
  region: string
  organization: string
  quantity: number
  weight: number
  clothesCategory: ClothesCategory
  destinationRule: DestinationRule
  donatedAt: string
}
