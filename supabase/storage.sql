-- ============================================================
-- STORAGE BUCKETS
-- Run this in Supabase SQL Editor to create buckets and policies
-- ============================================================

-- Create buckets (public = true so public URLs work)
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('avatars', 'avatars', true),
  ('payment-proofs', 'payment-proofs', true),
  ('banners', 'banners', true)
on conflict (id) do update set public = excluded.public;

-- ============================================================
-- POLICIES: product-images
-- Authenticated users can upload/select/delete; anon can read
-- ============================================================
create policy "Allow authenticated uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Allow public reads"
  on storage.objects for select
  to anon
  using (bucket_id = 'product-images');

create policy "Allow authenticated reads"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'product-images');

create policy "Allow authenticated deletes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- ============================================================
-- POLICIES: avatars
-- ============================================================
create policy "Allow authenticated avatar uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "Allow public avatar reads"
  on storage.objects for select
  to anon
  using (bucket_id = 'avatars');

create policy "Allow authenticated avatar reads"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars');

create policy "Allow authenticated avatar deletes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars');

-- ============================================================
-- POLICIES: payment-proofs
-- ============================================================
create policy "Allow authenticated payment proof uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'payment-proofs');

create policy "Allow public payment proof reads"
  on storage.objects for select
  to anon
  using (bucket_id = 'payment-proofs');

create policy "Allow authenticated payment proof reads"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment-proofs');

create policy "Allow authenticated payment proof deletes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'payment-proofs');

-- ============================================================
-- POLICIES: banners
-- ============================================================
create policy "Allow authenticated banner uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'banners');

create policy "Allow public banner reads"
  on storage.objects for select
  to anon
  using (bucket_id = 'banners');

create policy "Allow authenticated banner reads"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'banners');

create policy "Allow authenticated banner deletes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'banners');
