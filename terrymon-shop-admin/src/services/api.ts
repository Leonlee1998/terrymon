/* eslint-disable @typescript-eslint/no-explicit-any */
import { MOCK_VENDOR, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_PROMOTIONS, MOCK_SALES_REPORT } from '@/lib/mock'
import { configuredVendorId, getSupabase } from '@/lib/supabase'
import type { Vendor, Product, Order, Promotion, SalesReport } from '@/types'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

async function fallback<T>(fn: () => Promise<T>, mock: T | (() => T)): Promise<T> {
  const supabase = getSupabase()
  if (!supabase) {
    await delay()
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
  try {
    return await fn()
  } catch (error) {
    console.warn('[shop-admin:supabase:fallback]', error)
    await delay()
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
}

async function getVendorId() {
  if (configuredVendorId) return configuredVendorId
  const { data, error } = await getSupabase()!.from('vendors').select('id').limit(1).single()
  if (error) throw error
  return data.id as string
}

function mapVendor(row: any, products: Product[] = []): Vendor {
  return {
    id: row.id,
    name: row.owner_name,
    email: row.email,
    phone: row.phone ?? '',
    storeName: row.store_name,
    storeDescription: row.description ?? '',
    logoUrl: row.logo_url ?? '',
    bankAccount: row.bank_account ?? '',
    taxId: row.tax_id ?? '',
    status: row.status,
    joinedAt: row.created_at,
    totalProducts: products.length,
    totalSales: products.reduce((sum, p) => sum + p.totalSold, 0),
  }
}

function mapProduct(row: any): Product {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    cost: row.cost ?? 0,
    stock: row.stock,
    imageUrl: row.image_url ?? '',
    images: row.images ?? [],
    description: row.description ?? '',
    specs: row.specs ?? {},
    tags: row.tags ?? [],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalSold: row.total_sold ?? 0,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
  }
}

function mapOrderItem(row: any) {
  return {
    productId: row.product_id,
    productName: row.product_name,
    price: row.price,
    qty: row.qty,
    imageUrl: row.image_url ?? '',
  }
}

function mapOrder(row: any, vendorId: string): Order {
  const items = (row.order_items ?? []).filter((item: any) => item.vendor_id === vendorId).map(mapOrderItem)
  const vendorRevenue = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0)
  return {
    id: row.id,
    memberId: row.member_id,
    memberName: row.members?.name ?? '',
    memberPhone: row.members?.phone ?? '',
    items,
    status: row.status,
    totalPrice: row.total_price,
    shippingFee: row.shipping_fee ?? 0,
    vendorRevenue,
    address: row.address,
    createdAt: row.created_at,
    shippedAt: row.shipped_at ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    note: row.note ?? undefined,
  }
}

function mapPromotion(row: any): Promotion {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    type: row.type,
    discountValue: row.discount_value,
    discountType: row.discount_type,
    minOrderAmount: row.min_order_amount ?? undefined,
    maxDiscount: row.max_discount ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    usageLimit: row.usage_limit ?? 0,
    usedCount: row.used_count ?? 0,
    isActive: row.is_active ?? true,
    applicableProductIds: row.applicable_product_ids ?? [],
  }
}

export const vendorApi = {
  login: async () => {
    const products = await vendorApi.getProducts()
    return vendorApi.getVendor(products)
  },
  getVendor: async (products?: Product[]): Promise<Vendor> => fallback(
    async () => {
      const vendorId = await getVendorId()
      const { data, error } = await getSupabase()!.from('vendors').select('*').eq('id', vendorId).single()
      if (error) throw error
      return mapVendor(data, products ?? [])
    },
    MOCK_VENDOR,
  ),
  getProducts: async (): Promise<Product[]> => fallback(
    async () => {
      const vendorId = await getVendorId()
      const { data, error } = await getSupabase()!
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapProduct)
    },
    MOCK_PRODUCTS,
  ),
  getOrders: async (): Promise<Order[]> => fallback(
    async () => {
      const vendorId = await getVendorId()
      const { data, error } = await getSupabase()!
        .from('orders')
        .select('*, members(name,phone), order_items(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
        .map((order: any) => mapOrder(order, vendorId))
        .filter((order: Order) => order.items.length > 0)
    },
    MOCK_ORDERS,
  ),
  getPromotions: async (): Promise<Promotion[]> => fallback(
    async () => {
      const vendorId = await getVendorId()
      const { data, error } = await getSupabase()!.from('promotions').select('*').eq('vendor_id', vendorId)
      if (error) throw error
      return data.map(mapPromotion)
    },
    MOCK_PROMOTIONS,
  ),
  getSalesReport: async (): Promise<SalesReport[]> => fallback(async () => MOCK_SALES_REPORT, MOCK_SALES_REPORT),
  updateOrderStatus: async (id: string, status: Order['status'], trackingNumber?: string) => fallback(
    async () => {
      const { error } = await getSupabase()!.from('orders').update({
        status,
        tracking_number: trackingNumber,
        shipped_at: status === 'shipped' ? new Date().toISOString() : undefined,
      }).eq('id', id)
      if (error) throw error
      return { success: true }
    },
    { success: true },
  ),
}
