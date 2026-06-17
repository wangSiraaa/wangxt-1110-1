import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Plus,
  Clock,
  Lock,
  Package,
  ChevronDown,
  ChevronUp,
  Home,
  Scale,
  Search,
  AlertTriangle,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Shirt,
  Baby,
  Sparkles,
  Trash2,
  MapPin,
  Building2,
} from 'lucide-react'
import { useClothesStore } from '@/store/useClothesStore'
import type { TimeSlot, WeatherStatus, ClothesCategory } from '@/types'

const timeSlots: TimeSlot[] = ['上午(9:00-12:00)', '下午(13:00-17:00)', '晚间(18:00-20:00)']

const statusMap: Record<string, { label: string; badge: string }> = {
  pending: { label: '待接单', badge: 'badge-pending' },
  picking_up: { label: '回收中', badge: 'badge-picking' },
  reviewing: { label: '待复核', badge: 'badge-reviewing' },
  sorted: { label: '已分拣', badge: 'badge-sorted' },
  completed: { label: '已完成', badge: 'badge-completed' },
}

const weatherIcons: Record<WeatherStatus, React.ReactNode> = {
  sunny: <Sun className="w-3.5 h-3.5" />,
  cloudy: <Cloud className="w-3.5 h-3.5" />,
  rain: <CloudRain className="w-3.5 h-3.5" />,
  storm: <CloudLightning className="w-3.5 h-3.5" />,
  snow: <Snowflake className="w-3.5 h-3.5" />,
}

const categoryIcons: Record<ClothesCategory, React.ReactNode> = {
  winter: <Shirt className="w-3 h-3" />,
  children: <Baby className="w-3 h-3" />,
  normal: <Sparkles className="w-3 h-3" />,
  damaged: <Trash2 className="w-3 h-3" />,
}

const trackerSteps = [
  { key: 'pending', label: '预约', color: 'bg-amber-500' },
  { key: 'picking_up', label: '回收称重', color: 'bg-blue-500' },
  { key: 'reviewing', label: '复核', color: 'bg-purple-500' },
  { key: 'sorted', label: '分拣', color: 'bg-forest-500' },
  { key: 'completed', label: '公益去向', color: 'bg-warm-500' },
]

