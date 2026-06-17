import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Home, Clock, AlertTriangle, CheckCircle, Droplets, Scissors } from 'lucide-react'
import { useClothesStore } from '@/store/useClothesStore'
import type { Appointment } from '@/types'

export default function VolunteerPage() {
  const store = useClothesStore()
  const currentVolunteer = store.getVolunteerById(store.currentVolunteerId)
  const pendingApts = store.getPendingAppointments()
  const myApts = store.getAppointmentsByVolunteerId(store.currentVolunteerId).filter(
    (a) => a.status === 'picking_up'
  )

  const [activeTab, setActiveTab] = useState<'pending' | 'my'>('pending')
  const [markingAptId, setMarkingAptId] = useState<string | null>(null)
  const [isDamp, setIsDamp] = useState(false)
  const [isDamaged, setIsDamaged] = useState(false)
  const [pickupNotes, setPickupNotes] = useState('')
  const [alertMsg, setAlertMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAccept = (apt: Appointment) => {
    const result = store.acceptAppointment(apt.id, store.currentVolunteerId)
    if (result.success) {
      setSuccessMsg(`已成功接单：${apt.date} ${apt.timeSlot}`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setAlertMsg(result.reason || '接单失败')
      setTimeout(() => setAlertMsg(''), 4000)
    }
  }

  const hasTimeConflict = (apt: Appointment) => {
    return myApts.some((a) => a.date === apt.date && a.timeSlot === apt.timeSlot)
  }

  const handleCompletePickup = (aptId: string) => {
    store.completePickup(aptId, { isDamp, isDamaged, pickupNotes })
    setMarkingAptId(null)
    setIsDamp(false)
    setIsDamaged(false)
    setPickupNotes('')
    setSuccessMsg('回收标记已提交')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-warm-500 text-white py-4 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:bg-warm-600 p-2 rounded-xl transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Heart className="w-6 h-6" />
            <h1 className="text-xl font-semibold font-body">志愿者工作台</h1>
          </div>
          <div className="flex items-center gap-2 text-warm-100 text-sm font-body">
            <span>当前志愿者：</span>
            <select
              value={store.currentVolunteerId}
              onChange={(e) => store.setCurrentVolunteer(e.target.value)}
              className="bg-warm-600 text-white rounded-lg px-3 py-1.5 text-sm border-none outline-none cursor-pointer"
            >
              {store.volunteers.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {alertMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium text-center animate-fade-in font-body">
            <AlertTriangle className="w-4 h-4 inline mr-1" /> {alertMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-forest-50 border border-forest-200 rounded-xl text-forest-500 font-medium text-center animate-fade-in font-body">
            <CheckCircle className="w-4 h-4 inline mr-1" /> {successMsg}
          </div>
        )}

        <div className="card-static p-5 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-charcoal font-body">{currentVolunteer?.name}</span>
            <span className="text-sm text-gray-400 font-body">{currentVolunteer?.phone}</span>
          </div>
          <div className="flex gap-6 mt-2 text-sm text-gray-500 font-body">
            <span>待接订单：<span className="font-display font-bold text-amber-500">{pendingApts.length}</span></span>
            <span>我的任务：<span className="font-display font-bold text-warm-500">{myApts.length}</span></span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all font-body ${
              activeTab === 'pending' ? 'bg-warm-500 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            待接订单
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all font-body ${
              activeTab === 'my' ? 'bg-warm-500 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            我的回收任务
          </button>
        </div>

        {activeTab === 'pending' && (
          <div>
            {pendingApts.length === 0 ? (
              <div className="card-static p-8 text-center text-gray-400 font-body">
                暂无待接订单
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApts.map((apt) => {
                  const resident = store.getResidentById(apt.residentId)
                  const conflict = hasTimeConflict(apt)
                  return (
                    <div key={apt.id} className={`card-static p-5 ${conflict ? 'ring-2 ring-red-200' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="badge-pending">待接单</span>
                          {conflict && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-500 font-body">
                              <AlertTriangle className="w-3 h-3" /> 时间冲突
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400 font-body">
                          <Clock className="w-3.5 h-3.5" />
                          {apt.date}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 font-body">居民</span>
                          <span className="text-sm text-charcoal font-body">{resident?.name}</span>
                          <span className="text-xs text-gray-400 font-body">{resident?.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 font-body">袋数</span>
                          <span className="font-display text-lg font-bold text-charcoal">{apt.bagCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 font-body">时段</span>
                          <span className="text-sm text-charcoal font-body">{apt.timeSlot}</span>
                        </div>
                        {apt.notes && (
                          <p className="text-sm text-gray-400 font-body italic">{apt.notes}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleAccept(apt)}
                        disabled={conflict}
                        className={`w-full py-2 rounded-xl text-sm font-medium transition-all font-body ${
                          conflict
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-warm-500 text-white hover:bg-warm-600 active:bg-warm-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {conflict ? '时间冲突，无法接单' : '接单回收'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my' && (
          <div>
            {myApts.length === 0 ? (
              <div className="card-static p-8 text-center text-gray-400 font-body">
                暂无回收任务
              </div>
            ) : (
              <div className="space-y-4">
                {myApts.map((apt) => {
                  const resident = store.getResidentById(apt.residentId)
                  const existingPickup = store.getPickupByAppointmentId(apt.id)
                  const isMarking = markingAptId === apt.id

                  return (
                    <div key={apt.id} className="card-static p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge-picking">回收中</span>
                        <div className="text-sm text-gray-400 font-body">
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          {apt.date} {apt.timeSlot}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-sm font-body">
                          <span className="text-gray-400">居民：</span>
                          <span className="text-charcoal">{resident?.name}</span>
                          <span className="text-gray-400 ml-2">{resident?.address}</span>
                        </div>
                        <div className="text-sm font-body">
                          <span className="text-gray-400">袋数：</span>
                          <span className="font-display font-bold text-charcoal">{apt.bagCount}</span>
                        </div>
                      </div>

                      {existingPickup ? (
                        <div className="p-3 bg-blue-50 rounded-xl text-sm font-body">
                          <p className="text-blue-700 font-medium mb-1">已标记回收信息</p>
                          <div className="text-blue-600 space-y-1">
                            <p>潮湿：{existingPickup.isDamp ? '⚠️ 是' : '否'}</p>
                            <p>破损：{existingPickup.isDamaged ? '⚠️ 是' : '否'}</p>
                            {existingPickup.pickupNotes && <p>备注：{existingPickup.pickupNotes}</p>}
                          </div>
                        </div>
                      ) : isMarking ? (
                        <div className="p-4 bg-amber-50 rounded-xl animate-fade-in">
                          <p className="text-sm font-medium text-amber-700 font-body mb-3">标记衣物状况</p>
                          <div className="flex gap-3 mb-3">
                            <button
                              onClick={() => setIsDamp(!isDamp)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all font-body ${
                                isDamp ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-500 border'
                              }`}
                            >
                              <Droplets className="w-4 h-4" /> 潮湿
                            </button>
                            <button
                              onClick={() => setIsDamaged(!isDamaged)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all font-body ${
                                isDamaged ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-500 border'
                              }`}
                            >
                              <Scissors className="w-4 h-4" /> 破损
                            </button>
                          </div>
                          <textarea
                            value={pickupNotes}
                            onChange={(e) => setPickupNotes(e.target.value)}
                            placeholder="补充衣物状况说明..."
                            className="input-field min-h-[60px] resize-none mb-3 font-body text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCompletePickup(apt.id)}
                              className="btn-primary text-sm"
                            >
                              确认提交
                            </button>
                            <button
                              onClick={() => { setMarkingAptId(null); setIsDamp(false); setIsDamaged(false); setPickupNotes('') }}
                              className="btn-outline text-sm"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setMarkingAptId(apt.id)}
                          className="btn-secondary text-sm"
                        >
                          标记衣物状况
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
