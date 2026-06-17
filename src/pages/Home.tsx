import { Link } from 'react-router-dom'
import { Users, Heart, Warehouse, Recycle } from 'lucide-react'

const roles = [
  {
    path: '/resident',
    icon: Users,
    title: '居民入口',
    desc: '登记衣物袋数，预约上门回收时间，跟踪回收进度',
    color: 'forest',
    gradient: 'from-forest-500 to-forest-700',
  },
  {
    path: '/volunteer',
    icon: Heart,
    title: '志愿者入口',
    desc: '浏览待接订单，上门回收衣物，标记衣物状况',
    color: 'warm',
    gradient: 'from-warm-500 to-warm-700',
  },
  {
    path: '/warehouse',
    icon: Warehouse,
    title: '仓库入口',
    desc: '分拣确认衣物，记录可捐赠和需处理数量，追踪公益去向',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-forest-500 blur-3xl" />
          <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-warm-500 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-40 h-40 rounded-full bg-forest-300 blur-3xl" />
        </div>

        <header className="relative pt-16 pb-12 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Recycle className="w-10 h-10 text-forest-500 animate-float" />
            <h1 className="text-4xl font-bold text-charcoal font-body">
              社区旧衣回收
            </h1>
          </div>
          <p className="text-lg text-gray-500 font-body">
            让旧衣找到新家，让公益触手可及
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-forest-500">
            <span className="inline-block w-8 h-px bg-forest-400" />
            预约 · 回收 · 分拣 · 公益
            <span className="inline-block w-8 h-px bg-forest-400" />
          </div>
        </header>

        <div className="relative max-w-5xl mx-auto px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <Link
                key={role.path}
                to={role.path}
                className="card p-8 text-center group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal mb-2 font-body">
                  {role.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed font-body">
                  {role.desc}
                </p>
                <div className="mt-5 text-forest-500 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                  进入工作台 →
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 pb-16">
          <Link
            to="/overview"
            className="card-static p-5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-forest-500" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal font-body">流程总览</h3>
                <p className="text-sm text-gray-400">查看全链路数据看板</p>
              </div>
            </div>
            <span className="text-forest-500 text-sm group-hover:translate-x-1 transition-transform">
              查看详情 →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
