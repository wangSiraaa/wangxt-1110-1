import type { Resident, Volunteer, Appointment, Pickup, Sorting, Charity } from '@/types'

export const mockResidents: Resident[] = [
  { id: 'resident-1', name: '张阿姨', phone: '138xxxx1234', address: '阳光社区3栋501' },
  { id: 'resident-2', name: '李叔叔', phone: '139xxxx5678', address: '阳光社区7栋302' },
  { id: 'resident-3', name: '王大姐', phone: '137xxxx9012', address: '阳光社区1栋101' },
]

export const mockVolunteers: Volunteer[] = [
  { id: 'volunteer-1', name: '小陈', phone: '136xxxx3456' },
  { id: 'volunteer-2', name: '小赵', phone: '135xxxx7890' },
]

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    residentId: 'resident-1',
    volunteerId: 'volunteer-1',
    bagCount: 3,
    date: '2026-06-18',
    timeSlot: '上午(9:00-12:00)',
    status: 'sorted',
    notes: '以秋冬外套为主，部分衣物有些受潮',
    bagLocked: true,
    createdAt: '2026-06-17T08:30:00',
  },
  {
    id: 'apt-2',
    residentId: 'resident-2',
    volunteerId: 'volunteer-1',
    bagCount: 2,
    date: '2026-06-18',
    timeSlot: '下午(13:00-17:00)',
    status: 'picking_up',
    notes: '有部分破损旧衣物',
    bagLocked: false,
    createdAt: '2026-06-17T09:15:00',
  },
  {
    id: 'apt-3',
    residentId: 'resident-3',
    volunteerId: null,
    bagCount: 5,
    date: '2026-06-19',
    timeSlot: '上午(9:00-12:00)',
    status: 'pending',
    notes: '全家换季整理，数量较多',
    bagLocked: false,
    createdAt: '2026-06-17T10:00:00',
  },
  {
    id: 'apt-4',
    residentId: 'resident-1',
    volunteerId: null,
    bagCount: 1,
    date: '2026-06-20',
    timeSlot: '下午(13:00-17:00)',
    status: 'pending',
    notes: '',
    bagLocked: false,
    createdAt: '2026-06-17T14:20:00',
  },
]

export const mockPickups: Pickup[] = [
  {
    id: 'pickup-1',
    appointmentId: 'apt-1',
    volunteerId: 'volunteer-1',
    isDamp: true,
    isDamaged: false,
    pickupNotes: '部分衣物存放在潮湿的储物间，已单独装袋标记',
    pickedUpAt: '2026-06-18T09:45:00',
  },
  {
    id: 'pickup-2',
    appointmentId: 'apt-2',
    volunteerId: 'volunteer-1',
    isDamp: false,
    isDamaged: true,
    pickupNotes: '有两件外套拉链损坏，已标注',
    pickedUpAt: '2026-06-18T14:20:00',
  },
]

export const mockSortings: Sorting[] = [
  {
    id: 'sorting-1',
    appointmentId: 'apt-1',
    donatableCount: 2,
    processableCount: 1,
    sortedAt: '2026-06-18T16:30:00',
    sortedBy: '仓库管理员-周姐',
  },
]

export const mockCharities: Charity[] = [
  {
    id: 'charity-1',
    sortingId: 'sorting-1',
    region: '云南山区',
    organization: '爱心传递公益中心',
    quantity: 2,
    donatedAt: '2026-06-19T10:00:00',
  },
]
