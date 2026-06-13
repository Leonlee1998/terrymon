import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>TerryMon 登入</CardTitle>
          <CardDescription>使用會員帳號進入寵物照護服務。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              密碼
            </label>
            <Input id="password" type="password" placeholder="請輸入密碼" />
          </div>
          <Button className="w-full" asChild>
            <Link href="/">登入</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
