import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Warehouse,
  Home,
  Droplets,
  Scissors,
  CheckCircle,
  MapPin,
  Building2,
  Search,
  Scale,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Shirt,
  Baby,
  Sparkles,
  Trash2,
  Mountain,
  Users,
  HeartHandshake,
  Recycle,
  Ban,
  Package,
  Clock,
} from 'lucide-react'
import { useClothesStore } from '@/store/useClothesStore'
import type {
  SortingCategory,
  ClothesCategory,
  DestinationRule,
  WeatherStatus,
  Appointment,
} from '@/types'

const weatherIcons: Record<WeatherStatus, React.ReactNode> = {
  sunny: <Sun className="w-3.5 h-3.5" />,
  cloudy: <Cloud className="w-3.5 h-3.5" />,
  rain: <CloudRain className="w-3.5 h-3.5" />,
  storm: <CloudLightning className="w-3.5 h-3.5" />,
  snow: <Snowflake className="w-3.5 h-3.5" />,
}

const categoryConfig: Record<ClothesCategory, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  winter: { label: '冬衣', icon: <Shirt className="w-4 h-4" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  children: { label: '童装', icon: <Baby className="w-4 h-4" />, color: 'text-pink-700', bg: 'bg-pink-100' },
  normal: { label: '普通衣物', icon: <Sparkles className="w-4 h-4" />, color: 'text-forest-700', bg: 'bg-forest-100' },
  damaged: { label: '破损物品', icon: <Trash2 className="w-4 h-4" />, color: 'text-red-700', bg: 'bg-red-100' },
}

const destinationRuleConfig: Record<DestinationRule, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  donate_mountain: { label: '捐赠山区', icon: <Mountain className="w-3.5 h-3.5" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  donate_orphanage: { label: '捐赠孤儿院', icon: <Baby className="w-3.5 h-3.5" />, color: 'text-pink-700', bg: 'bg-pink-100' },
  donate_community: { label: '社区救助', icon: <HeartHandshake className="w-3.5 h-3.5" />, color: 'text-forest-700', bg: 'bg-forest-100' },
  recycle_process: { label: '回收处理', icon: <Recycle className="w-3.5 h-3.5" />, color: 'text-amber-700', bg: 'bg-amber-100' },
  destroy: { label: '销毁处理', icon: <Ban className="w-3.5 h-3.5" />, color: 'text-red-700', bg: 'bg-red-100' },
}

const defaultCategoryDestination: Record<ClothesCategory, DestinationRule> = {
  winter: 'donate_mountain',
  children: 'donate_orphanage',
  normal: 'donate_community',
  damaged: 'recycle_process',
}

