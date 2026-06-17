import { Link } from 'react-router-dom'
import {
  Recycle,
  Home,
  Package,
  Heart,
  Warehouse,
  MapPin,
  ArrowRight,
  Scale,
  Shirt,
  Baby,
  Sparkles,
  Trash2,
  Mountain,
  Building2,
  HeartHandshake,
  Ban,
  Search,
  Clock,
  Users,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Droplets,
  Scissors,
  AlertTriangle,
} from 'lucide-react'
import { useClothesStore } from '@/store/useClothesStore'
import type { ClothesCategory, DestinationRule, WeatherStatus } from '@/types'

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待接单', color: 'text-amber-700', bg: 'bg-amber-100' },
  picking_up: { label: '回收中', color: 'text-blue-700', bg: 'bg-blue-100' },
  reviewing: { label: '待复核', color: 'text-purple-700', bg: 'bg-purple-100' },
  sorted: { label: '已分拣', color: 'text-forest-500', bg: 'bg-forest-100' },
  completed: { label: '已完成', color: 'text-gray-600', bg: 'bg-gray-100' },
}

const weatherIcons: Record<WeatherStatus, React.ReactNode> = {
  sunny: <Sun className="w-3 h-3" />,
  cloudy: <Cloud className="w-3 h-3" />,
  rain: <CloudRain className="w-3 h-3" />,
  storm: <CloudLightning className="w-3 h-3" />,
  snow: <Snowflake className="w-3 h-3" />,
}

const categoryConfig: Record<ClothesCategory, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  winter: { label: '冬衣', icon: <Shirt className="w-3 h-3" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  children: { label: '童装', icon: <Baby className="w-3 h-3" />, color: 'text-pink-700', bg: 'bg-pink-100' },
  normal: { label: '普通', icon: <Sparkles className="w-3 h-3" />, color: 'text-forest-700', bg: 'bg-forest-100' },
  damaged: { label: '破损', icon: <Trash2 className="w-3 h-3" />, color: 'text-red-700', bg: 'bg-red-100' },
}

const destinationRuleConfig: Record<DestinationRule, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  donate_mountain: { label: '捐赠山区', icon: <Mountain className="w-3 h-3" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  donate_orphanage: { label: '捐赠孤儿院', icon: <Baby className="w-3 h-3" />, color: 'text-pink-700', bg: 'bg-pink-100' },
  donate_community: { label: '社区救助', icon: <HeartHandshake className="w-3 h-3" />, color: 'text-forest-700', bg: 'bg-forest-100' },
  recycle_process: { label: '回收处理', icon: <Recycle className="w-3 h-3" />, color: 'text-amber-700', bg: 'bg-amber-100' },
  destroy: { label: '销毁处理', icon: <Ban className="w-3 h-3" />, color: 'text-red-700', bg: 'bg-red-100' },
}

