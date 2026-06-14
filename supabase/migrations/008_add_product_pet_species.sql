-- migration: 008_add_product_pet_species
-- created: 2026-06-14
-- description: Add pet species targeting for shop product filters.

alter table products
  add column if not exists pet_species text not null default 'all'
  check (pet_species in ('all', 'dog', 'cat', 'small_pet', 'bird', 'fish'));

create index if not exists products_pet_species_idx on products(pet_species);

update products
set pet_species = case
  when category in ('cat_food', 'cat_litter', 'cat_toy', 'litter', 'scratch')
    or name ilike '%貓%'
    or array_to_string(tags, ' ') ilike '%貓%' then 'cat'
  when category in ('dog_food', 'dog_toy')
    or name ilike '%狗%'
    or name ilike '%犬%'
    or subcategory ilike '%dog%'
    or array_to_string(tags, ' ') ilike '%狗%'
    or array_to_string(tags, ' ') ilike '%犬%' then 'dog'
  when category in ('small_pet_food', 'hay', 'bedding', 'housing')
    or name ilike '%兔%'
    or name ilike '%鼠%' then 'small_pet'
  when category in ('bird_food', 'perch')
    or name ilike '%鳥%' then 'bird'
  when category in ('fish_food', 'aquarium') then 'fish'
  else 'all'
end
where pet_species = 'all';
