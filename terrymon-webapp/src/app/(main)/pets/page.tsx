import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PetsPage() {
  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">我的寵物</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理寵物資料、健康紀錄與照護偏好。
          </p>
        </div>
        <Button size="sm">新增</Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>寵物清單</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          尚未新增寵物。
        </CardContent>
      </Card>
    </div>
  )
}
