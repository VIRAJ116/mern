import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, MapPin, CreditCard, Banknote, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { createOrder } from '@/services/order'
import useCartStore from '@/store/cart.store'

const DELIVERY_FEE = 49

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  street: z.string().min(5, 'Please enter your street address'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  landmark: z.string().optional(),
})

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when your order arrives' },
  { value: 'online', label: 'Online Payment', icon: CreditCard, description: 'UPI, Cards, Net Banking (coming soon)', disabled: true },
]

function InputField({ label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input {...props} className={error ? 'border-destructive' : ''} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const total = subtotal + DELIVERY_FEE

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(checkoutSchema) })

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: (payload) => createOrder(payload),
    onSuccess: (res) => {
      clearCart()
      navigate('/order-confirmation', { state: { orderId: res?.data?.orderId || 'ORD' + Date.now() } })
    },
    onError: () => toast.error('Failed to place order. Please try again.'),
  })

  const onSubmit = (data) => {
    if (items.length === 0) {
      toast.error('Your cart is empty!')
      return
    }
    placeOrder({
      items: items.map((i) => ({
        pizzaId: i.pizza._id,
        size: i.size,
        crust: i.crust,
        toppings: i.toppings.map((t) => t._id),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      deliveryAddress: data,
      paymentMethod,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total,
    })
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-6xl">🛒</span>
        <h2 className="text-2xl font-extrabold">Nothing to checkout</h2>
        <Button asChild>
          <Link to="/menu">Browse Menu</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/cart"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Cart
        </Link>
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left — Forms */}
            <div className="space-y-8 lg:col-span-2">
              {/* Delivery Address */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
                  <MapPin className="size-5 text-primary" /> Delivery Address
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Full Name"
                    placeholder="John Doe"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <InputField
                    label="Phone Number"
                    placeholder="9876543210"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <div className="sm:col-span-2">
                    <InputField
                      label="Street Address"
                      placeholder="123, Main Street, Apartment 4B"
                      error={errors.street?.message}
                      {...register('street')}
                    />
                  </div>
                  <InputField
                    label="City"
                    placeholder="Mumbai"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <InputField
                    label="Pincode"
                    placeholder="400001"
                    error={errors.pincode?.message}
                    {...register('pincode')}
                  />
                  <div className="sm:col-span-2">
                    <InputField
                      label="Landmark (optional)"
                      placeholder="Near XYZ Mall"
                      error={errors.landmark?.message}
                      {...register('landmark')}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
                  <CreditCard className="size-5 text-primary" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    const isSelected = paymentMethod === method.value
                    return (
                      <button
                        type="button"
                        key={method.value}
                        disabled={method.disabled}
                        onClick={() => !method.disabled && setPaymentMethod(method.value)}
                        className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/40 hover:bg-accent'
                        }`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-muted'}`}>
                          <Icon className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="size-5 shrink-0 text-primary" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right — Summary */}
            <div>
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-bold">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  {items.map((item) => (
                    <div key={item.key} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.pizza.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size} · {item.crust} × {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold">₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span><span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery</span><span>₹{DELIVERY_FEE}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-base border-t border-border pt-2">
                      <span>Total</span>
                      <span className="text-primary text-xl">₹{total}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full gap-2 shadow-lg shadow-primary/25"
                  disabled={isPending}
                >
                  {isPending ? (
                    <><Loader2 className="size-4 animate-spin" /> Placing Order...</>
                  ) : (
                    <>Place Order · ₹{total}</>
                  )}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  🔒 Your info is safe with us
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
