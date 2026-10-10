import { Lock, RotateCcw, Save, Settings as SettingsIcon, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminRoutes } from '@/lib/adminRoutes'
import { Container } from '@/components/ui/Container'
import { fieldClasses } from '@/components/ui/fieldClasses'

export default function AdminSettings() {
  const [routes, update, reset] = useAdminRoutes()
  const navigate = useNavigate()
  const [loginPath, setLoginPath] = useState(routes.loginPath)
  const [adminPath, setAdminPath] = useState(routes.adminPath)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const next = update({ loginPath, adminPath })
    setSaved(true)
    // If the admin path changed, navigate to the new settings page
    if (next.adminPath !== routes.adminPath) {
      setTimeout(() => navigate(`${next.adminPath}/settings`), 150)
    }
  }

  const handleReset = () => {
    reset()
    setLoginPath('/secret-login')
    setAdminPath('/admin')
    setSaved(true)
    if (routes.adminPath !== '/admin') {
      setTimeout(() => navigate('/admin/settings'), 150)
    }
  }

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-line bg-white">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Link to={routes.adminPath} className="text-[13px] text-muted hover:text-navy">داشبورد</Link>
              <span className="text-muted/40">/</span>
              <h1 className="text-[18px] font-bold text-ink">تنظیمات</h1>
            </div>
            <Link to="/" className="text-[13px] text-muted hover:text-navy">سایت</Link>
          </div>
        </Container>
      </header>

      <Container className="py-8">
        <div className="max-w-2xl rounded-card border border-line bg-white p-7">
          <div className="mb-6 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-gold" strokeWidth={1.8} />
            <h2 className="text-[16px] font-bold text-ink">تنظیمات آدرس پنل مدیریت</h2>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-lg bg-gold/5 border border-gold/20 px-4 py-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" strokeWidth={1.8} />
            <p className="text-[12px] leading-relaxed text-gold-dark">
              پس از تغییر آدرس‌ها، آدرس قبلی دیگر کار نخواهد کرد. آدرس جدید را یادداشت یا بوک‌مارک کنید تا دسترسی خود را از دست ندهید.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label htmlFor="loginPath" className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-muted">
                <Lock className="h-3.5 w-3.5" strokeWidth={1.8} />
                آدرس صفحه ورود
              </label>
              <input
                id="loginPath"
                type="text"
                value={loginPath}
                onChange={(e) => { setLoginPath(e.target.value); setSaved(false) }}
                className={fieldClasses}
                dir="ltr"
                placeholder="/secret-login"
                required
              />
              <p className="mt-1.5 text-[11px] text-muted">پیش‌فرض: /secret-login — آدرسی که از طریق آن وارد پنل مدیریت می‌شوید.</p>
            </div>

            <div>
              <label htmlFor="adminPath" className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-muted">
                <SettingsIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                آدرس پنل مدیریت
              </label>
              <input
                id="adminPath"
                type="text"
                value={adminPath}
                onChange={(e) => { setAdminPath(e.target.value); setSaved(false) }}
                className={fieldClasses}
                dir="ltr"
                placeholder="/admin"
                required
              />
              <p className="mt-1.5 text-[11px] text-muted">پیش‌فرض: /admin — آدرس پایه داشبورد و زیرصفحات مدیریت.</p>
            </div>

            <div className="rounded-lg bg-mist px-4 py-3 text-[12px] text-muted">
              <p>آدرس ورود فعلی: <span dir="ltr" className="font-mono text-navy">{routes.loginPath}</span></p>
              <p className="mt-1">آدرس پنل فعلی: <span dir="ltr" className="font-mono text-navy">{routes.adminPath}</span></p>
            </div>

            {saved && (
              <p className="rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">تغییرات با موفقیت ذخیره شد.</p>
            )}

            <div className="flex gap-3 pt-1">
              <button type="submit" className="flex items-center gap-2 rounded-lg bg-navy px-5 py-3 text-sm font-medium text-white hover:bg-navy-700">
                <Save className="h-4 w-4" strokeWidth={1.8} />
                ذخیره تغییرات
              </button>
              <button type="button" onClick={handleReset} className="flex items-center gap-2 rounded-lg border border-line px-5 py-3 text-sm text-muted hover:bg-mist">
                <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                بازگردانی به پیش‌فرض
              </button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  )
}
