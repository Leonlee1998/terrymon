import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MemberPage() {
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold">會員</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          管理個人資料、通知設定與會員權益。
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>帳號狀態</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>尚未登入會員帳號。</p>
          <Button asChild>
            <Link href="/login">前往登入</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
