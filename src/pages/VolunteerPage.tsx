import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Home,
  Clock,
  AlertTriangle,
  CheckCircle,
  Droplets,
  Scissors,
  Scale,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Route,
  RefreshCw,
  Package,
  User,
} from 'lucide-react'
import { useClothesStore } from '@/store/useClothesStore'
import type { Appointment, WeatherStatus } from '@/types'

const weatherIcons: Record<WeatherStatus, React.ReactNode> = {
  sunny: <Sun className="w-4 h-4" />,
  cloudy: <Cloud className="w-4 h-4" />,
  rain: <CloudRain className="w-4 h-4" />,
  storm: <CloudLightning className="w-4 h-4" />,
  snow: <Snowflake className="w-4 h-4" />,
}

const BAD_WEATHER: WeatherStatus[] = ['rain', 'storm', 'snow']

export default function VolunteerPage() {
  const store = useClothesStore()
  const currentVolunteer = store.getVolunteerById(store.currentVolunteerId)
  const pendingApts = store.getPendingAppointments()
  const myApts = store.getAppointmentsByVolunteerId(store.currentVolunteerId).filter(
    (a) => a.status === 'picking_up' || a.status === 'reviewing'
  )
  const reviewingApts = store.getReviewingAppointments()

  const [activeTab, setActiveTab] = useState<'pending' | 'my'>('pending')
  const [markingAptId, setMarkingAptId] = useState<string | null>(null)
  const [isDamp, setIsDamp] = useState(false)
  const [isDamaged, setIsDamaged] = useState(false)
  const [pickupNotes, setPickupNotes] = useState('')
  const [actualWeight, setActualWeight] = useState(0)
  const [weather, setWeather] = useState<WeatherStatus>('sunny')
  const [alertMsg, setAlertMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAccept = (apt: Appointment) => {
    const result = store.acceptAppointment(apt.id, store.currentVolunteerId)
    if (result.success) {
      setSuccessMsg(`已成功接单：${apt.date} ${apt.timeSlot}`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      if (result.reason?.includes('自动转派') || result.reason?.includes('天气')) {
        const reassignResult = store.autoReassign(apt.id, result.reason || '')
        if (reassignResult.success && reassignResult.newVolunteerId) {
          const newVolunteer = store.getVolunteerById(reassignResult.newVolunteerId)
          setAlertMsg(`${result.reason}，已自动转派给志愿者${newVolunteer?.name || ''}，原预约顺序保留`)
        } else {
          setAlertMsg(`${result.reason}，${reassignResult.reason || '保留原预约顺序等待'}`)
        }
      } else {
        setAlertMsg(result.reason || '接单失败')
      }
      setTimeout(() => setAlertMsg(''), 5000)
    }
  }

  const hasTimeConflict = (apt: Appointment) => {
    return store.checkTimeConflict(store.currentVolunteerId, apt.date, apt.timeSlot)
  }

  const hasRouteConflict = (apt: Appointment) => {
    return store.checkRouteConflict(store.currentVolunteerId, apt.id)
  }

  const isBadWeather = (apt: Appointment) => {
    return BAD_WEATHER.includes(store.checkWeather(apt.date))
  }

  const handleCompletePickup = (aptId: string) => {
    if (actualWeight <= 0) {
      setAlertMsg('请输入实际称重重量')
      setTimeout(() => setAlertMsg(''), 3000)
      return
    }
    const result = store.completePickup(aptId, { isDamp, isDamaged, pickupNotes, actualWeight, weather })
    setMarkingAptId(null)
    setIsDamp(false)
    setIsDamaged(false)
    setPickupNotes('')
    setActualWeight(0)
    setWeather('sunny')
    if (result.needReview) {
      setSuccessMsg(`回收标记已提交，重量差异${(result.deviation * 100).toFixed(0)}%，已进入复核流程`)
    } else {
      setSuccessMsg('回收标记已提交')
    }
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const weatherOptions: WeatherStatus[] = ['sunny', 'cloudy', 'rain', 'storm', 'snow']

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-warm-500 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto px-6 py-8">
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
          <div className="flex gap-6 mt-2 text-sm text-gray-500 font-body flex-wrap">
            <span>待接订单：<span className="font-display font-bold text-amber-500">{pendingApts.length}</span></span>
            <span>我的任务：<span className="font-display font-bold text-warm-500">{myApts.length}</span></span>
            <span>待复核：<span className="font-display font-bold text-purple-500">{reviewingApts.length}</span></span>
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
                  const routeConflict = hasRouteConflict(apt)
                  const badWeather = isBadWeather(apt)
                  const aptWeather = store.checkWeather(apt.date)
                  const disabled = conflict || routeConflict || badWeather

                  return (
                    <div key={apt.id} className={`card-static p-5 ${disabled ? 'ring-2 ring-red-200' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge-pending">待接单</span>
                          <span className="tag-chip bg-gray-100 text-gray-600">
                            #{apt.orderIndex + 1} 号预约
                          </span>
                          {conflict && (
                            <span className="tag-chip bg-red-100 text-red-700">
                              <Clock className="w-3 h-3" /> 时间冲突
                            </span>
                          )}
                          {routeConflict && (
                            <span className="tag-chip bg-orange-100 text-orange-700">
                              <Route className="w-3 h-3" /> 路线冲突
                            </span>
                          )}
                          {badWeather && (
                            <span className="tag-chip bg-blue-100 text-blue-700">
                              {weatherIcons[aptWeather]} 天气不宜上门
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
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-charcoal font-body">{resident?.name}</span>
                          <span className="text-xs text-gray-400 font-body">{resident?.address}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400 font-body">袋数</span>
                            <span className="font-display text-lg font-bold text-charcoal">{apt.bagCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400 font-body">预估</span>
                            <span className="font-display text-lg font-bold text-charcoal">{apt.estimatedWeight}<span className="text-sm font-normal text-gray-400">kg</span></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 font-body">时段</span>
                          <span className="text-sm text-charcoal font-body">{apt.timeSlot}</span>
                          <span className="tag-chip bg-gray-100 text-gray-600 ml-2">
                            {weatherIcons[aptWeather]} {store.getWeatherLabel(aptWeather)}
                          </span>
                        </div>
                        {apt.notes && (
                          <p className="text-sm text-gray-400 font-body italic">{apt.notes}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleAccept(apt)}
                        disabled={disabled}
                        className={`w-full py-2 rounded-xl text-sm font-medium transition-all font-body ${
                          disabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-warm-500 text-white hover:bg-warm-600 active:bg-warm-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {conflict
                          ? '时间冲突，系统自动转派'
                          : routeConflict
                          ? '路线冲突，系统自动转派'
                          : badWeather
                          ? '天气不宜，系统自动转派'
                          : '接单回收'}
                      </button>
                      {disabled && (
                        <p className="text-xs text-gray-400 text-center mt-2 font-body">
                          <RefreshCw className="w-3 h-3 inline mr-1" />
                          将自动转派给其他可用志愿者，保留原预约顺序
                        </p>
                      )}
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
                  const isReviewing = apt.status === 'reviewing'

                  return (
                    <div key={apt.id} className="card-static p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isReviewing ? (
                            <span className="badge-reviewing">待复核</span>
                          ) : (
                            <span className="badge-picking">回收中</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 font-body">
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          {apt.date} {apt.timeSlot}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-sm font-body">
                          <User className="w-4 h-4 text-gray-400 inline mr-1" />
                          <span className="text-charcoal">{resident?.name}</span>
                          <span className="text-gray-400 ml-2">{resident?.address}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-body">
                          <span className="text-gray-400">
                            袋数：<span className="font-display font-bold text-charcoal">{apt.bagCount}</span>
                          </span>
                          <span className="text-gray-400">
                            预估：<span className="font-display font-bold text-charcoal">{apt.estimatedWeight}<span className="text-sm font-normal">kg</span></span>
                          </span>
                          {apt.weightDeviation !== null && (
                            <span className={apt.weightDeviation > 0.3 ? 'text-purple-600' : 'text-gray-500'}>
                              差异：<span className="font-display font-bold">{(apt.weightDeviation * 100).toFixed(0)}%</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {isReviewing ? (
                        <div className="p-3 bg-purple-50 rounded-xl text-sm font-body">
                          <p className="text-purple-700 font-medium mb-1">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            重量差异待仓库复核
                          </p>
                          <p className="text-purple-600">
                            袋数预估与实际称重差距超过30%，已进入复核流程
                          </p>
                        </div>
                      ) : existingPickup ? (
                        <div className="p-3 bg-blue-50 rounded-xl text-sm font-body">
                          <p className="text-blue-700 font-medium mb-1">已标记回收信息</p>
                          <div className="text-blue-600 space-y-1">
                            <p>实际称重：<span className="font-display font-bold">{existingPickup.actualWeight}</span> kg</p>
                            <p className="flex items-center gap-1">
                              天气：{weatherIcons[existingPickup.weather]} {store.getWeatherLabel(existingPickup.weather)}
                            </p>
                            <p>潮湿：{existingPickup.isDamp ? '⚠️ 是' : '否'}</p>
                            <p>破损：{existingPickup.isDamaged ? '⚠️ 是' : '否'}</p>
                            {existingPickup.pickupNotes && <p>备注：{existingPickup.pickupNotes}</p>}
                            {existingPickup.autoReassigned && (
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <p className="text-orange-600 font-medium">
                                  <RefreshCw className="w-3 h-3 inline mr-1" /> 自动转派单
                                </p>
                                <p className="text-orange-500 text-xs">
                                  转派原因：{existingPickup.reassignReason}
                                </p>
                                {existingPickup.originalVolunteerId && (
                                  <p className="text-orange-500 text-xs">
                                    原志愿者：{store.getVolunteerById(existingPickup.originalVolunteerId)?.name || '未知'}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : isMarking ? (
                        <div className="p-4 bg-amber-50 rounded-xl animate-fade-in">
                          <p className="text-sm font-medium text-amber-700 font-body mb-3">标记衣物状况</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-sm text-gray-500 mb-1.5 font-body flex items-center gap-1">
                                <Scale className="w-3.5 h-3.5" /> 实际称重 (kg)
                              </label>
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={actualWeight || ''}
                                onChange={(e) => setActualWeight(Number(e.target.value))}
                                placeholder={`预估约 ${apt.bagCount * 5}kg`}
                                className="input-field font-display text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 mb-1.5 font-body">当日天气</label>
                              <div className="flex gap-1.5 flex-wrap">
                                {weatherOptions.map((w) => (
                                  <button
                                    key={w}
                                    onClick={() => setWeather(w)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all font-body ${
                                      weather === w
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-white text-gray-500 border hover:bg-gray-50'
                                    }`}
                                  >
                                    {weatherIcons[w]} {store.getWeatherLabel(w)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

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
                              onClick={() => {
                                setMarkingAptId(null)
                                setIsDamp(false)
                                setIsDamaged(false)
                                setPickupNotes('')
                                setActualWeight(0)
                                setWeather('sunny')
                              }}
                              className="btn-outline text-sm"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setMarkingAptId(apt.id)
                            setActualWeight(apt.bagCount * 5)
                          }}
                          className="btn-secondary text-sm"
                        >
                          标记衣物状况并称重
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
