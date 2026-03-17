import useCartStore from '@/store/cart.store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

const DELIVERY_FEE = 49

export default function CartDrawer({ open, onClose }) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQty)

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-md p-0">
        <div className="px-5 pt-5 pb-3">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="size-5 text-primary" /> Your Cart
              {items.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <span className="text-6xl">🍕</span>
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add some delicious pizzas to get started!</p>
            <Button asChild onClick={onClose} className="mt-2">
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-3xl">
                    🍕
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-semibold">{item.pizza.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.size} · {item.crust} crust
                    </p>
                    {item.toppings?.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        +{item.toppings.map((t) => t.name).join(', ')}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        ₹{(item.unitPrice * item.quantity).toFixed(0)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.key, item.quantity - 1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.key, item.quantity + 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.key)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary + CTA */}
            <div className="border-t border-border px-5 pt-4 pb-5 space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span>₹{DELIVERY_FEE}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(0)}</span>
                </div>
              </div>
              <Button asChild className="w-full gap-2" onClick={onClose}>
                <Link to="/cart">
                  View Full Cart <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full gap-2" onClick={onClose}>
                <Link to="/checkout">
                  Checkout · ₹{total.toFixed(0)}
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
