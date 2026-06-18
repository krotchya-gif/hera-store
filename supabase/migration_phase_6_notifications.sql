-- ============================================================
-- MIGRATION PHASE 6 - REALTIME NOTIFICATION TRIGGERS
-- Jalankan di Supabase SQL Editor setelah schema, rls, functions
-- Semua statement idempotent (aman dijalankan ulang)
-- ============================================================

-- ============================================================
-- 1. New order -> admin broadcast
-- ============================================================
create or replace function public.notify_new_order()
returns trigger
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, title, message, data)
  values (
    null,
    'order',
    'Pesanan baru masuk',
    'Pesanan ' || NEW.id || ' senilai Rp ' || NEW.total::text || ' baru dibuat.',
    jsonb_build_object('order_id', NEW.id, 'total', NEW.total, 'status', NEW.status)
  );
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_new_order on public.orders;
create trigger trg_notify_new_order
  after insert on public.orders
  for each row
  execute function public.notify_new_order();

-- ============================================================
-- 2. Order status changed -> customer
-- ============================================================
create or replace function public.notify_order_status_change()
returns trigger
set search_path = ''
as $$
begin
  if OLD.status is distinct from NEW.status and NEW.user_id is not null then
    insert into public.notifications (user_id, type, title, message, data)
    values (
      NEW.user_id,
      'order',
      'Status pesanan diperbarui',
      'Pesanan ' || NEW.id || ' sekarang ' || NEW.status || '.',
      jsonb_build_object('order_id', NEW.id, 'status', NEW.status)
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_order_status on public.orders;
create trigger trg_notify_order_status
  after update on public.orders
  for each row
  execute function public.notify_order_status_change();

-- ============================================================
-- 3. Payment received -> customer
-- ============================================================
create or replace function public.notify_payment_received()
returns trigger
set search_path = ''
as $$
begin
  if OLD.payment_status is distinct from NEW.payment_status
     and NEW.payment_status = 'paid'
     and NEW.user_id is not null then
    insert into public.notifications (user_id, type, title, message, data)
    values (
      NEW.user_id,
      'payment',
      'Pembayaran diterima',
      'Pembayaran untuk pesanan ' || NEW.id || ' telah kami terima.',
      jsonb_build_object('order_id', NEW.id, 'payment_status', NEW.payment_status)
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_payment_received on public.orders;
create trigger trg_notify_payment_received
  after update on public.orders
  for each row
  execute function public.notify_payment_received();

-- ============================================================
-- 4. New review -> admin broadcast
-- ============================================================
create or replace function public.notify_new_review()
returns trigger
set search_path = ''
as $$
declare
  product_name text;
begin
  select name into product_name from public.products where id = NEW.product_id;
  insert into public.notifications (user_id, type, title, message, data)
  values (
    null,
    'review',
    'Ulasan baru masuk',
    'Produk ' || coalesce(product_name, 'ID ' || NEW.product_id::text) || ' mendapat ulasan ' || NEW.rating || ' bintang.',
    jsonb_build_object('review_id', NEW.id, 'product_id', NEW.product_id, 'rating', NEW.rating)
  );
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_new_review on public.reviews;
create trigger trg_notify_new_review
  after insert on public.reviews
  for each row
  execute function public.notify_new_review();

-- ============================================================
-- 5. Low stock -> admin broadcast
-- ============================================================
create or replace function public.notify_low_stock()
returns trigger
set search_path = ''
as $$
begin
  if NEW.stock < 10 and (OLD.stock is null or OLD.stock >= 10) then
    insert into public.notifications (user_id, type, title, message, data)
    values (
      null,
      'stock',
      'Stok menipis',
      'Stok ' || NEW.name || ' tersisa ' || NEW.stock || ' unit.',
      jsonb_build_object('product_id', NEW.id, 'stock', NEW.stock)
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_low_stock on public.products;
create trigger trg_notify_low_stock
  after update on public.products
  for each row
  execute function public.notify_low_stock();
