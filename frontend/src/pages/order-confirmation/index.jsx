import { Link, useLocation } from 'react-router'
import { CheckCircle, Home, ClipboardList, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const orderId = location.state?.orderId

  // Show confirmation page normally even if accessed without state

  const estimatedTime = 28

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Animated success ring */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" style={{ animationDuration: '2s' }} />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
          <CheckCircle className="size-12 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
        Order Placed! 🎉
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Your delicious pizza is being crafted with love. Get ready for an amazing meal!
      </p>

      {/* Order ID */}
      <div className="mt-8 rounded-2xl border border-border bg-card px-8 py-5 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Order ID</p>
        <p className="mt-1 font-mono text-xl font-bold text-primary">{orderId}</p>
      </div>

      {/* ETA */}
      <div className="mt-4 flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/30 px-5 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
        <Clock className="size-4" />
        Estimated delivery: <span className="text-amber-900 dark:text-amber-300">{estimatedTime}–{estimatedTime + 5} minutes</span>
      </div>

      {/* Status tracker */}
      <div className="mt-10 w-full max-w-md">
        <div className="relative flex items-center justify-between">
          {/* Progress bar */}
          <div className="absolute left-0 right-0 h-1 bg-muted top-5 mx-10">
            <div className="h-full w-1/4 rounded-full bg-primary transition-all" />
          </div>

          {[
            { label: 'Order Placed', emoji: '✅', active: true },
            { label: 'Preparing', emoji: '👨‍🍳', active: false },
            { label: 'Out for Delivery', emoji: '🛵', active: false },
            { label: 'Delivered', emoji: '🎉', active: false },
          ].map((step) => (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all ${
                step.active ? 'border-primary bg-primary/10' : 'border-border bg-card'
              }`}>
                {step.emoji}
              </div>
              <p className={`text-xs font-medium ${step.active ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="gap-2">
          <Link to="/orders">
            <ClipboardList className="size-4" /> Track Orders
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link to="/">
            <Home className="size-4" /> Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
