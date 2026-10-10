import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminRoutes } from '@/lib/adminRoutes'
import { adminApi, type ApiProperty } from '@/lib/api'
import { Container } from '@/components/ui/Container'
import { fieldClasses } from '@/components/ui/fieldClasses'
import { formatPrice, toPersianDigits } from '@/lib/format'

export default function AdminProperties() {
  const { user } = useAuth()
  const [routes] = useAdminRoutes()
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<ApiProperty | null>(null)
  const [showForm, setShowForm] = useState(false)

  const loadProperties = (p = 1) => {
    setLoading(true)
    adminApi.properties(p).then((res) => {
      setProperties(res.data)
      setTotal(res.meta.total)
      setPage(p)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadProperties() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('این ملک حذف شود؟')) return
    await adminApi.deleteProperty(id)
    loadProperties(page)
  }

  const totalPages = Math.ceil(total / 15)

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-line bg-white">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Link to={routes.adminPath} className="text-[13px] text-muted hover:text-navy">داشبورد</Link>
              <span className="text-muted/40">/</span>
              <h1 className="text-[18px] font-bold text-ink">مدیریت املاک</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="text-[13px] text-muted hover:text-navy">سایت</Link>
              <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-[13px] text-white hover:bg-navy-700">
                <Plus className="h-4 w-4" strokeWidth={1.8} />
                ملک جدید
              </button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-8">
        <div className="mb-4 flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام یا شهر…"
            className={`${fieldClasses} max-w-xs`}
          />
          <button onClick={() => loadProperties()} className="rounded-lg bg-mist px-4 py-2.5 text-sm text-muted hover:bg-line">جستجو</button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted">در حال بارگذاری…</div>
        ) : (
          <>
            <div className="overflow-hidden rounded-card border border-line bg-white">
              <table className="w-full text-right text-sm">
                <thead className="border-b bg-mist text-[12px] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">نام ملک</th>
                    <th className="px-4 py-3 font-medium">شهر</th>
                    <th className="px-4 py-3 font-medium">قیمت</th>
                    <th className="px-4 py-3 font-medium">نوع</th>
                    <th className="px-4 py-3 font-medium">وضعیت</th>
                    <th className="px-4 py-3 font-medium">ویژه</th>
                    <th className="px-4 py-3 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-mist/50">
                      <td className="px-4 py-3 font-medium text-ink">{prop.name}</td>
                      <td className="px-4 py-3 text-muted">{prop.city}، {prop.region}</td>
                      <td className="px-4 py-3 text-muted">{formatPrice(prop.price)}</td>
                      <td className="px-4 py-3 text-muted">{prop.type}</td>
                      <td className="px-4 py-3 text-muted">{prop.status}</td>
                      <td className="px-4 py-3">{prop.featured ? <span className="text-gold">★</span> : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditing(prop); setShowForm(true) }} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:bg-mist hover:text-navy">
                            <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </button>
                          <button onClick={() => handleDelete(prop.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => loadProperties(i + 1)}
                    className={`grid h-9 w-9 place-items-center rounded-lg text-sm ${page === i + 1 ? 'bg-navy text-white' : 'border border-line text-muted hover:bg-mist'}`}
                  >
                    {toPersianDigits(i + 1)}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Container>

      {showForm && (
        <PropertyForm
          property={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); loadProperties(page) }}
        />
      )}
    </div>
  )
}

function PropertyForm({ property, onClose, onSaved }: { property: ApiProperty | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: property?.name ?? '',
    city: property?.city ?? '',
    region: property?.region ?? '',
    country: property?.country ?? 'ایران',
    price: property?.price ?? 0,
    type: property?.type ?? 'ویلا',
    status: property?.status ?? 'برای فروش',
    beds: property?.beds ?? 0,
    baths: property?.baths ?? 0,
    area: property?.area ?? 0,
    land: property?.land ?? 0,
    year: property?.year ?? 1400,
    featured: property?.featured ?? false,
    summary: property?.summary ?? '',
    image_id: property?.imageId ?? 'photo-1600596542815-ffad4c1539a9',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (property) {
        await adminApi.updateProperty(property.id, form)
      } else {
        await adminApi.storeProperty(form)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره‌سازی')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = `${fieldClasses} text-sm`
  const label = 'mb-1.5 block text-[12px] font-medium text-muted'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/60 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-card bg-white p-7 shadow-lift">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[18px] font-bold text-ink">
            <Building2 className="h-5 w-5 text-gold" strokeWidth={1.8} />
            {property ? 'ویرایش ملک' : 'افزودن ملک جدید'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-navy">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>نام ملک</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className={label}>شهر</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className={label}>منطقه</label>
            <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className={label}>قیمت (تومان)</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} className={inputCls} dir="ltr" required />
          </div>
          <div>
            <label className={label}>نوع ملک</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
              {['ویلا', 'عمارت', 'خانه', 'پنت‌هاوس', 'اقامتگاه', 'ویلای ساحلی'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>وضعیت</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              {['برای فروش', 'لیستینگ جدید', 'اختصاصی', 'ویژه'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>اتاق خواب</label>
            <input type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: +e.target.value })} className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className={label}>سرویس بهداشتی</label>
            <input type="number" value={form.baths} onChange={(e) => setForm({ ...form, baths: +e.target.value })} className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className={label}>متراژ</label>
            <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: +e.target.value })} className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className={label}>زمین</label>
            <input type="number" value={form.land} onChange={(e) => setForm({ ...form, land: +e.target.value })} className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className={label}>سال ساخت</label>
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className={label}>شناسه تصویر (Unsplash)</label>
            <input value={form.image_id} onChange={(e) => setForm({ ...form, image_id: e.target.value })} className={inputCls} dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>خلاصه</label>
            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} className={`${inputCls} resize-none`} required />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-gold" />
              ملک ویژه
            </label>
          </div>

          {error && <p className="sm:col-span-2 rounded-lg bg-gold/10 px-4 py-2.5 text-sm text-gold-dark">{error}</p>}

          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-navy px-4 py-3 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-50">
              {saving ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-line px-6 py-3 text-sm text-muted hover:bg-mist">انصراف</button>
          </div>
        </form>
      </div>
    </div>
  )
}
