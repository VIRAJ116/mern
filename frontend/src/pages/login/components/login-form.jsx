import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/schema/login-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login } from '@/services/auth'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function LoginForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin@123',
    },
  })

  const { mutate } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success('Welcome back! 🍕')
      queryClient.invalidateQueries({ queryKey: ['me'] })
      // navigate('/')
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Invalid email or password')
    },
  })

  const onSubmit = (data) => mutate(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && (
            <FieldDescription className="text-destructive">
              {errors.email.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <FieldDescription className="text-destructive">
              {errors.password.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button
            type="submit"
            className="w-full h-11 gap-2 shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-primary hover:underline font-semibold"
            >
              Create one free
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
