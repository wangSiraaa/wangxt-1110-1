import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Warehouse, Home, Droplets, Scissors, CheckCircle, MapPin, Building2 } from 'lucide-react'
import { useClothesStore } from '@/store/useClothesStore'

export default function WarehousePage() {
  const store = useClothesStore()
  const pickingUpApts = store.getPickingUpAppointments()
  const sortedApts = store.getSortedAppointments()

  const [activeTab, setActiveTab] = useState<'sorting' | 'charity'>('sorting')
  const [sortingAptId, setSortingAptId] = useState<string | null>(null)
  const [donatableCount, setDonatableCount] = useState(0)
  const [processableCount, setProcessableCount] = useState(0)
  const [sortedBy, setSortedBy] = useState('仓库管理员-周姐')
  const [charitySortingId, setCharitySortingId] = useState<string | null>(null)
  const [region, setRegion] = useState('')
  const [organization, setOrganization] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [successMsg, setSuccessMsg] = useState('')

  const handleConfirmSorting = (aptId: string) => {
    if (donatableCount + processableCount <= 0) return
    store.confirmSorting(aptId, { donatableCount, processableCount, sortedBy })
    setSortingAptId(null)
    setDonatableCount(0)
    setProcessableCount(0)
    setSuccessMsg('分拣确认成功，居民袋数已锁定')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleAddCharity = () => {
    if (!charitySortingId || !region || !organization || quantity <= 0) return
    store.addCharity(charitySortingId, { region, organization, quantity })
    setCharitySortingId(null)
    setRegion('')
    setOrganization('')
    setQuantity(0)
    setSuccessMsg('公益去向已记录')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-blue-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:bg-blue-700 p-2 rounded-xl transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Warehouse className="w-6 h-6" />
            <h1 className="text-xl font-semibold font-body">仓库工作台</h1>
          </div>
          <div className="flex gap-4 text-sm text-blue-100 font-body">
            <span>待分拣：<span className="font-display font-bold text-white">{pickingUpApts.length}</span></span>
            <span>已分拣：<span className="font-display font-bold text-white">{sortedApts.length}</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {successMsg && (
          <div className="mb-6 p-4 bg-forest-50 border border-forest-200 rounded-xl text-forest-500 font-medium text-center animate-fade-in font-body">
            <CheckCircle className="w-4 h-4 inline mr-1" /> {successMsg}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('sorting')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all font-body ${
              activeTab === 'sorting' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            待分拣确认
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
                    {pickingUpApts.map((apt) => {
                      const resident = store.getResidentById(apt.residentId)
                      const volunteer = apt.volunteerId ? store.getVolunteerById(apt.volunteerId) : null
                      const pickup = store.getPickupByAppointmentId(apt.id)
                      const isActive = sortingAptId === apt.id

                      return (
                        <div
                          key={apt.id}
                          className={`card-static p-5 cursor-pointer transition-all ${
                            isActive ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:shadow-md'
                          }`}
                          onClick={() => {
                            setSortingAptId(apt.id)
                            setDonatableCount(apt.bagCount)
                            setProcessableCount(0)
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="badge-picking">回收中</span>
                            <span className="text-sm text-gray-400 font-body">{apt.date}</span>
                          </div>
                          <div className="space-y-1.5 text-sm font-body">
                            <p><span className="text-gray-400">居民：</span>{resident?.name} <span className="text-gray-400">{resident?.address}</span></p>
                            <p><span className="text-gray-400">袋数：</span><span className="font-display font-bold text-charcoal">{apt.bagCount}</span></p>
                            <p><span className="text-gray-400">回收志愿者：</span>{volunteer?.name}</p>
                          </div>
                          {pickup && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                              {pickup.isDamp && (
                                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-body">
                                  <Droplets className="w-3 h-3" /> 潮湿
                                </span>
                              )}
                              {pickup.isDamaged && (
                                <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-body">
                                  <Scissors className="w-3 h-3" /> 破损
                                </span>
                              )}
                              {pickup.pickupNotes && (
                                <p className="text-xs text-gray-400 font-body w-full mt-1">{pickup.pickupNotes}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="section-title mb-4">分拣确认</h3>
                  {sortingAptId ? (
                    <div className="card-static p-6 animate-fade-in">
                      <p className="text-sm text-gray-400 font-body mb-4">
                        预约单 {sortingAptId}
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-500 mb-1.5 font-body">可捐赠数量</label>
                          <input
                            type="number"
                            min={0}
                            value={donatableCount}
                            onChange={(e) => setDonatableCount(Number(e.target.value))}
                            className="input-field font-display"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1.5 font-body">需处理数量</label>
                          <input
                            type="number"
                            min={0}
                            value={processableCount}
                            onChange={(e) => setProcessableCount(Number(e.target.value))}
                            className="input-field font-display"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1.5 font-body">分拣人</label>
                          <input
                            type="text"
                            value={sortedBy}
                            onChange={(e) => setSortedBy(e.target.value)}
                            className="input-field font-body"
                          />
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700 font-body">
                          ⚠️ 确认后居民将无法修改袋数
                        </div>
                        <button
                          onClick={() => handleConfirmSorting(sortingAptId)}
                          className="btn-primary w-full"
                          disabled={donatableCount + processableCount <= 0}
                        >
                          确认分拣结果
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="card-static p-8 text-center text-gray-400 font-body">
                      ← 请先选择待分拣的衣物
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
                            <p><span className="text-gray-400">居民：</span>{resident?.name}</p>
                            <p><span className="text-gray-400">总袋数：</span><span className="font-display font-bold">{apt.bagCount}</span></p>
                          </div>
                          {sorting && (
                            <div className="p-3 bg-forest-50 rounded-xl text-sm font-body space-y-1 mb-3">
                              <p className="text-forest-500 font-medium">分拣结果</p>
                              <p>可捐赠：<span className="font-display font-bold">{sorting.donatableCount}</span></p>
                              <p>需处理：<span className="font-display font-bold">{sorting.processableCount}</span></p>
                            </div>
                          )}
                          {charities.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {charities.map((c) => (
                                <div key={c.id} className="flex items-center gap-2 text-sm font-body">
                                  <MapPin className="w-3.5 h-3.5 text-warm-500 shrink-0" />
                                  <span className="text-charcoal">{c.organization}</span>
                                  <span className="text-gray-400">·</span>
                                  <span className="text-gray-500">{c.region}</span>
                                  <span className="text-gray-400">·</span>
                                  <span className="font-display font-bold text-warm-500">{c.quantity}</span>
                                  <span className="text-gray-400">件</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {sorting && !isAdding && (
                            <button
                              onClick={() => { setCharitySortingId(sorting.id); setQuantity(sorting.donatableCount - charities.reduce((s, c) => s + c.quantity, 0)) }}
                              className="text-sm text-warm-500 hover:text-warm-600 font-medium font-body"
                            >
                              + 记录公益去向
                            </button>
                          )}
                          {isAdding && (
                            <div className="p-3 bg-warm-50 rounded-xl animate-fade-in space-y-3">
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
                              <div>
                                <label className="block text-sm text-gray-500 mb-1 font-body">捐赠数量</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={quantity}
                                  onChange={(e) => setQuantity(Number(e.target.value))}
                                  className="input-field font-display text-sm"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={handleAddCharity} className="btn-secondary text-sm">确认</button>
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
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-4 h-4 text-warm-500" />
                              <span className="text-sm font-medium text-charcoal font-body">{c.organization}</span>
                            </div>
                            <div className="text-sm text-gray-500 font-body space-y-1">
                              <p><MapPin className="w-3 h-3 inline mr-1" />{c.region}</p>
                              <p>捐赠数量：<span className="font-display font-bold text-warm-500">{c.quantity}</span> 件</p>
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
