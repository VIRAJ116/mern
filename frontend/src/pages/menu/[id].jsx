import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { SIZE_OPTIONS, CRUST_OPTIONS } from '@/const/mock-data'
import { getPizzaById, getToppings } from '@/services/pizza'
import useCartStore from '@/store/cart.store'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function PizzaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)

  const [selectedSize, setSelectedSize] = useState('medium')
  const [selectedCrust, setSelectedCrust] = useState('classic')
  const [selectedToppings, setSelectedToppings] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Fetch pizza by ID from real API
  const {
    data: pizzaData,
    isLoading: pizzaLoading,
    isError: pizzaError,
  } = useQuery({
    queryKey: ['pizza', id],
    queryFn: () => getPizzaById(id),
    enabled: !!id,
  })

  // Fetch toppings from real API
  const { data: toppingsData, isLoading: toppingsLoading } = useQuery({
    queryKey: ['toppings'],
    queryFn: () => getToppings(),
  })

  // Normalize API response (backend returns { id, price, avgRating, ratingCount })
  const pizza = useMemo(() => {
    const raw = pizzaData?.data?.data
    if (!raw) return null
    return {
      ...raw,
      _id: raw.id,
      basePrice: raw.price,
      rating: raw.avgRating,
      totalRatings: raw.ratingCount,
      tags: raw.tags ?? [],
    }
  }, [pizzaData])

  const toppingsList = useMemo(() => {
    return (toppingsData?.data?.data ?? []).map((t) => ({
      ...t,
      _id: t.id,
    }))
  }, [toppingsData])

  const unitPrice = useMemo(() => {
    if (!pizza) return 0
    const sizeMultiplier =
      SIZE_OPTIONS.find((s) => s.value === selectedSize)?.multiplier || 1
    const crustExtra =
      CRUST_OPTIONS.find((c) => c.value === selectedCrust)?.extraPrice || 0
    const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0)
    return (
      Math.round(pizza.basePrice * sizeMultiplier) + crustExtra + toppingsTotal
    )
  }, [pizza, selectedSize, selectedCrust, selectedToppings])

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) =>
      prev.find((t) => t._id === topping._id)
        ? prev.filter((t) => t._id !== topping._id)
        : [...prev, topping]
    )
  }

  const handleAddToCart = () => {
    if (!pizza) return
    addItem({
      pizza,
      size: selectedSize,
      crust: selectedCrust,
      toppings: selectedToppings,
      quantity,
      unitPrice,
    })
    setAdded(true)
    toast.success(`${pizza.name} added to cart!`, {
      description: `${selectedSize} · ${selectedCrust} crust · ₹${unitPrice * quantity}`,
    })
    setTimeout(() => setAdded(false), 2000)
  }

  // Loading state
  if (pizzaLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading pizza...</p>
      </div>
    )
  }

  // Error state
  if (pizzaError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <p>Failed to load pizza. Please try again.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/menu')}>
          Back to Menu
        </Button>
      </div>
    )
  }

  // Not found
  if (!pizza) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <span className="text-6xl">🤔</span>
        <p className="text-xl font-bold">Pizza not found</p>
        <Button onClick={() => navigate('/menu')}>Back to Menu</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Menu
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left — Pizza Preview */}
          <div className="space-y-6">
            {/* Hero image */}
            <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-3xl bg-linear-to-br from-primary/15 via-amber-500/10 to-background sm:h-96">
              {/* Decorative rings */}
              <div
                className="absolute h-64 w-64 animate-spin rounded-full border-2 border-dashed border-primary/15 sm:h-80 sm:w-80"
                style={{ animationDuration: '25s' }}
              />
              <div
                className="absolute h-44 w-44 animate-spin rounded-full border border-dotted border-amber-400/20 sm:h-56 sm:w-56"
                style={{
                  animationDuration: '18s',
                  animationDirection: 'reverse',
                }}
              />
              {pizza.imageUrl ? (
                <img
                  src={pizza.imageUrl}
                  alt={pizza.name}
                  className="relative z-10 h-full w-full object-cover rounded-3xl"
                />
              ) : (
                <span className="relative z-10 text-[120px] sm:text-[150px] drop-shadow-xl">
                  🍕
                </span>
              )}
              {pizza.tags[0] && (
                <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                  {pizza.tags[0].replace('-', ' ')}
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="mb-2 flex items-start justify-between gap-4">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {pizza.name}
                </h1>
                <div className="flex items-center gap-1 shrink-0 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {Number(pizza.rating).toFixed(1)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({Number(pizza.totalRatings).toLocaleString()})
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {pizza.description}
              </p>
            </div>

            {/* Price summary card */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total Price
                  </p>
                  <p className="text-3xl font-extrabold text-primary">
                    ₹{unitPrice * quantity}
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>
                    {SIZE_OPTIONS.find((s) => s.value === selectedSize)?.label}{' '}
                    ({SIZE_OPTIONS.find((s) => s.value === selectedSize)?.size})
                  </p>
                  <p>
                    {
                      CRUST_OPTIONS.find((c) => c.value === selectedCrust)
                        ?.label
                    }
                  </p>
                  {selectedToppings.length > 0 && (
                    <p>
                      +{selectedToppings.length} topping
                      {selectedToppings.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Customizer */}
          <div className="space-y-8">
            {/* Size */}
            <div>
              <h2 className="mb-3 text-base font-bold uppercase tracking-wider text-foreground/70">
                Size
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {SIZE_OPTIONS.map((size) => {
                  const price = Math.round(pizza.basePrice * size.multiplier)
                  const isSelected = selectedSize === size.value
                  return (
                    <button
                      key={size.value}
                      onClick={() => setSelectedSize(size.value)}
                      className={cn(
                        'relative flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center transition-all',
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-accent'
                      )}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="size-3 text-white" />
                        </span>
                      )}
                      <span className="text-2xl font-black text-foreground">
                        {size.size}
                      </span>
                      <span className="text-sm font-semibold">
                        {size.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ₹{price}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Crust */}
            <div>
              <h2 className="mb-3 text-base font-bold uppercase tracking-wider text-foreground/70">
                Crust
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {CRUST_OPTIONS.map((crust) => {
                  const isSelected = selectedCrust === crust.value
                  return (
                    <button
                      key={crust.value}
                      onClick={() => setSelectedCrust(crust.value)}
                      className={cn(
                        'relative flex flex-col items-start gap-0.5 rounded-2xl border-2 p-3.5 text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-accent'
                      )}
                    >
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="size-3 text-white" />
                        </span>
                      )}
                      <span className="font-semibold pr-6">{crust.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {crust.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Toppings */}
            <div>
              <h2 className="mb-3 text-base font-bold uppercase tracking-wider text-foreground/70">
                Extra Toppings{' '}
                <span className="text-xs font-normal normal-case tracking-normal text-muted-foreground">
                  (optional)
                </span>
              </h2>
              {toppingsLoading ? (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-11 animate-pulse rounded-xl bg-muted"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {toppingsList.map((topping) => {
                    const isSelected = selectedToppings.some(
                      (t) => t._id === topping._id
                    )
                    return (
                      <button
                        key={topping._id}
                        onClick={() => toggleTopping(topping)}
                        className={cn(
                          'flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-all',
                          isSelected
                            ? 'border-primary bg-primary/10 font-semibold text-primary'
                            : 'border-border bg-card hover:border-primary/40 hover:bg-accent'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span>{topping.icon}</span>
                          {topping.name}
                        </span>
                        <span
                          className={cn(
                            'text-xs',
                            isSelected
                              ? 'text-primary font-bold'
                              : 'text-muted-foreground'
                          )}
                        >
                          +₹{topping.price}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quantity + Add */}
            <div className="space-y-3 pt-2">
              {/* Qty stepper */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-muted-foreground">
                  Quantity
                </span>
                <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-accent"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-lg font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-accent"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <Button
                size="lg"
                className={cn(
                  'w-full gap-2 h-14 text-base font-bold transition-all',
                  added
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'shadow-lg shadow-primary/30'
                )}
                onClick={handleAddToCart}
              >
                {added ? (
                  <>
                    <Check className="size-5" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-5" /> Add to Cart · ₹
                    {unitPrice * quantity}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
