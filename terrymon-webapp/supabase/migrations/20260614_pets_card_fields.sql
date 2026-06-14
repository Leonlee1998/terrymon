-- Add pet card fields: gender, is_neutered, blood_type, city
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS gender       text        CHECK (gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS is_neutered  boolean,
  ADD COLUMN IF NOT EXISTS blood_type   text,
  ADD COLUMN IF NOT EXISTS caregiver    text;
