export type ProductStatus = 'active' | 'inactive' | 'sold_out' | 'review'
export type OrderStatus   = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunding'
export type PromoType     = 'discount' | 'coupon' | 'bundle'

export interface Vendor {
  id: string; name: string; email: string; phone: string
  storeName: string; storeDescription: string; logoUrl: string
  bankAccount: string; taxId: string; status: 'pending' | 'approved' | 'suspended'
  joinedAt: string; totalProducts: number; totalSales: number
}

export interface Product {
  id: string; vendorId: string; name: string
  category: string; subcategory?: string
  price: number; originalPrice?: number; cost: number
  stock: number; imageUrl: string; images: string[]
  description: string; specs: Record<string, string>; tags: string[]
  status: ProductStatus; createdAt: string; updatedAt: string
  totalSold: number; rating: number; reviewCount: number
}

export interface Order {
  id: string; memberId: string; memberName: string; memberPhone: string
  items: OrderItem[]; status: OrderStatus
  totalPrice: number; shippingFee: number; vendorRevenue: number
  address: string; createdAt: string; paidAt?: string
  shippedAt?: string; trackingNumber?: string
  note?: string
}

export interface OrderItem {
  productId: string; productName: string; price: number; qty: number; imageUrl: string
}

export interface Promotion {
  id: string; vendorId: string; name: string; type: PromoType
  discountValue: number; discountType: 'percent' | 'fixed'
  minOrderAmount?: number; maxDiscount?: number
  startDate: string; endDate: string; usageLimit: number; usedCount: number
  isActive: boolean; applicableProductIds: string[]
}

export interface SalesReport {
  date: string; revenue: number; orders: number; units: number
}
