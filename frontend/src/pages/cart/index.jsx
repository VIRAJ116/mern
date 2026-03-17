import { Link } from 'react-router'
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ArrowLeft, Home, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useCartStore from '@/store/cart.store'

const DELIVERY_FEE = 49

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQty)
  const clearCart = useCartStore((s) => s.clearCart)

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0)

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <span className="text-8xl">🛒</span>
        <h2 className="text-2xl font-extrabold">Your cart is empty</h2>
        <p className="text-muted-foreground">Looks like you haven't added any pizzas yet.</p>
        <Button asChild size="lg" className="gap-2 mt-2">
          <Link to="/menu">
            <ShoppingBag className="size-4" /> Browse Menu
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="size-3.5" /> Home
          </Link>
          <ChevronRight className="size-3.5" />
          <Link to="/menu" className="hover:text-foreground transition-colors">Menu</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">Cart</span>
        </nav>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Your Cart</h1>
            <p className="text-muted-foreground">{items.reduce((s, i) => s + i.quantity, 0)} item(s)</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={clearCart}
          >
            <Trash2 className="size-4 mr-1.5" /> Clear Cart
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-4xl">
                  🍕
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold leading-tight">{item.pizza.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.size.charAt(0).toUpperCase() + item.size.slice(1)} · {item.crust.charAt(0).toUpperCase() + item.crust.slice(1)} Crust
                      </p>
                      {item.toppings?.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          +{item.toppings.map((t) => t.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1">
                      <button
                        onClick={() => updateQty(item.key, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-accent"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.key, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-accent"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <span className="text-base font-extrabold text-primary">
                      ₹{(item.unitPrice * item.quantity).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" asChild className="w-full gap-2">
              <Link to="/menu">
                <ArrowLeft className="size-4" /> Add More Items
              </Link>
            </Button>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold">Order Summary</h2>
              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.key} className="flex justify-between text-muted-foreground">
                    <span className="truncate pr-2">
                      {item.pizza.name} ×{item.quantity}
                    </span>
                    <span>₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="my-2 border-t border-border" />
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span>₹{DELIVERY_FEE}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between font-extrabold text-base">
                    <span>Total</span>
                    <span className="text-primary text-xl">₹{total.toFixed(0)}</span>
                  </div>
                </div>
              </div>
              <Button asChild size="lg" className="mt-6 w-full gap-2 shadow-lg shadow-primary/25">
                <Link to="/checkout">
                  Proceed to Checkout <ArrowRight className="size-4" />
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                🔒 Secure checkout · Free cancellation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
