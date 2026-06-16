import { chromium } from 'playwright'

const MOCK_VENDOR = {
  id: 'V001', name: '王小明', email: 'vendor@example.com', phone: '0912-111-222',
  storeName: '汪喵鮮食', storeDescription: '提供最天然的寵物鮮食，台灣製造嚴格把關',
  logoUrl: '', bankAccount: '012-****-123456', taxId: '12345678',
  status: 'approved', joinedAt: '2024-06-01', totalProducts: 3, totalSales: 128400,
}

const MOCK_PRODUCTS = [
  {
    id: 'PR001', vendorId: 'V001', name: '主食鮮食罐－雞肉口味 185g',
    petSpecies: 'all', category: '食品', subcategory: '主食罐', storeSection: '鮮食主食',
    price: 89, originalPrice: 99, cost: 45, stock: 120,
    imageUrl: 'https://placehold.co/300x300/FFF6E8/F28C00?text=Food',
    images: [], description: '嚴選台灣溯源雞肉，無防腐劑',
    specs: { 重量: '185g' }, tags: ['無防腐劑', '台灣製'],
    status: 'active', createdAt: '2024-06-10', updatedAt: '2026-06-01',
    totalSold: 234, rating: 4.8, reviewCount: 89,
  },
  {
    id: 'PR006', vendorId: 'V001', name: '凍乾生骨肉零食 雞柳 100g',
    petSpecies: 'all', category: '食品', subcategory: '零食', storeSection: '零食獎勵',
    price: 260, cost: 120, stock: 200,
    imageUrl: 'https://placehold.co/300x300/FFF6E8/F28C00?text=Snack',
    images: [], description: '低溫凍乾鎖住營養，單一蛋白',
    specs: { 重量: '100g' }, tags: ['凍乾'],
    status: 'active', createdAt: '2024-07-15', updatedAt: '2026-05-20',
    totalSold: 567, rating: 4.8, reviewCount: 201,
  },
  {
    id: 'PR007', vendorId: 'V001', name: '益生菌粉 30包',
    petSpecies: 'all', category: '保健', subcategory: '腸胃', storeSection: '腸胃保健',
    price: 420, cost: 180, stock: 0,
    imageUrl: 'https://placehold.co/300x300/FFF6E8/F28C00?text=Health',
    images: [], description: '多菌種改善腸道菌叢',
    specs: { 份量: '30包' }, tags: ['腸胃保健'],
    status: 'sold_out', createdAt: '2024-08-01', updatedAt: '2026-06-10',
    totalSold: 198, rating: 4.4, reviewCount: 67,
  },
]

const VENDOR_STATE = JSON.stringify({
  state: { isLoggedIn: true, _hydrated: true, vendor: MOCK_VENDOR, products: MOCK_PRODUCTS, promotions: [] },
  version: 0,
})

const browser = await chromium.launch()
const ctx = await browser.newContext()
await ctx.addInitScript((state) => {
  try { localStorage.setItem('terrymon-vendor', state) } catch (e) {}
}, VENDOR_STATE)

const page = await ctx.newPage()
await page.setViewportSize({ width: 1280, height: 900 })

// Products list
await page.goto('http://localhost:3004/products', { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForTimeout(2500)
await page.screenshot({ path: 'public/demo_admin_products.png' })
console.log('✓ admin_products - URL:', page.url())

// New product form
await page.goto('http://localhost:3004/products/new', { waitUntil: 'networkidle', timeout: 15000 })
await page.waitForTimeout(2000)
await page.screenshot({ path: 'public/demo_admin_new_top.png' })
// Scroll to storeSection field
await page.evaluate(() => window.scrollTo(0, 400))
await page.waitForTimeout(400)
await page.screenshot({ path: 'public/demo_admin_new_section.png' })
console.log('✓ admin_new')

await browser.close()
console.log('done')
