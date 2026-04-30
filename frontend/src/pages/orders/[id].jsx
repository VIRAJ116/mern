import { useParams, Link } from 'react-router'
import {
  ArrowLeft,
  MapPin,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '@/services/order'

const MOCK_ORDER = {
  _id: 'ORD001',
  createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  status: 'out-for-delivery',
  paymentMethod: 'Cash on Delivery',
  deliveryAddress: {
    name: 'Viraj Raiyani',
    phone: '9876543210',
    street: '42, Tech Park Road, B-Wing 304',
    city: 'Surat',
    pincode: '395004',
    landmark: 'Near City Mall',
  },
  items: [
    {
      id: '1',
      name: 'Margherita Classic',
      size: 'large',
      crust: 'classic',
      toppings: ['Extra Cheese'],
      quantity: 2,
      unitPrice: 404,
    },
    {
      id: '2',
      name: 'BBQ Chicken Fiesta',
      size: 'medium',
      crust: 'thin',
      toppings: [],
      quantity: 1,
      unitPrice: 449,
    },
  ],
  subtotal: 1257,
  deliveryFee: 49,
  total: 1306,
}

const STATUS_STEPS = [
  {
    key: 'placed',
    label: 'Order Placed',
    desc: 'Your order has been received',
    icon: Package,
  },
  {
    key: 'preparing',
    label: 'Preparing',
    desc: 'Our chefs are making your pizza',
    icon: Clock,
  },
  {
    key: 'out-for-delivery',
    label: 'Out for Delivery',
    desc: 'Your order is on the way!',
    icon: Truck,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    desc: 'Enjoy your meal!',
    icon: CheckCircle2,
  },
]

const STATUS_ORDER = ['placed', 'preparing', 'out-for-delivery', 'delivered']

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => getOrderById(id) })
  
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  const order = data?.data?.data || null
  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4 text-center px-4">
        <XCircle className="size-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Button asChild variant="outline">
          <Link to="/orders">Go back to orders</Link>
        </Button>
      </div>
    )
  }

  const currentStepIdx = STATUS_ORDER.indexOf(order.status)

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/orders"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Orders
        </Link>

        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Order ID
            </p>
            <h1 className="font-mono text-2xl font-extrabold">#{order._id}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Truck className="size-4" /> Out for Delivery
          </span>
        </div>

        {/* Status Tracker */}
        {order.status !== 'cancelled' && (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 font-bold">Order Status</h2>
            <div className="relative">
              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx <= currentStepIdx
                const isCurrent = idx === currentStepIdx
                const Icon = step.icon
                return (
                  <div
                    key={step.key}
                    className="relative flex gap-4 pb-8 last:pb-0"
                  >
                    {/* Connector line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 h-full -translate-x-1/2 ${idx < currentStepIdx ? 'bg-primary' : 'bg-border'}`}
                      />
                    )}
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isDone
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-card text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="pt-1.5">
                      <p
                        className={`font-semibold ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        {step.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cancelled state */}
        {order.status === 'cancelled' && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
            <XCircle className="size-6 text-destructive shrink-0" />
            <div>
              <p className="font-semibold text-destructive">Order Cancelled</p>
              <p className="text-sm text-muted-foreground">
                This order was cancelled.
              </p>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-bold">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  🍕
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size} · {item.crust} crust
                    {item.toppings?.length > 0
                      ? ` · +${item.toppings.join(', ')}`
                      : ''}{' '}
                    × {item.quantity}
                  </p>
                </div>
                <p className="font-bold shrink-0">
                  ₹{item.unitPrice * item.quantity}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-extrabold text-base pt-1 border-t border-border">
              <span>Total</span>
              <span className="text-primary">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <MapPin className="size-4 text-primary" /> Delivery Address
          </h2>
          <p className="font-semibold">{order.deliveryAddress.name}</p>
          <p className="text-sm text-muted-foreground">
            {order.deliveryAddress.street}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.deliveryAddress.city} – {order.deliveryAddress.pincode}
          </p>
          {order.deliveryAddress.landmark && (
            <p className="text-sm text-muted-foreground">
              {order.deliveryAddress.landmark}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            📞 {order.deliveryAddress.phone}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Payment:</span>{' '}
            {order.paymentMethod}
          </div>
        </div>
      </div>
    </div>
  )
}
