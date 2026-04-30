import { Link } from 'react-router'
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useQuery } from '@tanstack/react-query'
import { getMyOrders } from '@/services/order'

// Mock orders for UI development — remove when API is ready
const MOCK_ORDERS = [
  {
    _id: 'ORD001',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    total: 897,
    items: [{ name: 'Margherita Classic', qty: 2 }, { name: 'Garden Veggie', qty: 1 }],
  },
  {
    _id: 'ORD002',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'out-for-delivery',
    total: 1099,
    items: [{ name: 'BBQ Chicken Fiesta', qty: 1 }, { name: 'Butter Chicken Pizza', qty: 1 }],
  },
  {
    _id: 'ORD003',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'preparing',
    total: 449,
    items: [{ name: 'Pepperoni Supreme', qty: 1 }],
  },
  {
    _id: 'ORD004',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'cancelled',
    total: 329,
    items: [{ name: 'Spicy Arrabbiata', qty: 1 }],
  },
]

const STATUS_CONFIG = {
  placed: { label: 'Order Placed', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  preparing: { label: 'Preparing', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  'out-for-delivery': { label: 'Out for Delivery', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.placed
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      <Icon className="size-3.5" />
      {cfg.label}
    </span>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: getMyOrders })
  const orders = data?.data?.data || []

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight">My Orders</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <span className="text-7xl">📦</span>
            <p className="text-xl font-bold">No orders yet</p>
            <p className="text-muted-foreground">Your order history will appear here.</p>
            <Button asChild className="mt-2">
              <Link to="/menu">Order Your First Pizza</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  🍕
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold font-mono">#{order._id}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    <p className="font-extrabold text-primary">₹{order.total}</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
