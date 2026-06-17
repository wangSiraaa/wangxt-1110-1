import { describe, it, expect, beforeEach } from 'vitest'
import { useClothesStore } from '@/store/useClothesStore'
import type { SortingCategory } from '@/types'

const VALID_CATEGORIES: SortingCategory[] = [
  { category: 'winter', weight: 5, bags: 1, destinationRule: 'donate_mountain' },
  { category: 'children', weight: 3, bags: 1, destinationRule: 'donate_orphanage' },
  { category: 'normal', weight: 6, bags: 1, destinationRule: 'donate_community' },
  { category: 'damaged', weight: 1, bags: 0, destinationRule: 'recycle_process' },
]

describe('confirmSorting 数量校验', () => {
  beforeEach(() => {
    useClothesStore.setState({
      appointments: useClothesStore.getState().appointments.map((a) => ({
        ...a,
        status: a.id === 'apt-2' ? 'picking_up' : a.status,
        bagLocked: a.id === 'apt-2' ? false : a.bagLocked,
      })),
      sortings: useClothesStore.getState().sortings.filter((s) => s.appointmentId !== 'apt-2'),
    })
  })

  it('合法分拣数据应成功写入', () => {
    const store = useClothesStore.getState()
    const apt = store.appointments.find((a) => a.id === 'apt-2')
    expect(apt).toBeDefined()
    expect(apt!.status).toBe('picking_up')

    const categories: SortingCategory[] = [
      { category: 'winter', weight: 4, bags: 1, destinationRule: 'donate_mountain' },
      { category: 'normal', weight: 6, bags: 1, destinationRule: 'donate_community' },
      { category: 'damaged', weight: 0, bags: 0, destinationRule: 'recycle_process' },
    ]

    const result = store.confirmSorting('apt-2', { categories, sortedBy: '测试' })
    expect(result.success).toBe(true)

    const updated = useClothesStore.getState().appointments.find((a) => a.id === 'apt-2')
    expect(updated!.status).toBe('sorted')
    expect(updated!.bagLocked).toBe(true)
  })

  it('分拣总袋数超过预约原始袋数应被拒绝', () => {
    const store = useClothesStore.getState()
    const apt = store.appointments.find((a) => a.id === 'apt-2')
    expect(apt!.bagCount).toBe(2)

    const categories: SortingCategory[] = [
      { category: 'winter', weight: 5, bags: 2, destinationRule: 'donate_mountain' },
      { category: 'normal', weight: 5, bags: 1, destinationRule: 'donate_community' },
      { category: 'damaged', weight: 0, bags: 0, destinationRule: 'recycle_process' },
    ]

    const result = store.confirmSorting('apt-2', { categories, sortedBy: '测试' })
    expect(result.success).toBe(false)
    expect(result.reason).toContain('超过预约原始袋数')

    const updated = useClothesStore.getState().appointments.find((a) => a.id === 'apt-2')
    expect(updated!.status).toBe('picking_up')
    expect(updated!.bagLocked).toBe(false)
  })

  it('某类别袋数为负应被拒绝', () => {
    const store = useClothesStore.getState()
    const categories: SortingCategory[] = [
      { category: 'winter', weight: 5, bags: -1, destinationRule: 'donate_mountain' },
      { category: 'normal', weight: 5, bags: 1, destinationRule: 'donate_community' },
      { category: 'damaged', weight: 0, bags: 0, destinationRule: 'recycle_process' },
    ]

    const result = store.confirmSorting('apt-2', { categories, sortedBy: '测试' })
    expect(result.success).toBe(false)
    expect(result.reason).toContain('袋数不能为负')

    const updated = useClothesStore.getState().appointments.find((a) => a.id === 'apt-2')
    expect(updated!.status).toBe('picking_up')
    expect(updated!.bagLocked).toBe(false)
  })

  it('某类别重量为负应被拒绝', () => {
    const store = useClothesStore.getState()
    const categories: SortingCategory[] = [
      { category: 'winter', weight: -3, bags: 1, destinationRule: 'donate_mountain' },
      { category: 'normal', weight: 7, bags: 1, destinationRule: 'donate_community' },
      { category: 'damaged', weight: 0, bags: 0, destinationRule: 'recycle_process' },
    ]

    const result = store.confirmSorting('apt-2', { categories, sortedBy: '测试' })
    expect(result.success).toBe(false)
    expect(result.reason).toContain('重量不能为负')

    const updated = useClothesStore.getState().appointments.find((a) => a.id === 'apt-2')
    expect(updated!.bagLocked).toBe(false)
  })

  it('分拣总袋数等于预约原始袋数应成功', () => {
    const store = useClothesStore.getState()
    const apt = store.appointments.find((a) => a.id === 'apt-2')
    expect(apt!.bagCount).toBe(2)

    const categories: SortingCategory[] = [
      { category: 'winter', weight: 5, bags: 1, destinationRule: 'donate_mountain' },
      { category: 'normal', weight: 5, bags: 1, destinationRule: 'donate_community' },
      { category: 'damaged', weight: 0, bags: 0, destinationRule: 'recycle_process' },
    ]

    const result = store.confirmSorting('apt-2', { categories, sortedBy: '测试' })
    expect(result.success).toBe(true)

    const updated = useClothesStore.getState().appointments.find((a) => a.id === 'apt-2')
    expect(updated!.bagLocked).toBe(true)
  })

  it('拒绝后不应产生排序记录', () => {
    const store = useClothesStore.getState()
    const sortingsBefore = useClothesStore.getState().sortings.length

    const categories: SortingCategory[] = [
      { category: 'winter', weight: 5, bags: 10, destinationRule: 'donate_mountain' },
      { category: 'normal', weight: 5, bags: 10, destinationRule: 'donate_community' },
      { category: 'damaged', weight: 0, bags: 0, destinationRule: 'recycle_process' },
    ]

    store.confirmSorting('apt-2', { categories, sortedBy: '测试' })

    const sortingsAfter = useClothesStore.getState().sortings.length
    expect(sortingsAfter).toBe(sortingsBefore)
  })

  it('拒绝后不应产生公益去向记录', () => {
    const store = useClothesStore.getState()
    const charitiesBefore = useClothesStore.getState().charities.length

    const categories: SortingCategory[] = [
      { category: 'winter', weight: 5, bags: 10, destinationRule: 'donate_mountain' },
      { category: 'normal', weight: 5, bags: 10, destinationRule: 'donate_community' },
    ]

    store.confirmSorting('apt-2', { categories, sortedBy: '测试' })

    const charitiesAfter = useClothesStore.getState().charities.length
    expect(charitiesAfter).toBe(charitiesBefore)
  })

  it('不存在的预约单应被拒绝', () => {
    const store = useClothesStore.getState()
    const result = store.confirmSorting('nonexistent', { categories: VALID_CATEGORIES, sortedBy: '测试' })
    expect(result.success).toBe(false)
    expect(result.reason).toContain('预约单不存在')
  })

  it('合法分拣后公益去向可正常添加', () => {
    const store = useClothesStore.getState()
    const categories: SortingCategory[] = [
      { category: 'winter', weight: 5, bags: 1, destinationRule: 'donate_mountain' },
      { category: 'normal', weight: 5, bags: 1, destinationRule: 'donate_community' },
      { category: 'damaged', weight: 0, bags: 0, destinationRule: 'recycle_process' },
    ]

    const sortResult = store.confirmSorting('apt-2', { categories, sortedBy: '测试' })
    expect(sortResult.success).toBe(true)

    const sorting = useClothesStore.getState().sortings.find((s) => s.appointmentId === 'apt-2')
    expect(sorting).toBeDefined()

    const charityBefore = useClothesStore.getState().charities.length
    useClothesStore.getState().addCharity(sorting!.id, {
      region: '云南山区',
      organization: '爱心公益',
      quantity: 2,
      weight: 5,
      clothesCategory: 'winter',
      destinationRule: 'donate_mountain',
    })
    const charityAfter = useClothesStore.getState().charities.length
    expect(charityAfter).toBe(charityBefore + 1)
  })
})
