import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ratePizza } from '@/services/order'
import './RateOrderSection.css'

const LABELS = ['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😄', 'Excellent! 🤩']

// ── Star picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="star-picker" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function RateOrderSection({ order }) {
  // Deduplicate items by pizzaId (same pizza ordered twice → one rating)
  const uniqueItems = order.items.reduce((acc, item) => {
    if (item.pizzaId && !acc.find((i) => i.pizzaId === item.pizzaId)) {
      acc.push(item)
    }
    return acc
  }, [])

  const [ratings, setRatings] = useState(() =>
    Object.fromEntries(uniqueItems.map((item) => [item.pizzaId, 0]))
  )
  const [submitted, setSubmitted] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const toRate = uniqueItems.filter((item) => ratings[item.pizzaId] > 0)
      if (toRate.length === 0) throw new Error('Rate at least one pizza')
      await Promise.all(
        toRate.map((item) => ratePizza(item.pizzaId, ratings[item.pizzaId]))
      )
    },
    onSuccess: () => {
      setSubmitted(true)
      toast.success('Thanks for your feedback! 🎉')
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to submit. Please try again.')
    },
  })

  const hasAnyRating = Object.values(ratings).some((r) => r > 0)

  // ── Success state ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="ros-success">
        <span className="ros-success-icon">🎉</span>
        <div>
          <p className="ros-success-title">Thanks for your feedback!</p>
          <p className="ros-success-sub">
            Your ratings help us serve better pizzas next time.
          </p>
        </div>
      </div>
    )
  }

  // ── Rating UI ──────────────────────────────────────────────────
  return (
    <div className="ros-wrapper">
      {/* Header */}
      <div className="ros-header">
        <span className="ros-header-icon">⭐</span>
        <div>
          <p className="ros-header-title">Rate Your Order</p>
          <p className="ros-header-sub">How was your food? Tap the stars!</p>
        </div>
      </div>

      {/* Pizza list */}
      <div className="ros-items">
        {uniqueItems.map((item) => {
          const val = ratings[item.pizzaId]
          return (
            <div key={item.pizzaId} className="ros-item">
              <div className="ros-item-emoji">🍕</div>
              <div className="ros-item-info">
                <p className="ros-item-name">{item.name}</p>
                <StarPicker
                  value={val}
                  onChange={(v) =>
                    setRatings((prev) => ({ ...prev, [item.pizzaId]: v }))
                  }
                />
              </div>
              {val > 0 && (
                <span className="ros-item-label">{LABELS[val]}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Submit */}
      <div className="ros-footer">
        <button
          id="submit-ratings-btn"
          className="ros-submit-btn"
          disabled={!hasAnyRating || isPending}
          onClick={() => mutate()}
        >
          {isPending ? 'Submitting…' : 'Submit Ratings'}
        </button>
      </div>
    </div>
  )
}
