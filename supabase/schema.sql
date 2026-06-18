-- ============================================================
-- hera store — supabase database schema
-- ============================================================
-- run this in supabase sql editor to create all tables
-- ============================================================

-- enable uuid extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. profiles (extends supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  phone text,
  avatar text,
  role text default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. categories
-- ============================================================
create table if not exists public.categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  description text,
  image text,
  icon text,
  parent_id integer references public.categories(id),
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. products
-- ============================================================
create table if not exists public.products (
  id serial primary key,
  name text not null,
  slug text unique not null,
  sku text unique,
  description text,
  short_description text,
  category_id integer references public.categories(id),
  brand text,
  price integer not null default 0,
  original_price integer default 0,
  discount_percent integer default 0,
  stock integer not null default 0,
  unit text default 'pcs',
  weight integer default 0, -- in grams
  dimensions jsonb default '{}', -- {length, width, height}
  images jsonb default '[]',
  thumbnail text,
  rating decimal(2,1) default 0,
  sold_count integer default 0,
  is_active boolean default true,
  is_featured boolean default false,
  shipping_from text default 'Jakarta',
  free_shipping boolean default false,
  min_order_free_shipping integer default 100000,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 4. product variants
-- ============================================================
create table if not exists public.product_variants (
  id serial primary key,
  product_id integer references public.products(id) on delete cascade,
  name text not null,
  price integer,
  stock integer default 0,
  sku text,
  image text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. addresses
-- ============================================================
create table if not exists public.addresses (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  label text default 'Rumah', -- Rumah, Kantor, dll
  recipient_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  province text not null,
  postal_code text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 6. cart
-- ============================================================
create table if not exists public.cart_items (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  product_id integer references public.products(id) on delete cascade,
  quantity integer not null default 1,
  variant text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, product_id, variant)
);

-- ============================================================
-- 7. orders
-- ============================================================

-- sequence harus dibuat SEBELUM tabel orders (karena dipakai di default)
create sequence if not exists public.order_seq start 1;

create table if not exists public.orders (
  id text primary key default 'TJ' || to_char(now(), 'YYYYMMDD') || lpad(nextval('public.order_seq')::text, 5, '0'),
  user_id uuid references public.profiles(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total integer not null default 0,
  subtotal integer not null default 0,
  shipping_cost integer default 0,
  discount_amount integer default 0,
  voucher_code text,
  payment_method text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  shipping_method text,
  tracking_number text,
  address_id integer references public.addresses(id),
  address_snapshot jsonb, -- snapshot alamat saat order
  payment_proof text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 8. order items
-- ============================================================
create table if not exists public.order_items (
  id serial primary key,
  order_id text references public.orders(id) on delete cascade,
  product_id integer references public.products(id),
  quantity integer not null,
  price integer not null,
  variant text,
  created_at timestamptz default now()
);

-- ============================================================
-- 9. wishlist
-- ============================================================
create table if not exists public.wishlists (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  product_id integer references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ============================================================
-- 10. reviews
-- ============================================================
create table if not exists public.reviews (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  product_id integer references public.products(id) on delete cascade,
  order_id text references public.orders(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  images jsonb default '[]',
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 11. vouchers
-- ============================================================
create table if not exists public.vouchers (
  id serial primary key,
  code text unique not null,
  type text not null check (type in ('percentage', 'fixed')),
  value integer not null,
  min_order integer default 0,
  max_discount integer,
  usage_limit integer,
  usage_count integer default 0,
  valid_from timestamptz default now(),
  valid_until timestamptz not null,
  applicable_products jsonb default '[]', -- empty = all products
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- 12. flash sales
-- ============================================================
create table if not exists public.flash_sales (
  id serial primary key,
  name text not null,
  description text,
  banner text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.flash_sale_items (
  id serial primary key,
  flash_sale_id integer references public.flash_sales(id) on delete cascade,
  product_id integer references public.products(id) on delete cascade,
  flash_price integer not null,
  flash_stock integer not null,
  sold_count integer default 0,
  unique(flash_sale_id, product_id)
);

-- ============================================================
-- 13. store settings
-- ============================================================
create table if not exists public.store_settings (
  id integer primary key default 1,
  name text default 'Hera Store',
  description text,
  logo text,
  banner text,
  email text,
  phone text,
  address text,
  city text,
  province text,
  postal_code text,
  warehouse_address text,
  operating_hours jsonb default '{}',
  social_media jsonb default '{}',
  shipping_couriers jsonb default '["JNE", "J&T", "SiCepat", "Gosend", "Anteraja"]',
  payment_methods jsonb default '["transfer_bank", "gopay", "ovo", "dana", "shopeepay", "virtual_account", "cod"]',
  free_shipping_enabled boolean default true,
  free_shipping_min_order integer default 100000,
  payment_time_limit integer default 24, -- hours
  bank_accounts jsonb default '[]',
  email_notifications jsonb default '{}',
  whatsapp_notifications jsonb default '{}',
  updated_at timestamptz default now()
);

-- ============================================================
-- 14. notifications
-- ============================================================
create table if not exists public.notifications (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  data jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 15. admin invitations
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
-- indexes
-- ============================================================
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_price on public.products(price);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_cart_user on public.cart_items(user_id);
create index if not exists idx_wishlist_user on public.wishlists(user_id);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_addresses_user on public.addresses(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_vouchers_code on public.vouchers(code);
create index if not exists idx_vouchers_active on public.vouchers(is_active, valid_until);
create index if not exists idx_flash_sales_active on public.flash_sales(is_active, starts_at, ends_at);

-- ============================================================
-- update trigger function
-- ============================================================
create or replace function public.update_updated_at()
returns trigger
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- apply to tables
create trigger update_products_updated_at before update on public.products
  for each row execute function public.update_updated_at();
create trigger update_orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at();
create trigger update_cart_items_updated_at before update on public.cart_items
  for each row execute function public.update_updated_at();
create trigger update_store_settings_updated_at before update on public.store_settings
  for each row execute function public.update_updated_at();

-- ============================================================
-- MIGRATIONS (idempotent)
-- ============================================================
alter table public.orders add column if not exists payment_proof text;
alter table public.orders add column if not exists item_notes jsonb default '{}';
alter table public.reviews add column if not exists status text default 'pending' check (status in ('pending', 'approved', 'rejected'));
alter table public.reviews add column if not exists admin_reply text;
