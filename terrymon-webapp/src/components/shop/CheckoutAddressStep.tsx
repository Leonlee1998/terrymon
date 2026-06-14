'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export const addressSchema = z.object({
  recipientName: z.string().min(2, '請填寫收件人姓名'),
  phone:         z.string().min(10, '請填寫正確手機號碼'),
  address:       z.string().min(10, '請填寫完整地址'),
  notes:         z.string().optional(),
})
export type AddressValues = z.infer<typeof addressSchema>

interface Props { onNext: (data: AddressValues) => void }

export default function CheckoutAddressStep({ onNext }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { recipientName: '', phone: '', address: '', notes: '' },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-ink mb-1 block">收件人姓名</label>
        <Input {...register('recipientName')} placeholder="王小明" />
        {errors.recipientName && <p className="text-xs text-error mt-1">{errors.recipientName.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-ink mb-1 block">手機號碼</label>
        <Input {...register('phone')} placeholder="0912-345-678" type="tel" />
        {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-ink mb-1 block">收件地址</label>
        <Textarea {...register('address')} placeholder="台北市大安區忠孝東路四段100號" rows={3} />
        {errors.address && <p className="text-xs text-error mt-1">{errors.address.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-ink mb-1 block">備注（選填）</label>
        <Input {...register('notes')} placeholder="如：請放門口" />
      </div>
      <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary-hover text-white">
        下一步：確認訂單
      </Button>
    </form>
  )
}
