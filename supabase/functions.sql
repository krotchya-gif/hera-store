-- ============================================================
-- hera store — database functions (rpc)
-- ============================================================
-- run this in supabase sql editor
-- ============================================================

-- ============================================================
-- 0. drop existing functions (to allow return type changes)
-- ============================================================
drop function if exists public.decrement_stock(integer, integer);
drop function if exists public.get_dashboard_stats(text);
drop function if exists public.get_sales_data(integer);
drop function if exists public.get_category_sales();
drop function if exists public.get_payment_methods(text);
drop function if exists public.increment_voucher_usage(integer);
drop function if exists public.get_top_products(integer, integer);
drop function if exists public.get_order_timeline(text);
drop function if exists public.check_stock_availability(integer, integer);
drop function if exists public.generate_order_id();
drop function if exists public.get_recent_orders_admin(integer);
drop function if exists public.update_product_rating();

-- ============================================================
-- 1. decrement stock (for orders)
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
-- 2. dashboard stats
-- ============================================================
create or replace function public.get_dashboard_stats(
  period text default '30days'
)
returns table (
  metric text,
  value numeric,
  change_percent numeric
)
set search_path = ''
as $$
declare
  days integer;
  prev_start timestamptz;
  prev_end timestamptz;
  curr_start timestamptz;
  curr_end timestamptz;
begin
  -- calculate date (date range)
  days := case period
    when '7days' then 7
    when '30days' then 30
    when '90days' then 90
    when '1year' then 365
    else 30
  end;

  curr_end := now();
  curr_start := curr_end - (days || ' days')::interval;
  prev_end := curr_start;
  prev_start := prev_end - (days || ' days')::interval;

  return query
  with current_period as (
    select
      coalesce(sum(total), 0) as revenue,
      count(*) as orders,
      count(distinct user_id) as customers,
      coalesce(sum((select sum(quantity) from public.order_items where order_id = o.id)), 0) as items_sold
    from public.orders o
    where o.created_at >= curr_start and o.created_at <= curr_end
    and o.status not in ('cancelled', 'refunded')
  ),
  previous_period as (
    select
      coalesce(sum(total), 0) as revenue,
      count(*) as orders,
      count(distinct user_id) as customers,
      coalesce(sum((select sum(quantity) from public.order_items where order_id = o.id)), 0) as items_sold
    from public.orders o
    where o.created_at >= prev_start and o.created_at <= prev_end
    and o.status not in ('cancelled', 'refunded')
  )
  select
    'total_revenue' as metric,
    cp.revenue as value,
    case when pp.revenue > 0 then round(((cp.revenue - pp.revenue) / pp.revenue * 100)::numeric, 1) else 0 end as change_percent
  from current_period cp, previous_period pp

  union all
  select
    'total_orders' as metric,
    cp.orders as value,
    case when pp.orders > 0 then round(((cp.orders - pp.orders) / pp.orders * 100)::numeric, 1) else 0 end as change_percent
  from current_period cp, previous_period pp

  union all
  select
    'total_customers' as metric,
    cp.customers as value,
    case when pp.customers > 0 then round(((cp.customers - pp.customers) / pp.customers * 100)::numeric, 1) else 0 end as change_percent
  from current_period cp, previous_period pp

  union all
  select
    'total_items_sold' as metric,
    cp.items_sold as value,
    case when pp.items_sold > 0 then round(((cp.items_sold - pp.items_sold) / pp.items_sold * 100)::numeric, 1) else 0 end as change_percent
  from current_period cp, previous_period pp;
end;
$$ language plpgsql;

-- ============================================================
-- 3. sales data (for charts)
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
-- 4. category sales (for donut chart)
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
  left join public.orders o on o.id = oi.order_id and o.status not in ('cancelled', 'refunded') and o.created_at >= now() - interval '30 days'
  cross join total_sales ts
  group by c.name, ts.total
  order by sales desc;
end;
$$ language plpgsql;

-- ============================================================
-- 5. payment methods
-- ============================================================
create or replace function public.get_payment_methods(
  period text default '30days'
)
returns table (
  method text,
  count integer,
  total numeric,
  percentage numeric
)
set search_path = ''
as $$
declare
  days integer;
begin
  days := case period
    when '7days' then 7
    when '30days' then 30
    when '90days' then 90
    when '1year' then 365
    else 30
  end;

  return query
  with total_orders as (
    select count(*) as total
    from public.orders
    where created_at >= now() - (days || ' days')::interval
    and status not in ('cancelled', 'refunded')
  )
  select
    o.payment_method as method,
    count(*)::integer as count,
    coalesce(sum(o.total), 0) as total,
    case when to_total.total > 0 then round((count(*)::numeric / to_total.total * 100)::numeric, 1) else 0 end as percentage
  from public.orders o
  cross join total_orders to_total
  where o.created_at >= now() - (days || ' days')::interval
  and o.status not in ('cancelled', 'refunded')
  group by o.payment_method, to_total.total
  order by count desc;
