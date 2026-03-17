import { useAuth } from '@/context/auth-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { User, Mail, Phone, Save, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid mobile number').optional().or(z.literal('')),
})

function InputField({ label, error, icon: Icon, ...props }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {label}
      </Label>
      <Input {...props} className={error ? 'border-destructive' : ''} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  const onSubmit = () => {
    // Replace with: mutate(formData) via updateProfile API when backend is ready
    toast.success('Profile updated successfully!')
  }

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight">My Profile</h1>

        <div className="space-y-6">
          {/* Avatar section */}
          <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-500 text-3xl font-extrabold text-white shadow-lg shadow-primary/30">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xl font-bold">{user?.name || 'Your Name'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="mt-1 inline-block rounded-full bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                ✓ Verified
              </span>
            </div>
          </div>

          {/* Edit Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-5 font-bold">Personal Information</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                label="Full Name"
                icon={User}
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
              />
              <InputField
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <InputField
                label="Phone Number"
                icon={Phone}
                placeholder="9876543210"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <div className="pt-2">
                <Button type="submit" className="gap-2" disabled={!isDirty}>
                  <Save className="size-4" /> Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Security section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 font-bold">
              <Shield className="size-4 text-primary" /> Security
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed: Never</p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Orders', value: '12' },
              { label: 'Favourite Pizza', value: 'Margherita' },
              { label: 'Member Since', value: '2024' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
                <p className="text-lg font-extrabold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
