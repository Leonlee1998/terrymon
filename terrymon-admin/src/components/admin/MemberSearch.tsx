import { Input } from '@/components/ui/input'

interface Props {
  initial: string
  sp: Record<string, string | undefined>
}

export default function MemberSearch({ initial, sp }: Props) {
  return (
    <form method="GET" className="mb-4 flex max-w-md gap-2">
      {sp.sort  && <input type="hidden" name="sort"  value={sp.sort} />}
      {sp.order && <input type="hidden" name="order" value={sp.order} />}
      <Input name="q" defaultValue={initial} placeholder="搜尋姓名 / 電話 / Email" />
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 whitespace-nowrap"
      >
        搜尋
      </button>
    </form>
  )
}
