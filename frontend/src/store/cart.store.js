import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()
        // item: { pizza, size, crust, toppings, quantity, unitPrice }
        const key = `${item.pizza._id}-${item.size}-${item.crust}-${(item.toppings || []).map((t) => t._id).sort().join(',')}`
        const existing = items.find((i) => i.key === key)
        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, key }] })
        }
      },

      removeItem: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) })
      },

      updateQty: (key, quantity) => {
        if (quantity < 1) return
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })
      },

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
      },
    }),
    {
      name: 'pizza-cart',
    }
  )
)

export default useCartStore
