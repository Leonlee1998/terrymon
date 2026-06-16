import { chromium } from 'playwright'

const MOCK_MEMBER = {
  id: 'M001', name: '王小明', phone: '0912-345-678',
  email: 'demo@terrymon.com', handle: 'wangxm-demo',
  qrCode: 'TERRYMON-M001', memberSince: '2023-06-01',
  balance: 3500, points: 280, tier: 'silver',
  pets: [],
}
const AUTH_STATE = JSON.stringify({ state: { member: MOCK_MEMBER, isLoggedIn: true, _hydrated: true }, version: 0 })

const browser = await chromium.launch()
const ctx = await browser.newContext()
await ctx.addInitScript((auth) => {
  try { localStorage.setItem('terrymon-auth', auth) } catch (e) {}
}, AUTH_STATE)

const page = await ctx.newPage()
await page.setViewportSize({ width: 390, height: 844 })

// Vendor store page
await page.goto('http://localhost:3003/shop/vendor/V001', { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForTimeout(2500)
await page.screenshot({ path: 'public/demo_vendor_top.png' })
console.log('✓ vendor_top')

// Click 零食獎勵 tab
const tabs = await page.$$('button')
for (const tab of tabs) {
  const txt = await tab.textContent()
  if (txt && txt.trim() === '零食獎勵') { await tab.click(); break }
}
await page.waitForTimeout(600)
await page.screenshot({ path: 'public/demo_vendor_section.png' })
console.log('✓ vendor_section')

// Scroll down to see products
await page.evaluate(() => window.scrollTo(0, 300))
await page.waitForTimeout(500)
await page.screenshot({ path: 'public/demo_vendor_products.png' })
console.log('✓ vendor_products')

await browser.close()
console.log('done')
