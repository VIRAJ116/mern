import { Link } from 'react-router'
import { LoginForm } from '@/pages/login/components/login-form'
import { ModeToggleSwitch } from '@/components/ui/mode-toggle-switch'
import { ArrowLeft, Pizza } from 'lucide-react'

function Login() {
  return (
    <div className="relative flex min-h-svh w-full">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-orange-500 p-12 text-white">
        {/* Background pizza pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          {[12, 20, 35, 50, 65, 75, 15, 80, 45, 30, 85, 55].map((top, i) => (
            <span
              key={i}
              className="absolute text-5xl"
              style={{
                top: `${top}%`,
                left: `${[8, 70, 25, 85, 10, 55, 40, 90, 60, 15, 75, 35][i]}%`,
                transform: `rotate(${i * 30}deg)`,
              }}
            >
              🍕
            </span>
          ))}
        </div>

        <div className="relative z-10 text-center space-y-6">
          <div className="flex justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm text-5xl shadow-xl">
              🍕
            </span>
          </div>
          <h1 className="text-4xl font-extrabold">Welcome Back!</h1>
          <p className="text-white/80 text-lg max-w-sm leading-relaxed">
            Sign in to access your orders, track deliveries, and continue where you left off.
          </p>
          <div className="flex flex-col gap-3 text-sm text-white/70 mt-4">
            {[
              '🛵 Real-time order tracking',
              '❤️ Save your favourite pizzas',
              '🎁 Exclusive member offers',
            ].map((perk) => (
              <span key={perk} className="flex items-center justify-center">{perk}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 px-6 py-12 relative">
        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Home
          </Link>
          <ModeToggleSwitch />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Pizza className="size-5" />
            </span>
            <span className="text-2xl font-extrabold">
              Pie<span className="text-primary">Rush</span>
            </span>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5">
            <h2 className="mb-1 text-2xl font-extrabold">Sign in</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
