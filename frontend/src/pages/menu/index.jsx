import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Search, Star, ChevronRight, Home, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getAllPizzas, getCategories } from '@/services/pizza'

const TAG_COLORS = {
  bestseller: 'bg-amber-500 text-white',
  popular: 'bg-blue-500 text-white',
  spicy: 'bg-red-600 text-white',
  'chef-special': 'bg-purple-500 text-white',
  fusion: 'bg-emerald-500 text-white',
  premium: 'bg-yellow-600 text-white',
}

function PizzaCard({ pizza }) {
  return (
    <Link
      to={`/menu/${pizza.id || pizza._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Image area */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-linear-to-br from-primary/10 via-amber-500/5 to-background">
        {pizza.imageUrl ? (
          <img
            src={pizza.imageUrl}
            alt={pizza.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="text-8xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            🍕
          </span>
        )}
        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {pizza.tags?.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TAG_COLORS[tag] || 'bg-primary text-white'}`}
            >
              {tag.replace('-', ' ')}
            </span>
          ))}
        </div>
        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-xs font-semibold shadow backdrop-blur-sm">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {pizza.avgRating ?? pizza.rating ?? '—'}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-bold leading-tight">{pizza.name}</h3>
          <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-sm font-extrabold text-primary">
            ₹{pizza.price ?? pizza.basePrice}
          </span>
        </div>
        <p className="flex-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {pizza.description}
        </p>
        <div className="mt-4">
          <Button size="sm" className="w-full gap-2 shadow-sm">
            Customize &amp; Add
          </Button>
        </div>
      </div>
    </Link>
  )
}

function PizzaCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-48 animate-pulse bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-9 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}

const ALL_CATEGORY = { _id: 'all', name: 'All' }

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const {
    data: pizzasData,
    isLoading: pizzasLoading,
    isError: pizzasError,
  } = useQuery({
    queryKey: ['pizzas'],
    queryFn: () => getAllPizzas(),
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  const pizzas = useMemo(
    () => pizzasData?.data?.data ?? [],
    [pizzasData]
  )
  const categories = useMemo(
    () => [
      ALL_CATEGORY,
      ...(categoriesData?.data?.data ?? []),
    ],
    [categoriesData]
  )

  const filtered = useMemo(() => {
    return pizzas.filter((p) => {
      const matchCat =
        activeCategory === 'all' ||
        p.category === activeCategory ||
        p.category?._id === activeCategory
      const matchSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [pizzas, activeCategory, search])

  const isLoading = pizzasLoading || categoriesLoading

  return (
    <div className="min-h-screen">
      {/* Breadcrumb + Page Header */}
      <div className="border-b border-border bg-card/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="size-3.5" /> Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-foreground">Menu</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Our Menu 🍕
          </h1>
          <p className="mt-1 text-muted-foreground">
            Hand-crafted pizzas. Customize every bite.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Error banner */}
        {pizzasError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            Failed to load pizzas. Please try refreshing the page.
          </div>
        )}

        {/* Filters row */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
            {categoriesLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-muted"
                  />
                ))
              : categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                      activeCategory === cat._id
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pizzas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Skeleton grid */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <PizzaCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Pizza grid */}
        {!isLoading && (
          <>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <span className="text-6xl">😔</span>
                <p className="text-xl font-bold">No pizzas found</p>
                <p className="text-muted-foreground">
                  Try a different search or category.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setActiveCategory('all')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Showing {filtered.length} pizza
                  {filtered.length !== 1 ? 's' : ''}
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((pizza) => (
                    <PizzaCard key={pizza.id || pizza._id} pizza={pizza} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
