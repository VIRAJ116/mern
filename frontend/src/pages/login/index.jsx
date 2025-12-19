import { ModeToggleSwitch } from '@/components/mode-toggle-switch'
import { LoginForm } from '@/pages/login/components/login-form'

function Login() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <ModeToggleSwitch />
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}

export default Login