end;
$$ language plpgsql;

-- ============================================================
-- 6. increment voucher usage
-- ============================================================
create or replace function public.increment_voucher_usage(
  voucher_id integer
)
returns void
set search_path = ''
as $$
begin
  update public.vouchers
  set usage_count = usage_count + 1
  where id = voucher_id;
end;
$$ language plpgsql;

-- ============================================================
-- 7. get top products
-- ============================================================
create or replace function public.get_top_products(
  limit_count integer default 10,
  days integer default 30
)
returns table (
  product_id integer,
  product_name text,
  thumbnail text,
  total_sold integer,
  total_revenue numeric
)
set search_path = ''
as $$
begin
  return query
  select
    p.id as product_id,
    p.name as product_name,
    p.thumbnail,
    coalesce(sum(oi.quantity), 0)::integer as total_sold,
    coalesce(sum(oi.price * oi.quantity), 0) as total_revenue
  from public.products p
  left join public.order_items oi on oi.product_id = p.id
  left join public.orders o on o.id = oi.order_id and o.status not in ('cancelled', 'refunded') and o.created_at >= now() - (days || ' days')::interval
  group by p.id, p.name, p.thumbnail
  order by total_sold desc
  limit limit_count;
end;
$$ language plpgsql;

-- ============================================================
-- 8. order status timeline
-- ============================================================
create or replace function public.get_order_timeline(
  order_id text
)
returns table (
  status text,
  event_timestamp timestamptz,
  description text
)
set search_path = ''
as $$
begin
  return query
  select
    o.status,
    o.updated_at as event_timestamp,
    case o.status
      when 'pending' then 'Pesanan dibuat'
      when 'paid' then 'Pembayaran diterima'
      when 'processing' then 'Sedang diproses'
      when 'shipped' then 'Dikirim'
      when 'delivered' then 'Selesai'
      when 'cancelled' then 'Dibatalkan'
      when 'refunded' then 'Direfund'
      else 'Status diperbarui'
    end as description
  from public.orders o
  where o.id = order_id;
end;
$$ language plpgsql;

-- ============================================================
-- 9. check stock availability
-- ============================================================
create or replace function public.check_stock_availability(
  product_id integer,
  quantity integer
)
returns table (
  available boolean,
  current_stock integer,
  message text
)
set search_path = ''
as $$
begin
  return query
  select
    case when stock >= quantity then true else false end as available,
    stock as current_stock,
    case
      when stock >= quantity then 'Stok tersedia'
      when stock > 0 then 'Stok tidak mencukup. Tersedia: ' || stock || ' unit'
      else 'Stok habis'
    end as message
  from public.products
  where id = product_id;
end;
$$ language plpgsql;

-- ============================================================
-- 10. generate order id
-- ============================================================
create or replace function public.generate_order_id()
returns text
set search_path = ''
as $$
begin
  return 'TJ' || to_char(now(), 'YYYYMMDD') || lpad(nextval('public.order_seq')::text, 5, '0');
end;
$$ language plpgsql;

-- ============================================================
-- 11. get recent orders for admin
-- ============================================================
create or replace function public.get_recent_orders_admin(
  limit_count integer default 10
)
returns table (
  order_id text,
  customer_name text,
  customer_email text,
  product_names text,
  total integer,
  status text,
  created_at timestamptz,
  payment_method text
)
set search_path = ''
as $$
begin
  return query
  select
    o.id as order_id,
    p.full_name as customer_name,
    p.email as customer_email,
    string_agg(distinct pr.name, ', ') as product_names,
    o.total,
    o.status,
    o.created_at,
    o.payment_method
  from public.orders o
  join public.profiles p on p.id = o.user_id
  join public.order_items oi on oi.order_id = o.id
  join public.products pr on pr.id = oi.product_id
  group by o.id, p.full_name, p.email, o.total, o.status, o.created_at, o.payment_method
  order by o.created_at desc
  limit limit_count;
end;
$$ language plpgsql;

-- ============================================================
-- 12. update product rating
-- ============================================================
create or replace function public.update_product_rating()
returns trigger
set search_path = ''
as $$
begin
  update public.products
  set rating = (
    select round(avg(rating)::numeric, 1)
    from public.reviews
    where product_id = new.product_id and is_approved = true
  )
  where id = new.product_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_product_rating_after_review on public.reviews;
create trigger update_product_rating_after_review
  after insert or update on public.reviews
  for each row
  execute function public.update_product_rating();
