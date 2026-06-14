-- Shared cat/dog breed dictionary for webapp, grooming, and vet systems.
-- Taiwan does not maintain a public "allowed dog/cat breed whitelist"; use
-- legal_status_tw to mark restricted/prohibited exceptions while keeping a
-- complete selectable breed dictionary.

create table if not exists breed_master (
  id                 text primary key,
  species            text not null check (species in ('dog', 'cat')),
  canonical_name_zh  text not null,
  canonical_name_en  text not null,
  aliases            text[] not null default '{}',
  registry_sources   text[] not null default '{}',
  breed_group        text,
  size               text check (size in ('toy', 'small', 'medium', 'large', 'giant', 'unknown')),
  coat_type          text[] not null default '{}',
  grooming_tags      text[] not null default '{}',
  vet_risk_tags      text[] not null default '{}',
  legal_status_tw    text not null default 'allowed'
                     check (legal_status_tw in ('allowed', 'restricted', 'prohibited', 'legacy_only', 'unknown')),
  legal_note         text,
  source_urls        text[] not null default '{}',
  sort_order         integer not null default 999,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now_utc(),
  updated_at         timestamptz not null default now_utc()
);

create index if not exists breed_master_species_idx on breed_master(species);
create index if not exists breed_master_active_idx on breed_master(is_active);
create index if not exists breed_master_legal_status_tw_idx on breed_master(legal_status_tw);

create table if not exists breed_aliases (
  id              uuid primary key default gen_random_uuid(),
  breed_id        text not null references breed_master(id) on delete cascade,
  locale          text not null default 'zh-TW',
  name            text not null,
  normalized_name text not null,
  created_at      timestamptz not null default now_utc(),
  unique (breed_id, locale, normalized_name)
);

create index if not exists breed_aliases_breed_id_idx on breed_aliases(breed_id);
create index if not exists breed_aliases_normalized_name_idx on breed_aliases(normalized_name);

alter table pets add column if not exists breed_id text references breed_master(id);
create index if not exists pets_breed_id_idx on pets(breed_id);

alter table breed_master enable row level security;
alter table breed_aliases enable row level security;

drop policy if exists "breed_master_select_active" on breed_master;
create policy "breed_master_select_active" on breed_master
  for select using (is_active = true);

drop policy if exists "breed_master_service_all" on breed_master;
create policy "breed_master_service_all" on breed_master
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "breed_aliases_select_active_breed" on breed_aliases;
create policy "breed_aliases_select_active_breed" on breed_aliases
  for select using (
    exists (
      select 1 from breed_master b
      where b.id = breed_aliases.breed_id
        and b.is_active = true
    )
  );

drop policy if exists "breed_aliases_service_all" on breed_aliases;
create policy "breed_aliases_service_all" on breed_aliases
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into breed_master
  (id, species, canonical_name_zh, canonical_name_en, aliases, registry_sources, breed_group, size, coat_type, grooming_tags, vet_risk_tags, legal_status_tw, legal_note, source_urls, sort_order)
