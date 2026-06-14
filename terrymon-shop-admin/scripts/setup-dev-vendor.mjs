import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const EMAIL = 'vendor@terrymon.com'
const PASSWORD = 'vendor1234'
const VENDOR_ID = '33333333-3333-3333-3333-333333333333'

async function main() {
  // 先檢查 auth user 是否已存在
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === EMAIL)

  let uid
  if (found) {
    uid = found.id
    console.log('auth user already exists:', uid)
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    })
    if (error) { console.error('create user failed:', error.message); process.exit(1) }
    uid = data.user.id
    console.log('auth user created:', uid)
  }

  const { error: vErr } = await supabase
    .from('vendors')
    .update({ supabase_uid: uid })
    .eq('id', VENDOR_ID)
  if (vErr) { console.error('update vendor failed:', vErr.message); process.exit(1) }

  console.log('Done. Login credentials:')
  console.log('  Email:', EMAIL)
  console.log('  Password:', PASSWORD)
}

main()
