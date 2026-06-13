import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AppointmentsPage() {
  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">預約</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            查看與安排美容、住宿、接送等服務。
          </p>
        </div>
        <Button size="sm">預約</Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>近期預約</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          尚無預約紀錄。
        </CardContent>
      </Card>
    </div>
  )
}
