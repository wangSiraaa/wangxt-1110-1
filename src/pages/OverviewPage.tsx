import { Link } from 'react-router-dom'
import { Recycle, Home, Package, Heart, Warehouse, MapPin, ArrowRight } from 'lucide-react'
import { useClothesStore } from '@/store/useClothesStore'

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待接单', color: 'text-amber-700', bg: 'bg-amber-100' },
  picking_up: { label: '回收中', color: 'text-blue-700', bg: 'bg-blue-100' },
  sorted: { label: '已分拣', color: 'text-forest-500', bg: 'bg-forest-100' },
  completed: { label: '已完成', color: 'text-gray-600', bg: 'bg-gray-100' },
}

export default function OverviewPage() {
  const store = useClothesStore()
  const totalApts = store.appointments.length
  const pendingCount = store.appointments.filter((a) => a.status === 'pending').length
  const pickingUpCount = store.appointments.filter((a) => a.status === 'picking_up').length
  const sortedCount = store.appointments.filter((a) => a.status === 'sorted').length
  const completedCount = store.appointments.filter((a) => a.status === 'completed').length
  const totalBags = store.appointments.reduce((s, a) => s + a.bagCount, 0)
  const totalDonatable = store.sortings.reduce((s, so) => s + so.donatableCount, 0)
  const totalProcessable = store.sortings.reduce((s, so) => s + so.processableCount, 0)
  const totalCharityQty = store.charities.reduce((s, c) => s + c.quantity, 0)

  const stats = [
    { icon: Package, label: '预约总数', value: totalApts, sub: `${totalBags} 袋`, color: 'forest' },
    { icon: Heart, label: '回收中', value: pickingUpCount, sub: `待接单 ${pendingCount}`, color: 'warm' },
    { icon: Warehouse, label: '已分拣', value: sortedCount, sub: `可捐赠 ${totalDonatable} / 需处理 ${totalProcessable}`, color: 'blue' },
    { icon: MapPin, label: '公益捐赠', value: totalCharityQty, sub: `件已捐赠`, color: 'warm' },
  ]

  const flowSteps = [
    { label: '预约', count: totalApts, icon: Package },
    { label: '回收', count: pickingUpCount + sortedCount + completedCount, icon: Heart },
    { label: '分拣', count: sortedCount + completedCount, icon: Warehouse },
    { label: '公益', count: totalCharityQty, icon: MapPin },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-white py-4 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Recycle className="w-6 h-6" />
            <h1 className="text-xl font-semibold font-body">流程总览</h1>
          </div>
          <span className="text-sm text-gray-400 font-body">全链路数据看板</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="card-static p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-10 h-10 rounded-xl ${
                stat.color === 'forest' ? 'bg-forest-100' : stat.color === 'warm' ? 'bg-warm-100' : 'bg-blue-100'
              } flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'forest' ? 'text-forest-500' : stat.color === 'warm' ? 'text-warm-500' : 'text-blue-600'
                }`} />
              </div>
              <p className="font-display text-3xl font-bold text-charcoal">{stat.value}</p>
              <p className="text-sm text-gray-500 font-body mt-0.5">{stat.label}</p>
              <p className="text-xs text-gray-400 font-body mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="card-static p-6 mb-8">
          <h2 className="section-title mb-5">流程链路</h2>
          <div className="flex items-center justify-between">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    i === 0 ? 'bg-forest-500' : i === 1 ? 'bg-warm-500' : i === 2 ? 'bg-blue-600' : 'bg-warm-500'
                  } shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-medium text-charcoal mt-2 font-body">{step.label}</p>
                  <p className="font-display text-xl font-bold text-charcoal">{step.count}</p>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="flex-1 flex items-center justify-center px-2">
                    <div className="h-0.5 flex-1 bg-gray-200" />
                    <ArrowRight className="w-4 h-4 text-gray-300 mx-1" />
                    <div className="h-0.5 flex-1 bg-gray-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card-static p-6 mb-8">
          <h2 className="section-title mb-5">预约单全览</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-gray-400 font-medium">编号</th>
                  <th className="text-left py-3 text-gray-400 font-medium">居民</th>
                  <th className="text-left py-3 text-gray-400 font-medium">袋数</th>
                  <th className="text-left py-3 text-gray-400 font-medium">预约时间</th>
                  <th className="text-left py-3 text-gray-400 font-medium">志愿者</th>
                  <th className="text-left py-3 text-gray-400 font-medium">状态</th>
                  <th className="text-left py-3 text-gray-400 font-medium">特殊标记</th>
                </tr>
              </thead>
              <tbody>
                {store.appointments.map((apt) => {
                  const resident = store.getResidentById(apt.residentId)
                  const volunteer = apt.volunteerId ? store.getVolunteerById(apt.volunteerId) : null
                  const pickup = store.getPickupByAppointmentId(apt.id)
                  const status = statusMap[apt.status]
                  return (
                    <tr key={apt.id} className="border-b border-gray-50 hover:bg-forest-50/30 transition-colors">
                      <td className="py-3 text-gray-400 font-display">{apt.id.slice(0, 8)}</td>
                      <td className="py-3 text-charcoal">{resident?.name}</td>
                      <td className="py-3">
                        <span className="font-display font-bold text-charcoal">{apt.bagCount}</span>
                        {apt.bagLocked && <span className="ml-1 text-xs text-warm-500">🔒</span>}
                      </td>
                      <td className="py-3 text-gray-600">
                        <div>{apt.date}</div>
                        <div className="text-xs text-gray-400">{apt.timeSlot}</div>
                      </td>
                      <td className="py-3 text-charcoal">{volunteer?.name || <span className="text-amber-500">待分配</span>}</td>
                      <td className="py-3">
                        <span className={`${status.bg} ${status.color} px-2 py-0.5 rounded-full text-xs font-medium`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {pickup?.isDamp && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg">潮湿</span>
                          )}
                          {pickup?.isDamaged && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-lg">破损</span>
                          )}
                          {!pickup?.isDamp && !pickup?.isDamaged && (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-static p-6">
          <h2 className="section-title mb-5">公益去向汇总</h2>
          {store.charities.length === 0 ? (
            <p className="text-center text-gray-400 font-body py-6">暂无公益去向记录</p>
          ) : (
            <div className="space-y-3">
              {store.charities.map((c) => {
                const sorting = store.sortings.find((s) => s.id === c.sortingId)
                const apt = sorting ? store.appointments.find((a) => a.id === sorting.appointmentId) : null
                const resident = apt ? store.getResidentById(apt.residentId) : null
                return (
                  <div key={c.id} className="flex items-center gap-4 p-4 bg-warm-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-warm-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-charcoal font-body">{c.organization}</p>
                      <p className="text-sm text-gray-500 font-body">{c.region} · 来自 {resident?.name} 的预约</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold text-warm-500">{c.quantity}</p>
                      <p className="text-xs text-gray-400 font-body">件已捐赠</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