values
  ('dog-mixed', 'dog', '米克斯犬', 'Mixed Breed Dog', array['混種犬','米克斯','MIX'], array['custom'], 'Mixed', 'unknown', array['varies'], array['依實際毛型評估'], array[]::text[], 'allowed', null, array['https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=M0060027'], 1),
  ('dog-unknown', 'dog', '未知犬種', 'Unknown Dog Breed', array['未知','其他犬種'], array['custom'], 'Unknown', 'unknown', array['varies'], array['需現場評估'], array[]::text[], 'allowed', null, array[]::text[], 2),
  ('cat-mixed', 'cat', '米克斯貓', 'Domestic Mixed Cat', array['混種貓','家貓','Domestic Shorthair','Domestic Longhair','MIX'], array['custom'], 'Mixed', 'unknown', array['varies'], array['依實際毛型評估'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 1),
  ('cat-unknown', 'cat', '未知貓種', 'Unknown Cat Breed', array['未知','其他貓種'], array['custom'], 'Unknown', 'unknown', array['varies'], array['需現場評估'], array[]::text[], 'allowed', null, array[]::text[], 2),

  ('dog-shiba-inu', 'dog', '柴犬', 'Shiba Inu', array['Shiba','日本柴犬'], array['AKC','FCI'], 'Spitz and Primitive', 'small', array['double','short'], array['換毛期大量掉毛','雙層毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/','https://www.fci.be/en/Nomenclature/'], 20),
  ('dog-poodle-toy', 'dog', '玩具貴賓犬', 'Poodle (Toy)', array['Toy Poodle','貴賓','貴婦犬'], array['AKC','FCI'], 'Companion and Toy', 'toy', array['curly'], array['需定期修剪','易打結'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 21),
  ('dog-poodle-miniature', 'dog', '迷你貴賓犬', 'Poodle (Miniature)', array['Miniature Poodle','貴賓','貴婦犬'], array['AKC','FCI'], 'Companion and Toy', 'small', array['curly'], array['需定期修剪','易打結'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 22),
  ('dog-poodle-standard', 'dog', '標準貴賓犬', 'Poodle (Standard)', array['Standard Poodle','貴賓','貴婦犬'], array['AKC','FCI'], 'Companion and Toy', 'large', array['curly'], array['需定期修剪','易打結'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 23),
  ('dog-maltese', 'dog', '馬爾濟斯', 'Maltese', array['Maltese Dog'], array['AKC','FCI'], 'Companion and Toy', 'toy', array['long','silky'], array['易打結','需眼周清潔'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 24),
  ('dog-pomeranian', 'dog', '博美犬', 'Pomeranian', array['Pom'], array['AKC','FCI'], 'Spitz and Primitive', 'toy', array['double','long'], array['雙層毛','換毛期大量掉毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 25),
  ('dog-chihuahua', 'dog', '吉娃娃', 'Chihuahua', array[]::text[], array['AKC','FCI'], 'Companion and Toy', 'toy', array['short','long'], array['小型犬需輕柔操作'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 26),
  ('dog-yorkshire-terrier', 'dog', '約克夏', 'Yorkshire Terrier', array['Yorkie','約克夏㹴'], array['AKC','FCI'], 'Terrier', 'toy', array['long','silky'], array['易打結','需定期修剪'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 27),
  ('dog-corgi-pembroke', 'dog', '威爾斯柯基犬', 'Pembroke Welsh Corgi', array['柯基','Pembroke Welsh Corgi'], array['AKC','FCI'], 'Herding', 'medium', array['double','medium'], array['雙層毛','換毛期大量掉毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 28),
  ('dog-corgi-cardigan', 'dog', '卡迪根威爾斯柯基犬', 'Cardigan Welsh Corgi', array['卡迪根柯基','柯基'], array['AKC','FCI'], 'Herding', 'medium', array['double','medium'], array['雙層毛','換毛期大量掉毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 29),
  ('dog-french-bulldog', 'dog', '法國鬥牛犬', 'French Bulldog', array['法鬥','Frenchie'], array['AKC','FCI'], 'Companion and Toy', 'small', array['short'], array['皺褶清潔','短鼻犬注意散熱'], array['短吻呼吸道'], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 30),
  ('dog-bulldog', 'dog', '英國鬥牛犬', 'Bulldog', array['English Bulldog'], array['AKC','FCI'], 'Companion and Toy', 'medium', array['short'], array['皺褶清潔','短鼻犬注意散熱'], array['短吻呼吸道','皮膚皺褶'], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 31),
  ('dog-pug', 'dog', '巴哥犬', 'Pug', array['Pug Dog'], array['AKC','FCI'], 'Companion and Toy', 'small', array['short'], array['皺褶清潔','短鼻犬注意散熱'], array['短吻呼吸道','眼睛'], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 32),
  ('dog-golden-retriever', 'dog', '黃金獵犬', 'Golden Retriever', array['金毛','Golden'], array['AKC','FCI'], 'Retriever', 'large', array['double','medium','long'], array['雙層毛','換毛期大量掉毛'], array['髖關節'], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 33),
  ('dog-labrador-retriever', 'dog', '拉布拉多', 'Labrador Retriever', array['拉不拉多','Lab'], array['AKC','FCI'], 'Retriever', 'large', array['double','short'], array['換毛期大量掉毛'], array['髖關節'], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 34),
  ('dog-border-collie', 'dog', '邊境牧羊犬', 'Border Collie', array['邊牧'], array['AKC','FCI'], 'Herding', 'medium', array['double','medium'], array['雙層毛','需梳理'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 35),
  ('dog-german-shepherd', 'dog', '德國牧羊犬', 'German Shepherd Dog', array['德牧'], array['AKC','FCI'], 'Herding', 'large', array['double','medium'], array['雙層毛','換毛期大量掉毛'], array['髖關節'], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 36),
  ('dog-siberian-husky', 'dog', '西伯利亞哈士奇', 'Siberian Husky', array['哈士奇'], array['AKC','FCI'], 'Spitz and Primitive', 'large', array['double','medium'], array['雙層毛','換毛期大量掉毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 37),
  ('dog-samoyed', 'dog', '薩摩耶犬', 'Samoyed', array['Samoyed Dog'], array['AKC','FCI'], 'Spitz and Primitive', 'large', array['double','long'], array['雙層毛','換毛期大量掉毛','需吹乾底毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 38),
  ('dog-shih-tzu', 'dog', '西施犬', 'Shih Tzu', array[]::text[], array['AKC','FCI'], 'Companion and Toy', 'small', array['long'], array['易打結','需眼周清潔'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 39),
  ('dog-bichon-frise', 'dog', '比熊犬', 'Bichon Frise', array['比熊'], array['AKC','FCI'], 'Companion and Toy', 'small', array['curly'], array['需定期修剪','易打結'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 40),
  ('dog-miniature-schnauzer', 'dog', '迷你雪納瑞', 'Miniature Schnauzer', array['雪納瑞'], array['AKC','FCI'], 'Terrier', 'small', array['wire'], array['需修剪','可拔毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 41),
  ('dog-dachshund', 'dog', '臘腸犬', 'Dachshund', array['Doxie'], array['AKC','FCI'], 'Dachshund', 'small', array['short','long','wire'], array['依毛型評估'], array['椎間盤'], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 42),
  ('dog-beagle', 'dog', '米格魯', 'Beagle', array['比格犬'], array['AKC','FCI'], 'Hound', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 43),
  ('dog-akita', 'dog', '秋田犬', 'Akita', array['Akita Inu'], array['AKC','FCI'], 'Spitz and Primitive', 'large', array['double','medium'], array['雙層毛','換毛期大量掉毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/'], 44),
  ('dog-taiwan-dog', 'dog', '台灣犬', 'Taiwan Dog', array['Formosan Mountain Dog','台灣土狗'], array['AKC','FCI'], 'Spitz and Primitive', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://www.akc.org/dog-breeds/','https://www.fci.be/en/Nomenclature/'], 45),
  ('dog-american-staffordshire-terrier', 'dog', '美國斯塔福郡㹴', 'American Staffordshire Terrier', array['AmStaff','斯塔福'], array['AKC','FCI'], 'Terrier', 'medium', array['short'], array['短毛'], array[]::text[], 'prohibited', '屬比特犬類型或可能被認定為比特犬混種時，依台灣公告禁止飼養、輸入或輸出；既有個案應依主管機關規定。', array['https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=M0060027'], 900),
  ('dog-american-pit-bull-terrier', 'dog', '美國比特鬥牛㹴', 'American Pit Bull Terrier', array['比特犬','Pit Bull','Pitbull'], array['custom'], 'Terrier', 'medium', array['short'], array['短毛'], array[]::text[], 'prohibited', '台灣已公告比特犬及其混種犬類禁止飼養、輸入或輸出；公告前既有飼養需依規定申報。', array['https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=M0060027'], 901),
  ('dog-staffordshire-bull-terrier', 'dog', '斯塔福郡鬥牛㹴', 'Staffordshire Bull Terrier', array['Staffy'], array['AKC','FCI'], 'Terrier', 'medium', array['short'], array['短毛'], array[]::text[], 'restricted', '可能涉及比特犬類型認定，建議由主管機關或獸醫確認。', array['https://www.akc.org/dog-breeds/'], 902),

  ('cat-british-shorthair', 'cat', '英國短毛貓', 'British Shorthair', array['英短'], array['TICA','CFA'], 'Shorthair', 'medium', array['short','dense'], array['短毛','易掉毛'], array['肥厚性心肌病'], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 20),
  ('cat-american-shorthair', 'cat', '美國短毛貓', 'American Shorthair', array['美短'], array['TICA','CFA'], 'Shorthair', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 21),
  ('cat-scottish-fold', 'cat', '蘇格蘭摺耳貓', 'Scottish Fold', array['折耳貓','摺耳'], array['TICA','CFA'], 'Shorthair/Longhair', 'medium', array['short','long'], array['依毛型評估'], array['軟骨發育不全','關節'], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 22),
  ('cat-persian', 'cat', '波斯貓', 'Persian', array[]::text[], array['TICA','CFA'], 'Longhair', 'medium', array['long'], array['長毛','易打結','需眼周清潔'], array['短吻呼吸道','眼睛'], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 23),
  ('cat-exotic-shorthair', 'cat', '異國短毛貓', 'Exotic Shorthair', array['加菲貓'], array['TICA','CFA'], 'Shorthair', 'medium', array['short','dense'], array['短毛','需眼周清潔'], array['短吻呼吸道','眼睛'], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 24),
  ('cat-ragdoll', 'cat', '布偶貓', 'Ragdoll', array[]::text[], array['TICA','CFA'], 'Longhair', 'large', array['semi-long','long'], array['長毛','易打結'], array['肥厚性心肌病'], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 25),
  ('cat-maine-coon', 'cat', '緬因貓', 'Maine Coon', array[]::text[], array['TICA','CFA'], 'Longhair', 'large', array['semi-long','long'], array['長毛','需梳理'], array['肥厚性心肌病','髖關節'], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 26),
  ('cat-russian-blue', 'cat', '俄羅斯藍貓', 'Russian Blue', array['俄藍'], array['TICA','CFA'], 'Shorthair', 'medium', array['short','dense'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 27),
  ('cat-siamese', 'cat', '暹羅貓', 'Siamese', array[]::text[], array['TICA','CFA'], 'Oriental', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 28),
  ('cat-bengal', 'cat', '孟加拉貓', 'Bengal', array[]::text[], array['TICA','CFA'], 'Shorthair', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 29),
  ('cat-sphynx', 'cat', '加拿大無毛貓', 'Sphynx', array['斯芬克斯貓','無毛貓'], array['TICA','CFA'], 'Hairless', 'medium', array['hairless'], array['皮膚清潔','注意保暖'], array['皮膚'], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 30),
  ('cat-munchkin', 'cat', '曼赤肯貓', 'Munchkin', array['短腿貓'], array['TICA'], 'Shorthair/Longhair', 'small', array['short','long'], array['依毛型評估'], array['骨骼關節'], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 31),
  ('cat-norwegian-forest', 'cat', '挪威森林貓', 'Norwegian Forest Cat', array[]::text[], array['TICA','CFA'], 'Longhair', 'large', array['long','double'], array['長毛','雙層毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 32),
  ('cat-siberian', 'cat', '西伯利亞貓', 'Siberian', array['Siberian Forest Cat'], array['TICA','CFA'], 'Longhair', 'large', array['long','double'], array['長毛','雙層毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 33),
  ('cat-devon-rex', 'cat', '德文捲毛貓', 'Devon Rex', array[]::text[], array['TICA','CFA'], 'Rex', 'medium', array['rex','short'], array['捲毛','皮膚清潔'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 34),
  ('cat-cornish-rex', 'cat', '柯尼斯捲毛貓', 'Cornish Rex', array[]::text[], array['TICA','CFA'], 'Rex', 'medium', array['rex','short'], array['捲毛','皮膚清潔'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 35),
  ('cat-abyssinian', 'cat', '阿比西尼亞貓', 'Abyssinian', array[]::text[], array['TICA','CFA'], 'Shorthair', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 36),
  ('cat-birman', 'cat', '伯曼貓', 'Birman', array[]::text[], array['TICA','CFA'], 'Longhair', 'medium', array['semi-long'], array['長毛','需梳理'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 37),
  ('cat-burmese', 'cat', '緬甸貓', 'Burmese', array[]::text[], array['TICA','CFA'], 'Shorthair', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 38),
  ('cat-japanese-bobtail', 'cat', '日本短尾貓', 'Japanese Bobtail', array[]::text[], array['TICA','CFA'], 'Bobtail', 'medium', array['short','long'], array['依毛型評估'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 39),
  ('cat-korat', 'cat', '柯拉特貓', 'Korat', array[]::text[], array['TICA','CFA'], 'Shorthair', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 40),
  ('cat-oriental-shorthair', 'cat', '東方短毛貓', 'Oriental Shorthair', array[]::text[], array['TICA','CFA'], 'Oriental', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 41),
  ('cat-selkirk-rex', 'cat', '塞爾凱克捲毛貓', 'Selkirk Rex', array[]::text[], array['TICA','CFA'], 'Rex', 'medium', array['rex','short','long'], array['捲毛','易打結'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 42),
  ('cat-singapura', 'cat', '新加坡貓', 'Singapura', array[]::text[], array['TICA','CFA'], 'Shorthair', 'small', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 43),
  ('cat-somali', 'cat', '索馬利貓', 'Somali', array[]::text[], array['TICA','CFA'], 'Longhair', 'medium', array['long'], array['長毛','需梳理'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 44),
  ('cat-tonkinese', 'cat', '東奇尼貓', 'Tonkinese', array[]::text[], array['TICA','CFA'], 'Shorthair', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 45),
  ('cat-turkish-angora', 'cat', '土耳其安哥拉貓', 'Turkish Angora', array[]::text[], array['TICA','CFA'], 'Longhair', 'medium', array['semi-long'], array['長毛','需梳理'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 46),
  ('cat-turkish-van', 'cat', '土耳其梵貓', 'Turkish Van', array[]::text[], array['TICA','CFA'], 'Longhair', 'medium', array['semi-long'], array['長毛','需梳理'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 47),
  ('cat-toyger', 'cat', '玩具虎貓', 'Toyger', array[]::text[], array['TICA'], 'Shorthair', 'medium', array['short'], array['短毛'], array[]::text[], 'allowed', null, array['https://en.wikipedia.org/wiki/List_of_cat_breeds'], 48)
on conflict (id) do update set
  canonical_name_zh = excluded.canonical_name_zh,
  canonical_name_en = excluded.canonical_name_en,
  aliases = excluded.aliases,
  registry_sources = excluded.registry_sources,
  breed_group = excluded.breed_group,
  size = excluded.size,
  coat_type = excluded.coat_type,
  grooming_tags = excluded.grooming_tags,
  vet_risk_tags = excluded.vet_risk_tags,
  legal_status_tw = excluded.legal_status_tw,
  legal_note = excluded.legal_note,
  source_urls = excluded.source_urls,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now_utc();

insert into breed_aliases (breed_id, locale, name, normalized_name)
select b.id, 'zh-TW', alias_name, lower(regexp_replace(alias_name, '\s+', '', 'g'))
from breed_master b
cross join lateral unnest(array_append(b.aliases, b.canonical_name_zh)) as alias_name
on conflict (breed_id, locale, normalized_name) do nothing;
