import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Pizza, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModeToggleSwitch } from '@/components/ui/mode-toggle-switch'
import { useMutation } from '@tanstack/react-query'
import { register as registerUser } from '@/services/user'
import { toast } from 'sonner'
import { useState } from 'react'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Enter a valid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

function InputField({ label, error, type = 'text', ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={isPassword && show ? 'text' : type}
          {...props}
          className={error ? 'border-destructive pr-10' : isPassword ? 'pr-10' : ''}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Account created! Please log in.')
      navigate('/login')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.')
    },
  })

  const onSubmit = ({ confirmPassword: _, ...data }) => mutate(data)

  return (
    <div className="relative flex min-h-svh w-full">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-orange-500 p-12 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="absolute text-5xl" style={{ top: `${(i * 37) % 100}%`, left: `${(i * 29 + 5) % 100}%`, transform: `rotate(${i * 30}deg)` }}>🍕</span>
          ))}
        </div>
        <div className="relative text-center space-y-6">
          <div className="flex justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm text-5xl">🍕</span>
          </div>
          <h1 className="text-4xl font-extrabold">Join PieRush</h1>
          <p className="text-white/80 text-lg max-w-sm">
            Create your account and start ordering the most delicious pizzas delivered to your door.
          </p>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            {['🎁 Free delivery on first order', '⭐ Earn loyalty points', '🔔 Real-time order tracking'].map((perk) => (
              <span key={perk}>{perk}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 px-6 py-12">
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
            <h2 className="mb-1 text-2xl font-extrabold">Create Account</h2>
            <p className="mb-6 text-sm text-muted-foreground">Join thousands of pizza lovers today</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
              />
              <InputField
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <InputField
                label="Phone Number"
                placeholder="9876543210"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <InputField
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button type="submit" className="mt-2 w-full gap-2 h-11" disabled={isPending}>
                {isPending ? <><Loader2 className="size-4 animate-spin" /> Creating account...</> : 'Create Account'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
