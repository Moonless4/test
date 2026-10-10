import { Building2, Mail, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/api'
import { Container } from '@/components/ui/Container'
import { toPersianDigits } from '@/lib/format'

interface DashboardStats {
  properties_count: number
  featured_count: number
  inquiries_count: number
  new_inquiries: number
  agents_count: number
  users_count: number
  total_value: string
  recent_inquiries: Array<{ id: number; kind: string; name: string; phone: string; status: string; property_name: string | null; created_at: string }>
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.dashboard().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted">در حال بارگذاری…</div>

  const cards = [
    { label: 'املاک', value: stats?.properties_count ?? 0, icon: Building2, color: 'bg-navy/5 text-navy' },
    { label: 'پیام‌های جدید', value: stats?.new_inquiries ?? 0, icon: MessageSquare, color: 'bg-gold/10 text-gold-dark' },
    { label: 'کل مشتریان', value: stats?.users_count ?? 0, icon: Users, color: 'bg-green-50 text-green-700' },
    { label: 'مشاوران', value: stats?.agents_count ?? 0, icon: TrendingUp, color: 'bg-blue-50 text-blue-700' },
  ]

  const kindLabels: Record<string, string> = { contact: 'تماس', agent: 'مشاوره', viewing: 'بازدید' }
  const statusLabels: Record<string, string> = { new: 'جدید', contacted: 'در حال پیگیری', closed: 'بسته شد' }
  const statusColors: Record<string, string> = { new: 'bg-gold/15 text-gold-dark', contacted: 'bg-blue-50 text-blue-700', closed: 'bg-green-50 text-green-700' }

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-line bg-white">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-[18px] font-bold text-ink">داشبورد مدیریت</h1>
              <p className="text-[13px] text-muted">{user?.name} — {user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="text-[13px] text-muted hover:text-navy">مشاهده سایت</Link>
              <button onClick={() => { logout(); navigate('/login') }} className="rounded-lg bg-gold/10 px-4 py-2 text-[13px] text-gold-dark hover:bg-gold/20">
                خروج
              </button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-card border border-line bg-white p-5">
              <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <p className="text-[26px] font-bold text-ink">{toPersianDigits(card.value)}</p>
              <p className="text-[13px] text-muted">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-card border border-line bg-white p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-ink">آخرین پیام‌ها</h2>
              <Link to="/admin/inquiries" className="text-[13px] text-navy hover:underline">مشاهده همه</Link>
            </div>
            {stats && stats.recent_inquiries.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_inquiries.map((inq) => (
                  <div key={inq.id} className="flex items-center justify-between border-b border-line pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-ink">{inq.name}</p>
                      <p className="text-[12px] text-muted">
                        {kindLabels[inq.kind] ?? inq.kind} — {inq.property_name ?? 'عمومی'} — <span dir="ltr">{inq.phone}</span>
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] ${statusColors[inq.status] ?? ''}`}>
                      {statusLabels[inq.status] ?? inq.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted">
                <Mail className="mb-3 h-8 w-8 text-muted/40" strokeWidth={1.5} />
                <p className="text-sm">هنوز پیامی دریافت نشده است</p>
              </div>
            )}
          </div>

          <div className="rounded-card border border-line bg-white p-6">
            <h2 className="mb-5 text-[16px] font-bold text-ink">مدیریت سریع</h2>
            <div className="space-y-2.5">
              <Link to="/admin/properties" className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-sm text-ink transition-colors hover:bg-mist">
                <Building2 className="h-4 w-4 text-gold" strokeWidth={1.8} />
                مدیریت املاک
              </Link>
              <Link to="/admin/inquiries" className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-sm text-ink transition-colors hover:bg-mist">
                <MessageSquare className="h-4 w-4 text-gold" strokeWidth={1.8} />
                مدیریت پیام‌ها و بازدیدها
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
