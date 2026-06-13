import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <Badge variant="secondary">TerryMon</Badge>
        <h1 className="text-2xl font-semibold">今天的寵物照護總覽</h1>
        <p className="text-sm text-muted-foreground">
          查看預約、寵物狀態與最新服務資訊。
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>下一筆預約</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          目前沒有即將到來的預約。
        </CardContent>
      </Card>
    </div>
  )
}
