export type AppointmentStatus = 'pending' | 'picking_up' | 'sorted' | 'completed'
export type TimeSlot = '上午(9:00-12:00)' | '下午(13:00-17:00)' | '晚间(18:00-20:00)'

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
  date: string
  timeSlot: TimeSlot
  status: AppointmentStatus
  notes: string
  bagLocked: boolean
  createdAt: string
}

export interface Pickup {
  id: string
  appointmentId: string
  volunteerId: string
  isDamp: boolean
  isDamaged: boolean
  pickupNotes: string
  pickedUpAt: string
}

export interface Sorting {
  id: string
  appointmentId: string
  donatableCount: number
  processableCount: number
  sortedAt: string
  sortedBy: string
}

export interface Charity {
  id: string
  sortingId: string
  region: string
  organization: string
  quantity: number
  donatedAt: string
}