export default function OverviewPage() {
  const store = useClothesStore()
  const totalApts = store.appointments.length
  const pendingCount = store.appointments.filter((a) => a.status === 'pending').length
  const pickingUpCount = store.appointments.filter((a) => a.status === 'picking_up').length
  const reviewingCount = store.appointments.filter((a) => a.status === 'reviewing').length
  const sortedCount = store.appointments.filter((a) => a.status === 'sorted').length
  const completedCount = store.appointments.filter((a) => a.status === 'completed').length
  const totalBags = store.appointments.reduce((s, a) => s + a.bagCount, 0)
  const totalEstimatedWeight = store.appointments.reduce((s, a) => s + a.estimatedWeight, 0)
  const totalDonatableWeight = store.sortings.reduce((s, so) => s + so.donatableWeight, 0)
  const totalProcessableWeight = store.sortings.reduce((s, so) => s + so.processableWeight, 0)
  const totalActualWeight = store.pickups.reduce((s, p) => s + p.actualWeight, 0)
  const totalCharityWeight = store.charities.reduce((s, c) => s + c.weight, 0)
  const totalCharityQty = store.charities.reduce((s, c) => s + c.quantity, 0)

  const stats = [
    { icon: Package, label: '预约总数', value: totalApts, sub: `${totalBags}袋 / ${totalEstimatedWeight}kg`, color: 'forest' },
    { icon: Scale, label: '已上门称重', value: store.pickups.length, sub: `${totalActualWeight.toFixed(0)}kg`, color: 'blue' },
    { icon: Search, label: '待复核', value: reviewingCount, sub: `${pickingUpCount}回收中`, color: 'purple' },
    { icon: Warehouse, label: '已分拣', value: sortedCount + completedCount, sub: `可捐 ${totalDonatableWeight.toFixed(0)} / 处理 ${totalProcessableWeight.toFixed(0)} kg`, color: 'warm' },
    { icon: MapPin, label: '公益分发', value: store.charities.length, sub: `${totalCharityQty}件 / ${totalCharityWeight.toFixed(0)}kg`, color: 'forest' },
  ]

  const flowSteps = [
    { label: '预约登记', count: totalApts, icon: Package, color: 'bg-forest-500' },
    { label: '上门回收', count: store.pickups.length, icon: Scale, color: 'bg-blue-500' },
    { label: '重量复核', count: reviewingCount, icon: Search, color: 'bg-purple-500' },
    { label: '仓库分拣', count: store.sortings.length, icon: Warehouse, color: 'bg-warm-500' },
    { label: '公益分发', count: store.charities.length, icon: MapPin, color: 'bg-forest-600' },
  ]

  const trackerSteps = [
    { key: 'pending', label: '预约', color: 'bg-amber-500' },
    { key: 'picking_up', label: '回收称重', color: 'bg-blue-500' },
    { key: 'reviewing', label: '复核', color: 'bg-purple-500' },
    { key: 'sorted', label: '分拣', color: 'bg-forest-500' },
    { key: 'completed', label: '公益去向', color: 'bg-warm-500' },
  ]

  const getStepIndex = (status: string) => {
    const idx = trackerSteps.findIndex((s) => s.key === status)
    if (status === 'reviewing') return 2
    if (status === 'sorted') return 3
    if (status === 'completed') return 4
    return idx >= 0 ? idx : 0
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Recycle className="w-6 h-6" />
            <h1 className="text-xl font-semibold font-body">流程总览</h1>
          </div>
          <span className="text-sm text-gray-400 font-body">回收·称重·分拣·公益分发 全链路同屏追踪</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="card-static p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-10 h-10 rounded-xl ${
                stat.color === 'forest' ? 'bg-forest-100' :
                stat.color === 'warm' ? 'bg-warm-100' :
                stat.color === 'purple' ? 'bg-purple-100' : 'bg-blue-100'
              } flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'forest' ? 'text-forest-500' :
                  stat.color === 'warm' ? 'text-warm-500' :
                  stat.color === 'purple' ? 'text-purple-600' : 'text-blue-600'
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
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center shrink-0">
                <div className="flex flex-col items-center min-w-[90px]">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${step.color} shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-medium text-charcoal mt-2 font-body">{step.label}</p>
                  <p className="font-display text-xl font-bold text-charcoal">{step.count}</p>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="flex items-center justify-center px-2 mx-1">
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card-static p-6 mb-8">
          <h2 className="section-title mb-5">预约单全链路追踪</h2>
          <div className="space-y-5">
            {store.appointments.map((apt) => {
              const resident = store.getResidentById(apt.residentId)
              const volunteer = apt.volunteerId ? store.getVolunteerById(apt.volunteerId) : null
              const pickup = store.getPickupByAppointmentId(apt.id)
              const sorting = store.getSortingByAppointmentId(apt.id)
              const charities = sorting ? store.getCharitiesBySortingId(sorting.id) : []
              const status = statusMap[apt.status]
              const stepIdx = getStepIndex(apt.status)

              return (
                <div key={apt.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display text-sm text-gray-400">{apt.id.slice(0, 10)}</span>
                      <span className={`${status.bg} ${status.color} px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                        {status.label}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-charcoal font-medium">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {resident?.name}
                      </span>
                      <span className="text-sm text-gray-400">{resident?.address}</span>
                      {apt.bagLocked && (
                        <span className="text-xs text-warm-500 font-medium">🔒 袋数已锁定</span>
                      )}
                      {apt.status === 'reviewing' && (
                        <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                          <AlertTriangle className="w-3 h-3" /> 重量差异待复核
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-body">
                      <Clock className="w-3.5 h-3.5" />
                      {apt.date} {apt.timeSlot}
                      {volunteer && (
                        <span className="ml-2 text-blue-600">志愿者：{volunteer.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    {trackerSteps.map((step, i) => (
                      <div key={step.key} className="flex-1 flex items-center">
                        <div
                          className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                            i <= stepIdx ? step.color : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mb-4">
                    {trackerSteps.map((step) => (
                      <span key={step.key} className="text-xs text-gray-400 font-body">{step.label}</span>
                    ))}
                  </div>

                  <div className="tracker-grid">
                    <div className="tracker-cell">
                      <div className="flex items-center gap-2 text-xs text-amber-600 mb-2">
                        <Package className="w-3.5 h-3.5" />
                        <span>预约登记</span>
                      </div>
                      <p className="font-display font-bold text-charcoal">{apt.bagCount}袋 / {apt.estimatedWeight}kg</p>
                      <p className="text-xs text-gray-400 mt-1">{apt.createdAt.slice(5, 16)}</p>
                      {apt.notes && <p className="text-xs text-gray-500 mt-1">备注：{apt.notes}</p>}
                    </div>

                    {pickup ? (
                      <div className="tracker-cell">
                        <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                          <Scale className="w-3.5 h-3.5" />
                          <span>上门称重</span>
                        </div>
                        <p className="font-display font-bold text-charcoal">
                          {pickup.actualWeight}<span className="text-sm font-normal text-gray-400">kg</span>
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="tag-chip bg-gray-50 text-gray-600">
                            {weatherIcons[pickup.weather]} {store.getWeatherLabel(pickup.weather)}
                          </span>
                          {pickup.isDamp && (
                            <span className="tag-chip bg-blue-50 text-blue-700">
                              <Droplets className="w-3 h-3" /> 潮湿
                            </span>
                          )}
                          {pickup.isDamaged && (
                            <span className="tag-chip bg-red-50 text-red-700">
                              <Scissors className="w-3 h-3" /> 破损
                            </span>
                          )}
                        </div>
                        {apt.weightDeviation !== null && (
                          <p className={`text-xs mt-1 font-medium ${apt.weightDeviation > 0.3 ? 'text-purple-600' : 'text-gray-400'}`}>
                            差异：{(apt.weightDeviation * 100).toFixed(0)}%
                          </p>
                        )}
                        {pickup.autoReassigned && (
                          <p className="text-xs text-orange-600 mt-1">
                            自动转派 · {pickup.reassignReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="tracker-cell opacity-50">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <Scale className="w-3.5 h-3.5" />
                          <span>上门称重</span>
                        </div>
                        <p className="font-display text-gray-300">待处理</p>
                      </div>
                    )}

                    {apt.status === 'reviewing' ? (
                      <div className="tracker-cell border-purple-200 bg-purple-50">
                        <div className="flex items-center gap-2 text-xs text-purple-600 mb-2">
                          <Search className="w-3.5 h-3.5" />
                          <span>复核中</span>
                        </div>
                        <p className="font-display font-bold text-charcoal">待仓库复核</p>
                        <p className="text-xs text-purple-500 mt-1">袋数与称重差距较大</p>
                      </div>
                    ) : pickup ? (
                      <div className="tracker-cell">
                        <div className="flex items-center gap-2 text-xs text-purple-500 mb-2">
                          <Search className="w-3.5 h-3.5" />
                          <span>重量复核</span>
                        </div>
                        {apt.weightDeviation !== null && apt.weightDeviation > 0.3 ? (
                          <>
                            <p className="font-display font-bold text-purple-600">差异 {(apt.weightDeviation * 100).toFixed(0)}%</p>
                            {apt.reviewNotes && <p className="text-xs text-purple-500 mt-1">{apt.reviewNotes}</p>}
                          </>
                        ) : (
                          <>
                            <p className="font-display font-bold text-forest-600">正常通过</p>
                            <p className="text-xs text-gray-400 mt-1">差异在阈值内</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="tracker-cell opacity-50">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <Search className="w-3.5 h-3.5" />
                          <span>重量复核</span>
                        </div>
                        <p className="font-display text-gray-300">待处理</p>
                      </div>
                    )}

                    {sorting ? (
                      <div className="tracker-cell">
                        <div className="flex items-center gap-2 text-xs text-forest-600 mb-2">
                          <Warehouse className="w-3.5 h-3.5" />
                          <span>仓库分拣</span>
                        </div>
                        <p className="font-display font-bold text-charcoal">
                          {sorting.totalWeight}<span className="text-sm font-normal text-gray-400">kg</span>
                        </p>
                        <div className="space-y-1 mt-1">
                          {sorting.categories.filter((c) => c.weight > 0).map((cat) => (
                            <div key={cat.category} className="flex items-center gap-1 text-xs flex-wrap">
                              <span className={`tag-chip ${categoryConfig[cat.category].bg} ${categoryConfig[cat.category].color}`}>
                                {categoryConfig[cat.category].icon}
                                {store.getCategoryLabel(cat.category)} {cat.weight}kg
                              </span>
                              <span className={`tag-chip ${destinationRuleConfig[cat.destinationRule].bg} ${destinationRuleConfig[cat.destinationRule].color}`}>
                                {destinationRuleConfig[cat.destinationRule].icon}
                                {store.getDestinationRuleLabel(cat.destinationRule)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">分拣人：{sorting.sortedBy}</p>
                      </div>
                    ) : (
                      <div className="tracker-cell opacity-50">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <Warehouse className="w-3.5 h-3.5" />
                          <span>仓库分拣</span>
                        </div>
                        <p className="font-display text-gray-300">待处理</p>
                      </div>
                    )}
                  </div>

                  {charities.length > 0 && (
                    <div className="mt-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-warm-600 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-medium">公益去向 · {charities.length} 条分发记录</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {charities.map((c) => (
                          <div key={c.id} className="flex items-center gap-2 p-3 bg-warm-50 rounded-xl text-sm">
                            <Building2 className="w-4 h-4 text-warm-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-charcoal font-medium truncate">{c.organization}</p>
                              <p className="text-xs text-gray-500">{c.region}</p>
                            </div>
                            <div className="flex flex-wrap gap-1 justify-end">
                              <span className={`tag-chip ${categoryConfig[c.clothesCategory].bg} ${categoryConfig[c.clothesCategory].color}`}>
                                {categoryConfig[c.clothesCategory].icon}
                                {store.getCategoryLabel(c.clothesCategory)}
                              </span>
                              <span className={`tag-chip ${destinationRuleConfig[c.destinationRule].bg} ${destinationRuleConfig[c.destinationRule].color}`}>
                                {destinationRuleConfig[c.destinationRule].icon}
                                {store.getDestinationRuleLabel(c.destinationRule)}
                              </span>
                              <span className="font-display font-bold text-warm-600">{c.weight}kg / {c.quantity}件</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="card-static p-6">
          <h2 className="section-title mb-5">公益去向汇总</h2>
          {store.charities.length === 0 ? (
            <p className="text-center text-gray-400 font-body py-6">暂无公益去向记录</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {store.charities.map((c) => {
                const sorting = store.sortings.find((s) => s.id === c.sortingId)
                const apt = sorting ? store.appointments.find((a) => a.id === sorting.appointmentId) : null
                const resident = apt ? store.getResidentById(apt.residentId) : null
                return (
                  <div key={c.id} className="flex items-center gap-4 p-4 bg-warm-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-warm-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium text-charcoal font-body">{c.organization}</p>
                        <span className={`tag-chip ${categoryConfig[c.clothesCategory].bg} ${categoryConfig[c.clothesCategory].color}`}>
                          {categoryConfig[c.clothesCategory].icon}
                          {store.getCategoryLabel(c.clothesCategory)}
                        </span>
                        <span className={`tag-chip ${destinationRuleConfig[c.destinationRule].bg} ${destinationRuleConfig[c.destinationRule].color}`}>
                          {destinationRuleConfig[c.destinationRule].icon}
                          {store.getDestinationRuleLabel(c.destinationRule)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-body">{c.region} · 来自 {resident?.name} 的预约</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-xl font-bold text-warm-500">{c.weight}kg</p>
                      <p className="text-xs text-gray-400 font-body">{c.quantity} 件</p>
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
