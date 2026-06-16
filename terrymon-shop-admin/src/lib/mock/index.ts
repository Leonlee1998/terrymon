import type { Vendor, Product, Order, Promotion, SalesReport } from '@/types'

export const MOCK_VENDOR: Vendor = {
  id: 'V001', name: '王小明', email: 'vendor@example.com', phone: '0912-111-222',
  storeName: '汪喵鮮食', storeDescription: '提供最天然的寵物鮮食，台灣製造嚴格把關',
  logoUrl: 'https://placehold.co/100x100/FFF6E8/F28C00?text=汪喵',
  bankAccount: '012-****-123456', taxId: '12345678',
  status: 'approved', joinedAt: '2024-06-01',
  totalProducts: 6, totalSales: 128400,
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'PR001', vendorId: 'V001', name: '主食鮮食罐－雞肉口味 185g',
    category: '食品', subcategory: '主食罐', storeSection: '鮮食主食',
    price: 89, originalPrice: 99, cost: 45, stock: 120,
    imageUrl: 'https://placehold.co/300x300/FFF6E8/F28C00?text=🥩',
    images: [], description: '嚴選台灣溯源雞肉，無防腐劑',
    specs: { 重量: '185g', 適用: '全齡貓狗' }, tags: ['無防腐劑', '台灣製'],
    status: 'active', createdAt: '2024-06-10', updatedAt: '2026-06-01',
    totalSold: 234, rating: 4.8, reviewCount: 89,
  },
  {
    id: 'PR006', vendorId: 'V001', name: '凍乾生骨肉零食 雞柳 100g',
    category: '食品', subcategory: '零食', storeSection: '零食獎勵',
    price: 260, cost: 120, stock: 200,
    imageUrl: 'https://placehold.co/300x300/FFF6E8/F28C00?text=🦴',
    images: [], description: '低溫凍乾鎖住營養，單一蛋白',
    specs: { 重量: '100g', 成分: '100%雞柳' }, tags: ['凍乾', '單一蛋白'],
    status: 'active', createdAt: '2024-07-15', updatedAt: '2026-05-20',
    totalSold: 567, rating: 4.8, reviewCount: 201,
  },
  {
    id: 'PR007', vendorId: 'V001', name: '益生菌粉 30包',
    category: '保健', subcategory: '腸胃', storeSection: '腸胃保健',
    price: 420, cost: 180, stock: 0,
    imageUrl: 'https://placehold.co/300x300/FFF6E8/F28C00?text=🌿',
    images: [], description: '多菌種改善腸道菌叢',
    specs: { 份量: '30包' }, tags: ['腸胃保健'],
    status: 'sold_out', createdAt: '2024-08-01', updatedAt: '2026-06-10',
    totalSold: 198, rating: 4.4, reviewCount: 67,
  },
]

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD001', memberId: 'M001', memberName: '林小華', memberPhone: '0912-345-678',
    items: [{ productId: 'PR001', productName: '主食鮮食罐－雞肉', price: 89, qty: 6,
      imageUrl: 'https://placehold.co/100x100/FFF6E8/F28C00?text=🥩' }],
    status: 'delivered', totalPrice: 534, shippingFee: 0, vendorRevenue: 480,
    address: '台中市西區精誠路 100 號', createdAt: '2026-06-01T14:00:00',
    paidAt: '2026-06-01T14:05:00', shippedAt: '2026-06-02T10:00:00',
    trackingNumber: 'TW123456789',
  },
  {
    id: 'ORD002', memberId: 'M002', memberName: '張大明', memberPhone: '0923-456-789',
    items: [{ productId: 'PR006', productName: '凍乾生骨肉零食', price: 260, qty: 2,
      imageUrl: 'https://placehold.co/100x100/FFF6E8/F28C00?text=🦴' }],
    status: 'shipped', totalPrice: 520, shippingFee: 0, vendorRevenue: 468,
    address: '台北市大安區忠孝東路四段 123 號',
    createdAt: '2026-06-10T09:00:00', paidAt: '2026-06-10T09:10:00',
    shippedAt: '2026-06-11T14:00:00', trackingNumber: 'TW987654321',
  },
  {
    id: 'ORD003', memberId: 'M003', memberName: '陳美玲', memberPhone: '0934-567-890',
    items: [{ productId: 'PR001', productName: '主食鮮食罐－雞肉', price: 89, qty: 12,
      imageUrl: 'https://placehold.co/100x100/FFF6E8/F28C00?text=🥩' }],
    status: 'paid', totalPrice: 1068, shippingFee: 0, vendorRevenue: 961,
    address: '高雄市苓雅區中正一路 88 號',
    createdAt: '2026-06-12T16:00:00', paidAt: '2026-06-12T16:05:00',
  },
]

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'PROMO001', vendorId: 'V001', name: '618 購物節',
    type: 'discount', discountValue: 10, discountType: 'percent',
    minOrderAmount: 500, maxDiscount: 200,
    startDate: '2026-06-15', endDate: '2026-06-30',
    usageLimit: 100, usedCount: 23, isActive: true,
    applicableProductIds: ['PR001', 'PR006'],
  },
]

export const MOCK_SALES_REPORT: SalesReport[] = [
  { date: '6/1', revenue: 4200, orders: 8, units: 24 },
  { date: '6/2', revenue: 6800, orders: 13, units: 38 },
  { date: '6/3', revenue: 3200, orders: 6, units: 18 },
  { date: '6/4', revenue: 8900, orders: 17, units: 52 },
  { date: '6/5', revenue: 5600, orders: 11, units: 32 },
  { date: '6/6', revenue: 4100, orders: 8, units: 24 },
  { date: '6/7', revenue: 7300, orders: 14, units: 43 },
]