export default function WarehousePage() {
  const store = useClothesStore()
  const pickingUpApts = store.getPickingUpAppointments()
  const reviewingApts = store.getReviewingAppointments()
  const sortedApts = store.getSortedAppointments()

  const [activeTab, setActiveTab] = useState<'review' | 'sorting' | 'charity'>('review')
  const [sortingAptId, setSortingAptId] = useState<string | null>(null)
  const [sortingCategories, setSortingCategories] = useState<SortingCategory[]>([])
  const [sortedBy, setSortedBy] = useState('仓库管理员-周姐')
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null)

  const [charitySortingId, setCharitySortingId] = useState<string | null>(null)
  const [charityCategory, setCharityCategory] = useState<ClothesCategory>('winter')
  const [region, setRegion] = useState('')
  const [organization, setOrganization] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [weight, setWeight] = useState(0)
  const [destinationRule, setDestinationRule] = useState<DestinationRule>('donate_mountain')
  const [successMsg, setSuccessMsg] = useState('')

  const [reviewAptId, setReviewAptId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')

  const initSortingCategories = (apt: Appointment) => {
    const pickup = store.getPickupByAppointmentId(apt.id)
    const totalWeight = pickup?.actualWeight || apt.estimatedWeight
    const categories: SortingCategory[] = [
      {
        category: 'winter',
        weight: Math.round(totalWeight * 0.3 * 10) / 10,
        bags: Math.max(1, Math.floor(apt.bagCount * 0.3)),
        destinationRule: 'donate_mountain',
      },
      {
        category: 'children',
        weight: Math.round(totalWeight * 0.2 * 10) / 10,
        bags: Math.max(0, Math.floor(apt.bagCount * 0.2)),
        destinationRule: 'donate_orphanage',
      },
      {
        category: 'normal',
        weight: Math.round(totalWeight * 0.4 * 10) / 10,
        bags: Math.max(1, Math.floor(apt.bagCount * 0.4)),
        destinationRule: 'donate_community',
      },
      {
        category: 'damaged',
        weight: pickup?.isDamaged ? Math.round(totalWeight * 0.1 * 10) / 10 : 0,
        bags: pickup?.isDamaged ? 1 : 0,
        destinationRule: 'recycle_process',
      },
    ]
    setSortingCategories(categories)
  }

  const updateCategoryWeight = (cat: ClothesCategory, w: number) => {
    setSortingCategories((prev) =>
      prev.map((c) => (c.category === cat ? { ...c, weight: w } : c))
    )
  }

  const updateCategoryBags = (cat: ClothesCategory, b: number) => {
    setSortingCategories((prev) =>
      prev.map((c) => (c.category === cat ? { ...c, bags: b } : c))
    )
  }

  const updateCategoryDestination = (cat: ClothesCategory, dest: DestinationRule) => {
    setSortingCategories((prev) =>
      prev.map((c) => (c.category === cat ? { ...c, destinationRule: dest } : c))
    )
  }

  const handleConfirmSorting = (aptId: string) => {
    if (sortingCategories.reduce((s, c) => s + c.weight, 0) <= 0) return
    store.confirmSorting(aptId, { categories: sortingCategories, sortedBy })
    setSortingAptId(null)
    setSortingCategories([])
    setSuccessMsg('分拣确认成功，已按类别记录去向规则')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleConfirmReview = (aptId: string, approved: boolean) => {
    store.confirmReview(aptId, { approved, reviewNotes })
    setReviewAptId(null)
    setReviewNotes('')
    setSuccessMsg(approved ? '复核通过，已进入分拣流程' : '复核驳回，退回志愿者重新称重')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleAddCharity = () => {
    if (!charitySortingId || !region || !organization || weight <= 0) return
    store.addCharity(charitySortingId, {
      region,
      organization,
      quantity,
      weight,
      clothesCategory: charityCategory,
      destinationRule,
    })
    setCharitySortingId(null)
    setRegion('')
    setOrganization('')
    setQuantity(0)
    setWeight(0)
    setSuccessMsg('公益去向已记录')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const renderAppointmentCard = (apt: Appointment, forReview = false) => {
    const resident = store.getResidentById(apt.residentId)
    const volunteer = apt.volunteerId ? store.getVolunteerById(apt.volunteerId) : null
    const pickup = store.getPickupByAppointmentId(apt.id)
    const sorting = store.getSortingByAppointmentId(apt.id)
    const charities = sorting ? store.getCharitiesBySortingId(sorting.id) : []
    const isSelected = selectedAptId === apt.id

    return (
      <div
        key={apt.id}
        className={`card-static p-5 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:shadow-md'
        }`}
        onClick={() => setSelectedAptId(isSelected ? null : apt.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {forReview ? (
              <span className="badge-reviewing">待复核</span>
            ) : apt.status === 'picking_up' ? (
              <span className="badge-picking">回收中</span>
            ) : (
              <span className="badge-sorted">已分拣</span>
            )}
            <span className="text-sm text-gray-400 font-body">
              <Clock className="w-3 h-3 inline mr-1" />
              {apt.date}
            </span>
          </div>
        </div>
        <div className="space-y-1.5 text-sm font-body">
          <p>
            <Users className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
            <span className="text-charcoal">{resident?.name}</span>
            <span className="text-gray-400 ml-2">{resident?.address}</span>
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              <Package className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
              袋数：<span className="font-display font-bold text-charcoal">{apt.bagCount}</span>
            </span>
            <span>
              <Scale className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
              预估：<span className="font-display font-bold text-charcoal">{apt.estimatedWeight}kg</span>
            </span>
            {pickup && (
              <span>
                实称：<span className="font-display font-bold text-blue-600">{pickup.actualWeight}kg</span>
              </span>
            )}
            {apt.weightDeviation !== null && (
              <span className={apt.weightDeviation > 0.3 ? 'text-purple-600' : 'text-gray-500'}>
                差异：<span className="font-display font-bold">{(apt.weightDeviation * 100).toFixed(0)}%</span>
              </span>
            )}
          </div>
          {volunteer && (
            <p className="text-gray-500">志愿者：{volunteer.name}</p>
          )}
        </div>
        {pickup && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <span className="tag-chip bg-gray-100 text-gray-600">
              {weatherIcons[pickup.weather]} {store.getWeatherLabel(pickup.weather)}
            </span>
            {pickup.isDamp && (
              <span className="tag-chip bg-blue-100 text-blue-700">
                <Droplets className="w-3 h-3" /> 潮湿
              </span>
            )}
            {pickup.isDamaged && (
              <span className="tag-chip bg-red-100 text-red-700">
                <Scissors className="w-3 h-3" /> 破损
              </span>
            )}
            {pickup.pickupNotes && (
              <p className="text-xs text-gray-400 font-body w-full">{pickup.pickupNotes}</p>
            )}
          </div>
        )}

        {isSelected && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <div className="tracker-grid">
              <div className="tracker-cell">
                <div className="flex items-center gap-2 text-xs text-amber-600 mb-2">
                  <Package className="w-3.5 h-3.5" /> 预约登记
                </div>
                <p className="font-display font-bold text-charcoal">{apt.bagCount}袋 / {apt.estimatedWeight}kg</p>
              </div>
              {pickup && (
                <div className="tracker-cell">
                  <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                    <Scale className="w-3.5 h-3.5" /> 上门称重
                  </div>
                  <p className="font-display font-bold text-charcoal">{pickup.actualWeight}kg</p>
                  <p className="text-xs text-gray-400 mt-1">志愿者：{volunteer?.name}</p>
                </div>
              )}
              {sorting && (
                            <div className="tracker-cell">
                              <div className="flex items-center gap-2 text-xs text-forest-600 mb-2">
                                <Shirt className="w-3.5 h-3.5" /> 分拣完成
                              </div>
                              <p className="font-display font-bold text-charcoal">{sorting.totalWeight}kg</p>
                              <div className="space-y-1 mt-1">
                                {sorting.categories.filter((c) => c.weight > 0).map((c) => (
                                  <div key={c.category} className="flex items-center gap-1 text-xs flex-wrap">
                                    <span className={`tag-chip ${categoryConfig[c.category].bg} ${categoryConfig[c.category].color}`}>
                                      {categoryConfig[c.category].icon}
                                      {store.getCategoryLabel(c.category)} {c.weight}kg
                                    </span>
                                    <span className={`tag-chip ${destinationRuleConfig[c.destinationRule].bg} ${destinationRuleConfig[c.destinationRule].color}`}>
                                      {destinationRuleConfig[c.destinationRule].icon}
                                      {store.getDestinationRuleLabel(c.destinationRule)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
              {charities.length > 0 && (
                <div className="tracker-cell col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 text-xs text-warm-600 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> 公益去向
                  </div>
                  <div className="space-y-1">
                    {charities.map((c) => (
                      <div key={c.id} className="text-xs flex items-center gap-1 flex-wrap">
                        <Building2 className="w-3 h-3 text-warm-500" />
                        <span className="text-charcoal">{c.organization}</span>
                        <span className={`tag-chip ${categoryConfig[c.clothesCategory].bg} ${categoryConfig[c.clothesCategory].color}`}>
                          {categoryConfig[c.clothesCategory].icon}
                          {store.getCategoryLabel(c.clothesCategory)}
                        </span>
                        <span className={`tag-chip ${destinationRuleConfig[c.destinationRule].bg} ${destinationRuleConfig[c.destinationRule].color}`}>
                          {destinationRuleConfig[c.destinationRule].icon}
                          {store.getDestinationRuleLabel(c.destinationRule)}
                        </span>
                        <span className="font-display font-bold text-warm-500">{c.weight}kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {forReview && reviewAptId !== apt.id && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setReviewAptId(apt.id) }}
                  className="btn-secondary text-sm"
                >
                  <Search className="w-4 h-4 inline mr-1" /> 处理复核
                </button>
              </div>
            )}
            {forReview && reviewAptId === apt.id && (
              <div className="mt-4 p-4 bg-purple-50 rounded-xl animate-fade-in">
                <p className="text-sm font-medium text-purple-700 font-body mb-3">
                  复核确认：袋数{apt.bagCount}袋，预估{apt.estimatedWeight}kg，实称{pickup?.actualWeight}kg，差异{(apt.weightDeviation! * 100).toFixed(0)}%
                </p>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="复核备注（可选）..."
                  className="input-field min-h-[60px] resize-none mb-3 font-body text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConfirmReview(apt.id, true) }}
                    className="btn-primary text-sm"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" /> 复核通过
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConfirmReview(apt.id, false) }}
                    className="btn-outline text-sm"
                  >
                    驳回重称
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setReviewAptId(null); setReviewNotes('') }}
                    className="btn-outline text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {!forReview && apt.status === 'picking_up' && sortingAptId !== apt.id && (
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSortingAptId(apt.id)
                    initSortingCategories(apt)
                  }}
                  className="btn-primary text-sm"
                >
                  <Shirt className="w-4 h-4 inline mr-1" /> 开始分拣
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-blue-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:bg-blue-700 p-2 rounded-xl transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Warehouse className="w-6 h-6" />
            <h1 className="text-xl font-semibold font-body">仓库工作台</h1>
          </div>
          <div className="flex gap-4 text-sm text-blue-100 font-body">
            <span>待复核：<span className="font-display font-bold text-white">{reviewingApts.length}</span></span>
            <span>待分拣：<span className="font-display font-bold text-white">{pickingUpApts.length}</span></span>
            <span>已分拣：<span className="font-display font-bold text-white">{sortedApts.length}</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {successMsg && (
          <div className="mb-6 p-4 bg-forest-50 border border-forest-200 rounded-xl text-forest-500 font-medium text-center animate-fade-in font-body">
            <CheckCircle className="w-4 h-4 inline mr-1" /> {successMsg}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all font-body ${
              activeTab === 'review' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            待复核 ({reviewingApts.length})
          </button>
          <button
            onClick={() => setActiveTab('sorting')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all font-body ${
              activeTab === 'sorting' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            待分拣确认 ({pickingUpApts.length})
          </button>
          <button
            onClick={() => setActiveTab('charity')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all font-body ${
              activeTab === 'charity' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            公益去向
          </button>
        </div>

        {activeTab === 'review' && (
          <div>
            {reviewingApts.length === 0 ? (
              <div className="card-static p-8 text-center text-gray-400 font-body">
                暂无待复核衣物
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="section-title mb-4">待复核列表</h3>
                  {reviewingApts.map((apt) => renderAppointmentCard(apt, true))}
                </div>
                <div>
                  <h3 className="section-title mb-4">复核说明</h3>
                  <div className="card-static p-5">
                    <div className="space-y-3 text-sm font-body">
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <p className="text-purple-700 font-medium mb-1">复核触发规则</p>
                        <p className="text-purple-600">当居民登记袋数对应的预估重量（每袋按5kg估算）与志愿者上门实际称重差异超过30%时，自动进入复核流程。</p>
                      </div>
                      <div className="p-3 bg-forest-50 rounded-xl">
                        <p className="text-forest-700 font-medium mb-1">复核通过</p>
                        <p className="text-forest-600">确认称重数据无误，进入分拣流程，锁定居民袋数不可修改。</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <p className="text-amber-700 font-medium mb-1">驳回重称</p>
                        <p className="text-amber-600">退回志愿者，需要重新上门确认实际重量。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sorting' && (
          <div>
            {pickingUpApts.length === 0 ? (
              <div className="card-static p-8 text-center text-gray-400 font-body">
                暂无待分拣衣物
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="section-title mb-4">待分拣列表</h3>
                  <div className="space-y-4">
                    {pickingUpApts.map((apt) => renderAppointmentCard(apt))}
                  </div>
                </div>

                <div>
                  <h3 className="section-title mb-4">分拣确认面板</h3>
                  {sortingAptId ? (
                    <div className="card-static p-6 animate-fade-in">
                      <p className="text-sm text-gray-400 font-body mb-4">
                        预约单 {sortingAptId} — 按类别分拣并记录重量
                      </p>
                      <div className="space-y-4">
                        {(['winter', 'children', 'normal', 'damaged'] as ClothesCategory[]).map((cat) => {
                          const catData = sortingCategories.find((c) => c.category === cat) || { weight: 0, bags: 0, destinationRule: defaultCategoryDestination[cat] }
                          return (
                            <div key={cat} className={`p-4 rounded-xl ${categoryConfig[cat].bg}`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className={`flex items-center gap-2 ${categoryConfig[cat].color} font-medium font-body`}>
                                  {categoryConfig[cat].icon}
                                  {categoryConfig[cat].label}
                                </div>
                                <span className={`tag-chip bg-white ${destinationRuleConfig[catData.destinationRule].color}`}>
                                  {destinationRuleConfig[catData.destinationRule].icon}
                                  {store.getDestinationRuleLabel(catData.destinationRule)}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1 font-body">重量 (kg)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    value={catData.weight}
                                    onChange={(e) => updateCategoryWeight(cat, Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-white rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 font-display text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1 font-body">袋数</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={catData.bags}
                                    onChange={(e) => updateCategoryBags(cat, Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-white rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 font-display text-sm"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-body">去向规则</label>
                                <div className="flex gap-1.5 flex-wrap">
                                  {(['donate_mountain', 'donate_orphanage', 'donate_community', 'recycle_process', 'destroy'] as DestinationRule[]).map((rule) => (
                                    <button
                                      key={rule}
                                      onClick={() => updateCategoryDestination(cat, rule)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all font-body ${
                                        catData.destinationRule === rule
                                          ? `${destinationRuleConfig[rule].bg} ${destinationRuleConfig[rule].color} ring-2 ring-offset-1 ring-white`
                                          : 'bg-white/60 text-gray-500 hover:bg-white/80'
                                      }`}
                                    >
                                      {destinationRuleConfig[rule].icon}
                                      {store.getDestinationRuleLabel(rule)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        <div className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between text-sm font-body">
                            <span className="text-gray-500">总重量：</span>
                            <span className="font-display font-bold text-charcoal text-lg">
                              {sortingCategories.reduce((s, c) => s + c.weight, 0).toFixed(1)} kg
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-body mt-1">
                            <span className="text-gray-500">可捐赠：</span>
                            <span className="font-display font-bold text-forest-600">
                              {sortingCategories.filter((c) => c.category !== 'damaged').reduce((s, c) => s + c.weight, 0).toFixed(1)} kg
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-body mt-1">
                            <span className="text-gray-500">需处理：</span>
                            <span className="font-display font-bold text-red-600">
                              {sortingCategories.filter((c) => c.category === 'damaged').reduce((s, c) => s + c.weight, 0).toFixed(1)} kg
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-500 mb-1.5 font-body">分拣人</label>
                          <input
                            type="text"
                            value={sortedBy}
                            onChange={(e) => setSortedBy(e.target.value)}
                            className="input-field font-body text-sm"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmSorting(sortingAptId)}
                            className="btn-primary w-full"
                            disabled={sortingCategories.reduce((s, c) => s + c.weight, 0) <= 0}
                          >
                            确认分拣结果
                          </button>
                          <button
                            onClick={() => { setSortingAptId(null); setSortingCategories([]) }}
                            className="btn-outline"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card-static p-8 text-center text-gray-400 font-body">
                      ← 请先选择左侧待分拣的衣物
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'charity' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="section-title mb-4">已分拣记录</h3>
                {sortedApts.length === 0 ? (
                  <div className="card-static p-8 text-center text-gray-400 font-body">
                    暂无已分拣记录
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedApts.map((apt) => {
                      const resident = store.getResidentById(apt.residentId)
                      const sorting = store.getSortingByAppointmentId(apt.id)
                      const charities = sorting ? store.getCharitiesBySortingId(sorting.id) : []
                      const isAdding = charitySortingId === sorting?.id

                      return (
                        <div key={apt.id} className="card-static p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="badge-sorted">已分拣</span>
                            <span className="text-sm text-gray-400 font-body">{apt.date}</span>
                          </div>
                          <div className="text-sm font-body space-y-1 mb-3">
                            <p><Users className="w-3.5 h-3.5 inline mr-1 text-gray-400" /><span className="text-charcoal">{resident?.name}</span></p>
                            <div className="flex items-center gap-4 flex-wrap">
                              <span>总袋数：<span className="font-display font-bold">{apt.bagCount}</span></span>
                              {sorting && <span>分拣重量：<span className="font-display font-bold text-blue-600">{sorting.totalWeight}kg</span></span>}
                            </div>
                          </div>
                          {sorting && (
                            <div className="p-3 bg-forest-50 rounded-xl text-sm font-body space-y-2 mb-3">
                              <p className="text-forest-500 font-medium">分拣分类结果</p>
                              <div className="space-y-1.5">
                                {sorting.categories.filter((c) => c.weight > 0).map((c) => (
                                  <div key={c.category} className="flex items-center gap-2 flex-wrap">
                                    <span className={`tag-chip ${categoryConfig[c.category].bg} ${categoryConfig[c.category].color}`}>
                                      {categoryConfig[c.category].icon}
                                      {store.getCategoryLabel(c.category)} {c.weight}kg / {c.bags}袋
                                    </span>
                                    <span className={`tag-chip ${destinationRuleConfig[c.destinationRule].bg} ${destinationRuleConfig[c.destinationRule].color}`}>
                                      {destinationRuleConfig[c.destinationRule].icon}
                                      {store.getDestinationRuleLabel(c.destinationRule)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {charities.length > 0 && (
                            <div className="space-y-2 mb-3">
                              <p className="text-xs text-gray-400 font-body">已记录去向：</p>
                              {charities.map((c) => (
                                <div key={c.id} className="flex items-center gap-2 text-sm font-body flex-wrap">
                                  <MapPin className="w-3.5 h-3.5 text-warm-500 shrink-0" />
                                  <span className="text-charcoal">{c.organization}</span>
                                  <span className="text-gray-400">·</span>
                                  <span className="text-gray-500">{c.region}</span>
                                  <span className={`tag-chip ${categoryConfig[c.clothesCategory].bg} ${categoryConfig[c.clothesCategory].color}`}>
                                    {categoryConfig[c.clothesCategory].icon}
                                    {store.getCategoryLabel(c.clothesCategory)}
                                  </span>
                                  <span className={`tag-chip ${destinationRuleConfig[c.destinationRule].bg} ${destinationRuleConfig[c.destinationRule].color}`}>
                                    {destinationRuleConfig[c.destinationRule].icon}
                                    {store.getDestinationRuleLabel(c.destinationRule)}
                                  </span>
                                  <span className="font-display font-bold text-warm-500">{c.weight}kg</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {sorting && !isAdding && (
                            <button
                              onClick={() => {
                                setCharitySortingId(sorting.id)
                                setCharityCategory('winter')
                                setDestinationRule(defaultCategoryDestination['winter'])
                                setRegion('')
                                setOrganization('')
                                setQuantity(0)
                                setWeight(0)
                              }}
                              className="text-sm text-warm-500 hover:text-warm-600 font-medium font-body"
                            >
                              + 记录公益去向
                            </button>
                          )}
                          {isAdding && sorting && (
                            <div className="p-4 bg-warm-50 rounded-xl animate-fade-in space-y-3 mt-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1 font-body">衣物类别</label>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {(['winter', 'children', 'normal', 'damaged'] as ClothesCategory[]).map((cat) => (
                                      <button
                                        key={cat}
                                        onClick={() => {
                                          setCharityCategory(cat)
                                          setDestinationRule(defaultCategoryDestination[cat])
                                        }}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all font-body ${
                                          charityCategory === cat
                                            ? `${categoryConfig[cat].bg} ${categoryConfig[cat].color} ring-2 ring-offset-1`
                                            : 'bg-white text-gray-500 border hover:bg-gray-50'
                                        }`}
                                      >
                                        {categoryConfig[cat].icon} {store.getCategoryLabel(cat)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1 font-body">去向规则</label>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {(['donate_mountain', 'donate_orphanage', 'donate_community', 'recycle_process', 'destroy'] as DestinationRule[]).map((rule) => (
                                      <button
                                        key={rule}
                                        onClick={() => setDestinationRule(rule)}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all font-body ${
                                          destinationRule === rule
                                            ? `${destinationRuleConfig[rule].bg} ${destinationRuleConfig[rule].color} ring-2 ring-offset-1`
                                            : 'bg-white text-gray-500 border hover:bg-gray-50'
                                        }`}
                                      >
                                        {destinationRuleConfig[rule].icon} {store.getDestinationRuleLabel(rule)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1 font-body">捐赠地区</label>
                                <input
                                  type="text"
                                  value={region}
                                  onChange={(e) => setRegion(e.target.value)}
                                  placeholder="如：云南山区"
                                  className="input-field font-body text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1 font-body">接收机构</label>
                                <input
                                  type="text"
                                  value={organization}
                                  onChange={(e) => setOrganization(e.target.value)}
                                  placeholder="如：爱心传递公益中心"
                                  className="input-field font-body text-sm"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1 font-body">数量 (件)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={quantity || ''}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="input-field font-display text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1 font-body">重量 (kg)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    value={weight || ''}
                                    onChange={(e) => setWeight(Number(e.target.value))}
                                    className="input-field font-display text-sm"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={handleAddCharity} className="btn-secondary text-sm">确认记录</button>
                                <button onClick={() => setCharitySortingId(null)} className="btn-outline text-sm">取消</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="section-title mb-4">公益去向时间线</h3>
                {store.charities.length === 0 ? (
                  <div className="card-static p-8 text-center text-gray-400 font-body">
                    暂无公益去向记录
                  </div>
                ) : (
                  <div className="relative pl-8">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-warm-200" />
                    {store.charities.map((c) => {
                      const sorting = store.sortings.find((s) => s.id === c.sortingId)
                      const apt = sorting ? store.appointments.find((a) => a.id === sorting.appointmentId) : null
                      const resident = apt ? store.getResidentById(apt.residentId) : null
                      return (
                        <div key={c.id} className="relative mb-6 animate-fade-in">
                          <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-warm-500 border-2 border-white shadow" />
                          <div className="card-static p-4">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Building2 className="w-4 h-4 text-warm-500" />
                              <span className="text-sm font-medium text-charcoal font-body">{c.organization}</span>
                              <span className={`tag-chip ${categoryConfig[c.clothesCategory].bg} ${categoryConfig[c.clothesCategory].color}`}>
                                {categoryConfig[c.clothesCategory].icon}
                                {store.getCategoryLabel(c.clothesCategory)}
                              </span>
                              <span className={`tag-chip ${destinationRuleConfig[c.destinationRule].bg} ${destinationRuleConfig[c.destinationRule].color}`}>
                                {destinationRuleConfig[c.destinationRule].icon}
                                {store.getDestinationRuleLabel(c.destinationRule)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 font-body space-y-1">
                              <p><MapPin className="w-3 h-3 inline mr-1" />{c.region}</p>
                              <p>
                                捐赠数量：<span className="font-display font-bold text-warm-500">{c.quantity}</span> 件
                                ，重量：<span className="font-display font-bold text-warm-500">{c.weight}</span> kg
                              </p>
                              <p className="text-xs text-gray-400">来源：{resident?.name}的预约单</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
