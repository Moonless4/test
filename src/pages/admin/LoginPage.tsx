import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { fieldClasses } from '@/components/ui/fieldClasses'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ورود به سیستم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <Container className="max-w-md">
        <div className="rounded-card bg-white p-8 shadow-lift sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-navy/5">
              <LogIn className="h-6 w-6 text-navy" strokeWidth={1.8} />
            </div>
            <h1 className="text-[22px] font-bold text-ink">ورود به پنل مدیریت</h1>
            <p className="mt-2 text-sm text-muted">برای دسترسی به داشبورد وارد شوید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-muted">
                ایمیل
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClasses}
                placeholder="admin@ofogh.ir"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-muted">
                رمز عبور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClasses}
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>

            {error && <p role="alert" className="rounded-lg bg-gold/10 px-4 py-2.5 text-sm text-gold-dark">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'در حال ورود…' : 'ورود'}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-mist px-4 py-3 text-center text-[12px] text-muted">
            <p>دسترسی آزمایشی:</p>
            <p dir="ltr" className="mt-1 font-mono">admin@ofogh.ir / admin123456</p>
          </div>
        </div>
      </Container>
    </div>
  )
}
