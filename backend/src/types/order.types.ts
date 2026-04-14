export interface OrderItemRequest {
  pizzaId: string
  size: string
  crust: string
  quantity: number
  toppings: string[] // Array of topping IDs
  unitPrice: number
}

export interface DeliveryAddress {
  name: string
  phone: string
  street: string
  city: string
  pincode: string
  landmark?: string
}

export interface CreateOrderRequest {
  userId: string
  items: OrderItemRequest[]
  deliveryAddress: DeliveryAddress | string
  paymentMethod: 'cod' | 'online'
  subtotal: number
  deliveryFee: number
  total: number
}

export interface RazorpayVerificationRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