export default function ResidentPage() {
  const store = useClothesStore()
  const currentResident = store.getResidentById(store.currentResidentId)
  const myAppointments = store.getAppointmentsByResidentId(store.currentResidentId)

  const [showForm, setShowForm] = useState(false)
  const [bagCount, setBagCount] = useState(1)
  const [estimatedWeight, setEstimatedWeight] = useState(5)
  const [date, setDate] = useState('2026-06-20')
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('上午(9:00-12:00)')
  const [notes, setNotes] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBagCount, setEditBagCount] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = () => {
    if (bagCount < 1) return
    store.createAppointment({
      residentId: store.currentResidentId,
      bagCount,
      estimatedWeight,
      date,
      timeSlot,
      notes,
    })
    setShowForm(false)
    setBagCount(1)
    setEstimatedWeight(5)
    setNotes('')
    setSuccessMsg('预约提交成功！')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleSaveBag = (id: string) => {
    const ok = store.updateAppointmentBagCount(id, editBagCount)
    if (ok) {
      setEditingId(null)
      setSuccessMsg('袋数已更新')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const getStepIndex = (status: string) => {
    const idx = trackerSteps.findIndex((s) => s.key === status)
    if (status === 'reviewing') return 2
    return idx >= 0 ? idx : 0
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-forest-500 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:bg-forest-600 p-2 rounded-xl transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Users className="w-6 h-6" />
            <h1 className="text-xl font-semibold font-body">居民工作台</h1>
          </div>
          <div className="flex items-center gap-2 text-forest-100 text-sm font-body">
            <span>当前居民：</span>
            <select
              value={store.currentResidentId}
              onChange={(e) => store.setCurrentResident(e.target.value)}
              className="bg-forest-600 text-white rounded-lg px-3 py-1.5 text-sm border-none outline-none cursor-pointer"
            >
              {store.residents.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {successMsg && (
          <div className="mb-6 p-4 bg-forest-50 border border-forest-200 rounded-xl text-forest-500 font-medium text-center animate-fade-in font-body">
            ✓ {successMsg}
          </div>
        )}

        <div className="mb-8">
          <div className="card-static p-6 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg font-semibold text-charcoal font-body">{currentResident?.name}</span>
              <span className="text-sm text-gray-400 font-body">{currentResident?.address}</span>
            </div>
            <p className="text-sm text-gray-500 font-body">{currentResident?.phone}</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建预约
          </button>
        </div>

        {showForm && (
          <div className="card-static p-6 mb-8 animate-slide-up">
            <h3 className="section-title mb-5">登记衣物预约</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1.5 font-body">衣物袋数</label>
                <input
                  type="number"
                  min={1}
                  value={bagCount}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setBagCount(v)
                    setEstimatedWeight(v * 5)
                  }}
                  className="input-field font-display"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5 font-body flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" /> 预估重量 (kg)
                </label>
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={estimatedWeight}
                  onChange={(e) => setEstimatedWeight(Number(e.target.value))}
                  className="input-field font-display"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5 font-body">预约日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5 font-body">预约时段</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                  className="input-field"
                >
                  {timeSlots.map((ts) => (
                    <option key={ts} value={ts}>{ts}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1.5 font-body">备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="描述衣物类型、特殊情况等..."
                className="input-field min-h-[80px] resize-none font-body"
              />
            </div>

            <div className="mb-4 p-4 bg-forest-50 rounded-xl">
              <p className="text-sm font-medium text-forest-700 font-body mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 衣物去向规则说明
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-forest-600">
                  <Shirt className="w-3.5 h-3.5" /> 冬衣 → 捐赠山区
                </div>
                <div className="flex items-center gap-1.5 text-pink-600">
                  <Baby className="w-3.5 h-3.5" /> 童装 → 捐赠孤儿院
                </div>
                <div className="flex items-center gap-1.5 text-forest-600">
                  <Sparkles className="w-3.5 h-3.5" /> 普通衣物 → 社区救助
                </div>
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Trash2 className="w-3.5 h-3.5" /> 破损物品 → 回收处理
                </div>
              </div>
              <p className="text-xs text-forest-500 mt-2 font-body">
                提示：每袋预估重量约5kg，如实际称重与预估差异超过30%，将进入复核流程
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSubmit} className="btn-primary">提交预约</button>
              <button onClick={() => setShowForm(false)} className="btn-outline">取消</button>
            </div>
          </div>
        )}

        <div>
          <h2 className="section-title mb-4">我的预约</h2>
          {myAppointments.length === 0 ? (
            <div className="card-static p-8 text-center text-gray-400 font-body">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              暂无预约记录
            </div>
          ) : (
            <div className="space-y-4">
              {myAppointments.map((apt) => {
                const volunteer = apt.volunteerId ? store.getVolunteerById(apt.volunteerId) : null
                const pickup = store.getPickupByAppointmentId(apt.id)
                const sorting = store.getSortingByAppointmentId(apt.id)
                const charities = sorting ? store.getCharitiesBySortingId(sorting.id) : []
                const stepIdx = getStepIndex(apt.status)
                const isExpanded = expandedId === apt.id

                return (
                  <div key={apt.id} className="card-static overflow-hidden animate-fade-in">
                    <div
                      className="p-5 cursor-pointer hover:bg-forest-50/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={statusMap[apt.status]?.badge}>{statusMap[apt.status]?.label}</span>
                          {apt.bagLocked && (
                            <span className="flex items-center gap-1 text-xs text-warm-500 font-body">
                              <Lock className="w-3 h-3" /> 袋数已锁定
                            </span>
                          )}
                          {apt.status === 'reviewing' && (
                            <span className="flex items-center gap-1 text-xs text-purple-600 font-body">
                              <AlertTriangle className="w-3 h-3" /> 重量差异待复核
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-body">
                          <Clock className="w-4 h-4" />
                          {apt.date} {apt.timeSlot}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 flex-wrap">
                        <div>
                          <span className="text-sm text-gray-400 font-body">袋数</span>
                          {editingId === apt.id && !apt.bagLocked ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="number"
                                min={1}
                                value={editBagCount}
                                onChange={(e) => setEditBagCount(Number(e.target.value))}
                                className="w-20 px-2 py-1 border rounded-lg text-center font-display"
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSaveBag(apt.id) }}
                                className="text-xs bg-forest-500 text-white px-2 py-1 rounded-lg hover:bg-forest-600"
                              >
                                保存
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingId(null) }}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <p className="font-display text-2xl font-bold text-charcoal mt-1">
                              {apt.bagCount}
                              {apt.bagLocked && <Lock className="w-3 h-3 inline ml-2 text-warm-500" />}
                              {!apt.bagLocked && apt.status === 'pending' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingId(apt.id); setEditBagCount(apt.bagCount) }}
                                  className="ml-2 text-xs text-forest-500 hover:underline font-body"
                                >
                                  修改
                                </button>
                              )}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-sm text-gray-400 font-body flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5" /> 预估重量
                          </span>
                          <p className="font-display text-2xl font-bold text-charcoal mt-1">{apt.estimatedWeight} <span className="text-sm font-normal text-gray-400">kg</span></p>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <span className="text-sm text-gray-400 font-body">志愿者</span>
                          <p className="text-charcoal font-body mt-1">
                            {volunteer ? volunteer.name : <span className="text-amber-500">等待分配</span>}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-1">
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
                        <div className="flex justify-between mt-1">
                          {trackerSteps.map((step) => (
                            <span key={step.key} className="text-xs text-gray-400 font-body">{step.label}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 animate-fade-in">
                        {apt.notes && (
                          <div className="mb-3">
                            <span className="text-sm text-gray-400 font-body">备注：</span>
                            <span className="text-sm text-charcoal font-body">{apt.notes}</span>
                          </div>
                        )}

                        <div className="tracker-grid mt-4">
                          <div className="tracker-cell">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <Package className="w-3.5 h-3.5" />
                            <span>预约登记</span>
                          </div>
                          <p className="font-display text-lg font-bold text-charcoal">{apt.bagCount}袋 / {apt.estimatedWeight}kg</p>
                          <p className="text-xs text-gray-400 mt-1">{apt.date}</p>
                        </div>

                        {pickup && (
                          <div className="tracker-cell">
                            <div className="flex items-center gap-2 text-xs text-blue-500 mb-2">
                              <Scale className="w-3.5 h-3.5" />
                              <span>上门回收称重</span>
                            </div>
                            <p className="font-display text-lg font-bold text-charcoal">{pickup.actualWeight}<span className="text-sm font-normal text-gray-400">kg</span></p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="tag-chip bg-blue-50 text-blue-600">
                                {weatherIcons[pickup.weather]}
                                {store.getWeatherLabel(pickup.weather)}
                              </span>
                              {pickup.isDamp && <span className="tag-chip bg-blue-100 text-blue-700">潮湿</span>}
                              {pickup.isDamaged && <span className="tag-chip bg-red-100 text-red-700">破损</span>}
                            </div>
                            {apt.weightDeviation !== null && (
                              <p className={`text-xs mt-1 ${apt.weightDeviation > 0.3 ? 'text-purple-600' : 'text-gray-400'}`}>
                                差异：{(apt.weightDeviation * 100).toFixed(0)}%
                              </p>
                            )}
                          </div>
                        )}

                        {apt.status === 'reviewing' && (
                          <div className="tracker-cell border-purple-200 bg-purple-50">
                            <div className="flex items-center gap-2 text-xs text-purple-600 mb-2">
                              <Search className="w-3.5 h-3.5" />
                              <span>复核中</span>
                            </div>
                            <p className="font-display text-lg font-bold text-charcoal">待仓库复核</p>
                            <p className="text-xs text-purple-500 mt-1">袋数与称重差距较大，仓库复核中</p>
                          </div>
                        )}

                        {sorting && (
                          <div className="tracker-cell">
                            <div className="flex items-center gap-2 text-xs text-forest-600 mb-2">
                              <Shirt className="w-3.5 h-3.5" />
                              <span>仓库分拣</span>
                            </div>
                            <p className="font-display text-lg font-bold text-charcoal">{sorting.totalWeight}<span className="text-sm font-normal text-gray-400">kg</span></p>
                            <div className="space-y-1 mt-1">
                              {sorting.categories.filter((c) => c.weight > 0).map((cat) => (
                                <div key={cat.category} className="flex items-center gap-1 text-xs flex-wrap">
                                  <span className="tag-chip bg-gray-100 text-gray-600">
                                    {categoryIcons[cat.category]}
                                    {store.getCategoryLabel(cat.category)} {cat.weight}kg
                                  </span>
                                  <span className="tag-chip bg-warm-50 text-warm-600">
                                    {store.getDestinationRuleLabel(cat.destinationRule)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {charities.length > 0 && (
                          <div className="tracker-cell col-span-2 md:col-span-2">
                            <div className="flex items-center gap-2 text-xs text-warm-600 mb-2">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>公益去向</span>
                            </div>
                            <div className="space-y-1">
                              {charities.map((c) => (
                                <div key={c.id} className="flex items-center gap-2 text-sm">
                                  <Building2 className="w-3 h-3 text-warm-500" />
                                  <span className="text-charcoal">{c.organization}</span>
                                  <span className="text-gray-400">·</span>
                                  <span className="text-gray-500">{c.region}</span>
                                  <span className="text-gray-400">·</span>
                                  <span className="tag-chip bg-forest-50 text-forest-600">
                                    {categoryIcons[c.clothesCategory]}
                                    {store.getCategoryLabel(c.clothesCategory)}
                                  </span>
                                  <span className="font-display font-bold text-warm-500">{c.weight}kg</span>
                                  <span className="tag-chip bg-warm-50 text-warm-600">{store.getDestinationRuleLabel(c.destinationRule)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                        {apt.reviewNotes && (
                          <div className="mt-3 p-3 bg-purple-50 rounded-xl">
                            <p className="text-sm font-medium text-purple-700 font-body">复核备注</p>
                            <p className="text-sm text-purple-600 font-body">{apt.reviewNotes}</p>
                          </div>
                        )}

                        {pickup?.pickupNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                            <p className="text-sm font-medium text-blue-700 font-body">回收备注</p>
                            <p className="text-sm text-blue-600 font-body">{pickup.pickupNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
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
