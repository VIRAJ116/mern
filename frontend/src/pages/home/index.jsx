import { Link } from 'react-router'
import { ArrowRight, Flame, Star, Clock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOCK_PIZZAS } from '@/const/mock-data'

const FEATURED = MOCK_PIZZAS.filter((p) => p.tags.includes('bestseller') || p.tags.includes('chef-special') || p.tags.includes('popular')).slice(0, 4)

const PIZZA_EMOJI_MAP = {
  '1': '🍅',
  '2': '🍗',
  '3': '🍖',
  '4': '🥦',
  '5': '🌶️',
  '6': '🧈',
}

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose Your Pizza', desc: 'Browse our curated menu of 50+ pizzas from classic to gourmet.' },
  { step: '02', title: 'Customize It', desc: 'Pick your size, crust type, and add your favorite toppings.' },
  { step: '03', title: 'We Prepare', desc: 'Our chefs hand-craft your pizza fresh with premium ingredients.' },
  { step: '04', title: 'Delivered Hot', desc: 'Fast delivery to your door in 30 minutes or it\'s on us.' },
]

const STATS = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '50+', label: 'Pizza Varieties' },
  { value: '30 min', label: 'Avg Delivery' },
  { value: '4.9★', label: 'Avg Rating' },
]

const PIZZA_VISUALS = ['1', '6', '3', '5'] // IDs for featured display

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 lg:py-32">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Flame className="size-4" /> Free delivery on first order!
              </div>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-foreground lg:text-6xl">
                Pizza Made{' '}
                <span className="relative inline-block text-primary">
                  Perfect
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 10 C 50 2, 150 2, 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
                ,
                <br />
                Every Time.
              </h1>
              <p className="max-w-md text-lg text-muted-foreground leading-relaxed">
                Artisan pizzas crafted with fresh ingredients, delivered hot to your doorstep in
                30 minutes. Customize every slice — your way.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" asChild className="h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25">
                  <Link to="/menu">
                    Order Now <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                  <Link to="/menu">View Menu</Link>
                </Button>
              </div>
              {/* Mini badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { icon: Clock, text: '30 min delivery' },
                  { icon: Star, text: '4.9/5 rating' },
                  { icon: ShieldCheck, text: 'Safe & hygienic' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon className="size-4 text-primary" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative h-80 w-80 sm:h-96 sm:w-96">
                {/* Rotating ring */}
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-dashed border-primary/20" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-8 animate-spin rounded-full border-2 border-dotted border-amber-400/30" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />

                {/* Center pizza */}
                <div className="absolute inset-12 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 shadow-2xl shadow-primary/20 backdrop-blur-sm">
                  <span className="text-[100px] drop-shadow-lg" style={{ filter: 'drop-shadow(0 8px 24px rgba(239,68,68,0.3))' }}>🍕</span>
                </div>

                {/* Floating ingredient badges */}
                {[
                  { emoji: '🍅', label: 'Fresh Tomatoes', pos: 'top-0 left-4' },
                  { emoji: '🧀', label: 'Mozzarella', pos: 'top-8 right-0' },
                  { emoji: '🌿', label: 'Fresh Basil', pos: 'bottom-12 right-0' },
                  { emoji: '🫒', label: 'Olive Oil', pos: 'bottom-0 left-8' },
                ].map(({ emoji, label, pos }) => (
                  <div
                    key={label}
                    className={`absolute ${pos} flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-lg border border-border text-xs font-medium`}
                  >
                    <span>{emoji}</span> {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-border md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="py-6 text-center">
                <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pizzas */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Our Specialties</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Fan Favourites 🔥
              </h2>
            </div>
            <Button variant="outline" asChild>
              <Link to="/menu" className="gap-2 hidden sm:flex">View All <ArrowRight className="size-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED.map((pizza, idx) => (
              <Link
                key={pizza._id}
                to={`/menu/${pizza._id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                {/* Image placeholder */}
                <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary/10 via-amber-500/5 to-background">
                  <span className="text-7xl transition-transform duration-300 group-hover:scale-110">🍕</span>
                  {pizza.tags[0] && (
                    <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wide">
                      {pizza.tags[0]}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-1 font-bold">{pizza.name}</h3>
                  <p className="flex-1 text-xs text-muted-foreground line-clamp-2">{pizza.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-primary">₹{pizza.basePrice}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {pizza.rating}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex justify-center sm:hidden">
            <Button asChild>
              <Link to="/menu">View Full Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Simple & Fast</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              From craving to doorstep in four easy steps. No fuss, just great pizza.
            </p>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connecting line (desktop) */}
            <div className="absolute top-12 left-[12.5%] right-[12.5%] hidden h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />

            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white text-xl font-extrabold shadow-lg shadow-primary/30">
                  {step.step}
                </div>
                <h3 className="mb-2 font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-primary py-16">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-6xl"
              style={{
                top: `${(i * 37) % 100}%`,
                left: `${(i * 29 + 10) % 100}%`,
                transform: `rotate(${i * 45}deg)`,
              }}
            >
              🍕
            </span>
          ))}
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready for the Perfect Slice?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Join 50,000+ pizza lovers who trust PieRush for their cravings. Customize, order, enjoy.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild className="h-12 px-8 text-base">
              <Link to="/menu">Order Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 border-white/30 px-8 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
