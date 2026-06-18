-- ============================================================
-- MIGRATION PHASE 4 & 5
-- Jalankan ini di Supabase SQL Editor SETELAH schema.sql dan rls.sql
-- (storage.sql diasumsikan sudah di-migrate terpisah)
-- Semua statement idempotent — aman di-run ulang.
-- ============================================================

-- ============================================================
-- 1. ORDERS: payment proof (Phase 3) + per-item notes (Phase 5)
-- ============================================================
alter table public.orders add column if not exists payment_proof text;
alter table public.orders add column if not exists item_notes jsonb default '{}';

-- ============================================================
-- 2. REVIEWS: status + admin reply (Phase 4)
-- ============================================================
alter table public.reviews add column if not exists status text default 'pending';
-- Hanya jalankan ADD CONSTRAINT jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_status_check' AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_status_check
      CHECK (status in ('pending', 'approved', 'rejected'));
  END IF;
END
$$;

alter table public.reviews add column if not exists admin_reply text;

-- ============================================================
-- 3. ADMIN INVITATIONS table (Phase 4)
-- ============================================================
create table if not exists public.admin_invitations (
  id serial primary key,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  token text unique not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

-- ============================================================
-- 4. RLS untuk admin_invitations
-- ============================================================
alter table public.admin_invitations enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_invitations' AND policyname = 'Admins can view invitations'
  ) THEN
    CREATE POLICY "Admins can view invitations"
      ON public.admin_invitations FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_invitations' AND policyname = 'Admins can create invitations'
  ) THEN
    CREATE POLICY "Admins can create invitations"
      ON public.admin_invitations FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_invitations' AND policyname = 'Admins can update invitations'
  ) THEN
    CREATE POLICY "Admins can update invitations"
      ON public.admin_invitations FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;
END
$$;
