export type ProductPetSpecies = 'all' | 'dog' | 'cat' | 'small_pet' | 'bird' | 'fish'

export type ProductCategoryKey =
  | 'all'
  | 'food'
  | 'wet_food'
  | 'snack'
  | 'care'
  | 'cleaning'
  | 'toy'
  | 'accessory'
  | 'litter'
  | 'scratch'
  | 'housing'
  | 'hay'
  | 'bedding'
  | 'perch'
  | 'aquarium'

export const PET_SPECIES_OPTIONS: { value: ProductPetSpecies; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'dog', label: '狗狗' },
  { value: 'cat', label: '貓咪' },
  { value: 'small_pet', label: '小寵' },
  { value: 'bird', label: '鳥類' },
  { value: 'fish', label: '水族' },
]

export const CATEGORY_OPTIONS: Record<ProductPetSpecies, { value: ProductCategoryKey; label: string }[]> = {
  all: [
    { value: 'all', label: '全部分類' },
    { value: 'food', label: '主食' },
    { value: 'wet_food', label: '濕食/罐頭' },
    { value: 'snack', label: '零食' },
    { value: 'care', label: '保健' },
    { value: 'cleaning', label: '清潔護理' },
    { value: 'toy', label: '玩具' },
    { value: 'accessory', label: '用品/外出' },
  ],
  dog: [
    { value: 'all', label: '全部狗狗' },
    { value: 'food', label: '飼料' },
    { value: 'wet_food', label: '濕食/罐頭' },
    { value: 'snack', label: '零食' },
    { value: 'care', label: '保健' },
    { value: 'cleaning', label: '清潔護理' },
    { value: 'toy', label: '玩具' },
    { value: 'accessory', label: '牽繩/外出' },
  ],
  cat: [
    { value: 'all', label: '全部貓咪' },
    { value: 'food', label: '飼料' },
    { value: 'wet_food', label: '主食罐/副食罐' },
    { value: 'snack', label: '零食' },
    { value: 'litter', label: '貓砂/砂盆' },
    { value: 'care', label: '保健' },
    { value: 'toy', label: '玩具' },
    { value: 'scratch', label: '貓抓板/貓跳台' },
    { value: 'accessory', label: '用品/外出' },
  ],
  small_pet: [
    { value: 'all', label: '全部小寵' },
    { value: 'food', label: '飼料' },
    { value: 'hay', label: '牧草' },
    { value: 'snack', label: '零食' },
    { value: 'housing', label: '籠具' },
    { value: 'bedding', label: '墊材' },
    { value: 'toy', label: '玩具' },
  ],
  bird: [
    { value: 'all', label: '全部鳥類' },
    { value: 'food', label: '鳥飼料' },
    { value: 'snack', label: '點心' },
    { value: 'housing', label: '籠具' },
    { value: 'perch', label: '棲木/玩具' },
    { value: 'care', label: '保健' },
  ],
  fish: [
    { value: 'all', label: '全部水族' },
    { value: 'food', label: '飼料' },
    { value: 'aquarium', label: '魚缸/造景' },
    { value: 'accessory', label: '器材' },
    { value: 'cleaning', label: '清潔維護' },
  ],
}

export function categoryLabel(category: string) {
  return Object.values(CATEGORY_OPTIONS).flat().find(option => option.value === category)?.label ?? category
}

export function speciesLabel(species: string) {
  return PET_SPECIES_OPTIONS.find(option => option.value === species)?.label ?? species
}
