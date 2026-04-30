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

export interface OrderSummaryItem {
  name: string
  qty: number
}

export interface OrderSummary {
  _id: string
  createdAt: string
  status: string
  total: number
  items: OrderSummaryItem[]
}

export interface GetOrdersResponse {
  success: boolean
  data?: OrderSummary[]
  error?: string
}

export interface OrderDetailItem {
  id: string
  name: string
  size: string
  crust: string
  toppings: string[]
  quantity: number
  unitPrice: number
}

export interface OrderDetail {
  _id: string
  createdAt: string
  status: string
  paymentMethod: string
  deliveryAddress: DeliveryAddress | any
  items: OrderDetailItem[]
  subtotal: number
  deliveryFee: number
  total: number
}

export interface GetOrderByIdResponse {
  success: boolean
  data?: OrderDetail
  error?: string
}
