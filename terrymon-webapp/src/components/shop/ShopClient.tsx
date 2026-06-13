"use client"

import type { Product } from "@/types"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ShopClientProps = {
  products: Product[]
}

export default function ShopClient({ products }: ShopClientProps) {
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold">商店</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          瀏覽寵物用品、食品與照護服務。
        </p>
      </section>

      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{product.name}</CardTitle>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{product.description}</p>
              <div className="flex items-center justify-between font-medium">
                <span>NT$ {product.price}</span>
                <span className="text-muted-foreground">庫存 {product.stock}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
