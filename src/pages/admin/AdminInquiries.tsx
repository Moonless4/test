import { Mail, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminRoutes } from '@/lib/adminRoutes'
import { adminApi, ApiError } from '@/lib/api'
import { Container } from '@/components/ui/Container'
import { toPersianDigits } from '@/lib/format'

interface InquiryItem {
  id: number
  kind: string
  name: string
  email: string
  phone: string
  message: string | null
  property_id: number | null
  preferred_date: string | null
  preferred_time: string | null
  status: string
  created_at: string
  property: { id: number; name: string; slug: string } | null
}

const kindLabels: Record<string, string> = { contact: 'تماس', agent: 'مشاوره', viewing: 'درخواست بازدید' }
const kindColors: Record<string, string> = { contact: 'bg-blue-50 text-blue-700', agent: 'bg-purple-50 text-purple-700', viewing: 'bg-gold/15 text-gold-dark' }
const statusLabels: Record<string, string> = { new: 'جدید', contacted: 'در حال پیگیری', closed: 'بسته شد' }
const statusColors: Record<string, string> = { new: 'bg-gold/15 text-gold-dark', contacted: 'bg-blue-50 text-blue-700', closed: 'bg-green-50 text-green-700' }

const formatDate = (iso: string): string => {
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function AdminInquiries() {
  const [routes] = useAdminRoutes()
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [total, setTotal] = useState(0)

  const load = () => {
    setLoading(true)
    const params = filter ? { status: filter } : undefined
    adminApi.inquiries(params ?? {})
      .then((res) => {
        setInquiries(res.data as InquiryItem[])
        setTotal(res.meta.total)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateInquiry(id, status)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('این درخواست حذف شود؟')) return
    await adminApi.deleteInquiry(id)
    load()
  }

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-line bg-white">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Link to={routes.adminPath} className="text-[13px] text-muted hover:text-navy">داشبورد</Link>
              <span className="text-muted/40">/</span>
              <h1 className="text-[18px] font-bold text-ink">پیام‌ها و بازدیدها</h1>
            </div>
            <Link to="/" className="text-[13px] text-muted hover:text-navy">سایت</Link>
          </div>
        </Container>
      </header>

      <Container className="py-8">
        <div className="mb-5 flex items-center gap-2">
          {['', 'new', 'contacted', 'closed'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-4 py-2 text-[13px] transition-colors ${filter === s ? 'bg-navy text-white' : 'border border-line text-muted hover:bg-mist'}`}
            >
              {s ? statusLabels[s] : 'همه'} {s === 'new' && total > 0 ? `(${toPersianDigits(total)})` : ''}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted">در حال بارگذاری…</div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-card border border-line bg-white py-16 text-muted">
            <Mail className="mb-3 h-10 w-10 text-muted/30" strokeWidth={1.5} />
            <p className="text-sm">پیامی یافت نشد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="rounded-card border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[15px] font-bold text-ink">{inq.name}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${kindColors[inq.kind] ?? ''}`}>
                        {kindLabels[inq.kind] ?? inq.kind}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${statusColors[inq.status] ?? ''}`}>
                        {statusLabels[inq.status] ?? inq.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted">
                      <span dir="ltr">{inq.phone}</span>
                      <span dir="ltr">{inq.email}</span>
                      {inq.property && <span>ملک: {inq.property.name}</span>}
                      {inq.preferred_date && <span>تاریخ بازدید: {formatDate(inq.preferred_date)}</span>}
                    </div>
                    {inq.message && (
                      <p className="mt-3 rounded-lg bg-mist px-4 py-3 text-[13px] leading-relaxed text-muted">{inq.message}</p>
                    )}
                    <p className="mt-2 text-[11px] text-muted/70">{formatDate(inq.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={inq.status}
                      onChange={(e) => updateStatus(inq.id, e.target.value)}
                      className="rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink"
                    >
                      <option value="new">جدید</option>
                      <option value="contacted">در حال پیگیری</option>
                      <option value="closed">بسته شد</option>
                    </select>
                    <button
                      onClick={() => handleDelete(inq.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}
