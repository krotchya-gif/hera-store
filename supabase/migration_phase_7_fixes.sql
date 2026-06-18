-- ============================================================
-- MIGRATION PHASE 7 - DATABASE FIXES & POLICIES
-- Jalankan di Supabase SQL Editor setelah semua migration
-- sebelumnya berhasil dijalankan.
-- Semua statement idempotent (aman dijalankan ulang).
-- ============================================================

-- ============================================================
-- FIX 1: decrement_stock - tambah SECURITY DEFINER
-- Fungsi ini perlu bypass RLS karena dipanggil dari sisi
-- client saat user checkout (bukan admin).
-- Sebelumnya: SECURITY INVOKER -> kena blokir RLS products
-- ============================================================
create or replace function public.decrement_stock(
  product_id integer,
  amount integer
)
returns void
set search_path = ''
as $$
begin
  update public.products
  set stock = stock - amount,
      sold_count = sold_count + amount
  where id = product_id and stock >= amount;

  if not found then
    raise exception 'Insufficient stock for product %', product_id;
  end if;
end;
$$ language plpgsql security definer;


-- ============================================================
-- FIX 2: RLS order cancel policy - pisahkan USING dan WITH CHECK
-- USING = cek baris SEBELUM update (milik user & status pending/paid)
-- WITH CHECK = cek baris SETELAH update (milik user)
-- Sebelumnya: WITH CHECK default ke USING -> gagal karena
-- status 'cancelled' tidak masuk kondisi USING
-- ============================================================
drop policy if exists "Users can cancel their own orders" on public.orders;

create policy "Users can cancel their own orders"
  on public.orders for update
  using (auth.uid() = user_id AND status IN ('pending', 'paid'))
  with check (auth.uid() = user_id);


-- ============================================================
-- FIX 3: RLS notifications - pastikan policy insert exists
-- User biasa perlu bisa insert notifikasi (via createNotification API)
-- ============================================================
drop policy if exists "System can insert notifications" on public.notifications;
create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);


-- ============================================================
-- FIX 4: get_sales_data - cast BIGINT ke NUMERIC
-- SUM(integer) return BIGINT, tapi fungsi declare NUMERIC
-- ============================================================
create or replace function public.get_sales_data(
  days integer default 30
)
returns table (
  sale_date text,
  revenue numeric,
  order_count integer
)
set search_path = ''
as $$
begin
  return query
  select
    to_char(o.created_at, 'DD Mon') as sale_date,
    coalesce(sum(o.total), 0)::numeric as revenue,
    count(*)::integer as order_count
  from public.orders o
  where o.created_at >= now() - (days || ' days')::interval
  and o.status not in ('cancelled', 'refunded')
  group by to_char(o.created_at, 'DD Mon'), date(o.created_at)
  order by date(o.created_at);
end;
$$ language plpgsql;


-- ============================================================
-- FIX 5: get_category_sales - cast BIGINT ke NUMERIC
-- Sama seperti FIX 4
-- ============================================================
create or replace function public.get_category_sales()
returns table (
  category_name text,
  sales numeric,
  percentage numeric
)
set search_path = ''
as $$
begin
  return query
  with total_sales as (
    select coalesce(sum(oi.price * oi.quantity), 0)::numeric as total
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.status not in ('cancelled', 'refunded')
    and o.created_at >= now() - interval '30 days'
  )
  select
    c.name as category_name,
    coalesce(sum(oi.price * oi.quantity), 0)::numeric as sales,
    case when ts.total > 0 then round((coalesce(sum(oi.price * oi.quantity), 0)::numeric / ts.total * 100)::numeric, 1) else 0 end as percentage
  from public.categories c
  left join public.products p on p.category_id = c.id
  left join public.order_items oi on oi.product_id = p.id
  left join public.orders o on o.id = oi.order_id
    and o.status not in ('cancelled', 'refunded')
    and o.created_at >= now() - interval '30 days'
  cross join total_sales ts
  group by c.name, ts.total
  order by sales desc;
end;
$$ language plpgsql;


-- ============================================================
-- FIX 6: Reset stok produk ke nilai seed (untuk development)
-- Hapus comment di baris bawah kalau mau reset stok
-- ============================================================
-- update public.products set stock = 245, sold_count = 0 where id = 1;
-- update public.products set stock = 120, sold_count = 0 where id = 2;
-- update public.products set stock = 500, sold_count = 0 where id = 3;
-- update public.products set stock = 300, sold_count = 0 where id = 4;
-- update public.products set stock = 180, sold_count = 0 where id = 5;
-- update public.products set stock = 150, sold_count = 0 where id = 6;
-- update public.products set stock = 200, sold_count = 0 where id = 7;
-- update public.products set stock =  90, sold_count = 0 where id = 8;


-- ============================================================
-- SELESAI
-- ============================================================
select 'Migration Phase 7 - Database fixes applied successfully!' as status;
