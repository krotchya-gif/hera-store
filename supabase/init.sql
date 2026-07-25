-- ============================================================
-- HERA STORE — ALL-IN-ONE RESET & INIT
-- ============================================================
-- 1. DROP EVERYTHING (clean slate)
-- 2. CREATE SCHEMA (tables, sequences, triggers)
-- 3. CREATE FUNCTIONS (rpc)
-- 4. SEED DATA
-- 5. SETUP RLS
-- ============================================================

-- ============================================================
-- PART 0: DROP EVERYTHING
-- ============================================================

-- 0.1 drop triggers
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
  LOOP
    EXECUTE FORMAT('DROP TRIGGER IF EXISTS %I ON %I', rec.trigger_name, rec.event_object_table);
  END LOOP;
END;
$$;

-- 0.2 drop functions (skip internal supabase functions)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT p.proname as routine_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname NOT IN ('rls_auto_enable', 'set_pgtle', 'extension', 'set_graphql_placeholder', 'pgrst_ddl_watch', 'pgrst_drop_watch')
  LOOP
    EXECUTE FORMAT('DROP FUNCTION IF EXISTS public.%I CASCADE', rec.routine_name);
  END LOOP;
END;
$$;

-- 0.3 drop tables
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE FORMAT('DROP TABLE IF EXISTS public.%I CASCADE', rec.tablename);
  END LOOP;
END;
$$;

-- 0.4 drop sequences
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT sequencename
    FROM pg_sequences
    WHERE schemaname = 'public'
  LOOP
    EXECUTE FORMAT('DROP SEQUENCE IF EXISTS public.%I', rec.sequencename);
  END LOOP;
END;
$$;

-- 0.5 drop custom types
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT typname
    FROM pg_type
    WHERE typtype = 'e'
    AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    EXECUTE FORMAT('DROP TYPE IF EXISTS public.%I', rec.typname);
  END LOOP;
END;
$$;

-- 0.6 ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PART 1: CREATE TABLES
-- ============================================================

-- 1.1 profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 categories
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  icon TEXT,
  parent_id INTEGER REFERENCES public.categories(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 products
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  category_id INTEGER REFERENCES public.categories(id),
  brand TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  weight INTEGER DEFAULT 0,
  dimensions JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  thumbnail TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  shipping_from TEXT DEFAULT 'Jakarta',
  free_shipping BOOLEAN DEFAULT false,
  min_order_free_shipping INTEGER DEFAULT 100000,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 product variants
CREATE TABLE public.product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER,
  stock INTEGER DEFAULT 0,
  sku TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 addresses
CREATE TABLE public.addresses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Rumah',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 cart items
CREATE TABLE public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  variant TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant)
);

-- 1.7 order sequence (MUST be before orders table)
CREATE SEQUENCE public.order_seq START 1;

-- 1.8 orders
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY DEFAULT 'TJ' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('public.order_seq')::TEXT, 5, '0'),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total INTEGER NOT NULL DEFAULT 0,
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping_cost INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  voucher_code TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  shipping_method TEXT,
  tracking_number TEXT,
  address_id INTEGER REFERENCES public.addresses(id),
  address_snapshot JSONB,
  notes TEXT,
  payment_proof TEXT,
  item_notes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.9 order items
CREATE TABLE public.order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  variant TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.10 wishlists
CREATE TABLE public.wishlists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 1.11 reviews
CREATE TABLE public.reviews (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.12 vouchers
CREATE TABLE public.vouchers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value INTEGER NOT NULL,
  min_order INTEGER DEFAULT 0,
  max_discount INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  applicable_products JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.13 flash sales
CREATE TABLE public.flash_sales (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  banner TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.flash_sale_items (
  id SERIAL PRIMARY KEY,
  flash_sale_id INTEGER REFERENCES public.flash_sales(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  flash_price INTEGER NOT NULL,
  flash_stock INTEGER NOT NULL,
  sold_count INTEGER DEFAULT 0,
  UNIQUE(flash_sale_id, product_id)
);

-- 1.14 store settings
CREATE TABLE public.store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT DEFAULT 'Hera Store',
  description TEXT,
  logo TEXT,
  banner TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  warehouse_address TEXT,
  operating_hours JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  shipping_couriers JSONB DEFAULT '["JNE", "J&T", "SiCepat", "Gosend", "Anteraja"]',
  payment_methods JSONB DEFAULT '["transfer_bank", "gopay", "ovo", "dana", "shopeepay", "virtual_account", "cod"]',
  free_shipping_enabled BOOLEAN DEFAULT true,
  free_shipping_min_order INTEGER DEFAULT 100000,
  payment_time_limit INTEGER DEFAULT 24,
  bank_accounts JSONB DEFAULT '[]',
  email_notifications JSONB DEFAULT '{}',
  whatsapp_notifications JSONB DEFAULT '{}',
  live_chat_script TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.15 admin_invitations
CREATE TABLE public.admin_invitations (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- 1.16 product_qna
CREATE TABLE public.product_qna (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  is_answered BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.17 notifications
CREATE TABLE public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.17 newsletter_subscribers
CREATE TABLE public.newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.16 indexes
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_cart_user ON public.cart_items(user_id);
CREATE INDEX idx_wishlist_user ON public.wishlists(user_id);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_addresses_user ON public.addresses(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_vouchers_code ON public.vouchers(code);
CREATE INDEX idx_vouchers_active ON public.vouchers(is_active, valid_until);
CREATE INDEX idx_flash_sales_active ON public.flash_sales(is_active, starts_at, ends_at);
CREATE INDEX idx_admin_invitations_email ON public.admin_invitations(email);
CREATE INDEX idx_admin_invitations_status ON public.admin_invitations(status);
CREATE INDEX idx_product_qna_product ON public.product_qna(product_id);

-- ============================================================
-- PART 2: CREATE FUNCTIONS
-- ============================================================

-- 2.1 update_updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.2 handle_new_user (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.3 decrement_stock
CREATE OR REPLACE FUNCTION public.decrement_stock(
  product_id INTEGER,
  amount INTEGER
)
RETURNS VOID
SET search_path = ''
AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - amount,
      sold_count = sold_count + amount
  WHERE id = product_id AND stock >= amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.4 get_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  period TEXT DEFAULT '30days'
)
RETURNS TABLE (
  metric TEXT,
  value NUMERIC,
  change_percent NUMERIC
)
SET search_path = ''
AS $$
DECLARE
  days INTEGER;
  prev_start TIMESTAMPTZ;
  prev_end TIMESTAMPTZ;
  curr_start TIMESTAMPTZ;
  curr_end TIMESTAMPTZ;
BEGIN
  days := CASE period
    WHEN '7days' THEN 7
    WHEN '30days' THEN 30
    WHEN '90days' THEN 90
    WHEN '1year' THEN 365
    ELSE 30
  END;

  curr_end := NOW();
  curr_start := curr_end - (days || ' days')::INTERVAL;
  prev_end := curr_start;
  prev_start := prev_end - (days || ' days')::INTERVAL;

  RETURN QUERY
  WITH current_period AS (
    SELECT
      COALESCE(SUM(total), 0) AS revenue,
      COUNT(*) AS orders,
      COUNT(DISTINCT user_id) AS customers,
      COALESCE(SUM((SELECT SUM(quantity) FROM public.order_items WHERE order_id = o.id)), 0) AS items_sold
    FROM public.orders o
    WHERE o.created_at >= curr_start AND o.created_at <= curr_end
    AND o.status NOT IN ('cancelled', 'refunded')
  ),
  previous_period AS (
    SELECT
      COALESCE(SUM(total), 0) AS revenue,
      COUNT(*) AS orders,
      COUNT(DISTINCT user_id) AS customers,
      COALESCE(SUM((SELECT SUM(quantity) FROM public.order_items WHERE order_id = o.id)), 0) AS items_sold
    FROM public.orders o
    WHERE o.created_at >= prev_start AND o.created_at <= prev_end
    AND o.status NOT IN ('cancelled', 'refunded')
  )
  SELECT 'total_revenue', cp.revenue, CASE WHEN pp.revenue > 0 THEN ROUND(((cp.revenue - pp.revenue) / pp.revenue * 100)::NUMERIC, 1) ELSE 0 END
  FROM current_period cp, previous_period pp
  UNION ALL
  SELECT 'total_orders', cp.orders, CASE WHEN pp.orders > 0 THEN ROUND(((cp.orders - pp.orders) / pp.orders * 100)::NUMERIC, 1) ELSE 0 END
  FROM current_period cp, previous_period pp
  UNION ALL
  SELECT 'total_customers', cp.customers, CASE WHEN pp.customers > 0 THEN ROUND(((cp.customers - pp.customers) / pp.customers * 100)::NUMERIC, 1) ELSE 0 END
  FROM current_period cp, previous_period pp
  UNION ALL
  SELECT 'total_items_sold', cp.items_sold, CASE WHEN pp.items_sold > 0 THEN ROUND(((cp.items_sold - pp.items_sold) / pp.items_sold * 100)::NUMERIC, 1) ELSE 0 END
  FROM current_period cp, previous_period pp;
END;
$$ LANGUAGE plpgsql;

-- 2.5 get_sales_data
CREATE OR REPLACE FUNCTION public.get_sales_data(
  days INTEGER DEFAULT 30
)
RETURNS TABLE (
  sale_date TEXT,
  revenue NUMERIC,
  order_count INTEGER
)
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(o.created_at, 'DD Mon') AS sale_date,
    COALESCE(SUM(o.total), 0)::NUMERIC AS revenue,
    COUNT(*)::INTEGER AS order_count
  FROM public.orders o
  WHERE o.created_at >= NOW() - (days || ' days')::INTERVAL
  AND o.status NOT IN ('cancelled', 'refunded')
  GROUP BY TO_CHAR(o.created_at, 'DD Mon'), DATE(o.created_at)
  ORDER BY DATE(o.created_at);
END;
$$ LANGUAGE plpgsql;

-- 2.6 get_category_sales
CREATE OR REPLACE FUNCTION public.get_category_sales()
RETURNS TABLE (
  category_name TEXT,
  sales NUMERIC,
  percentage NUMERIC
)
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH total_sales AS (
    SELECT COALESCE(SUM(oi.price * oi.quantity), 0)::NUMERIC AS total
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.status NOT IN ('cancelled', 'refunded')
    AND o.created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT
    c.name AS category_name,
    COALESCE(SUM(oi.price * oi.quantity), 0)::NUMERIC AS sales,
    CASE WHEN ts.total > 0 THEN ROUND((COALESCE(SUM(oi.price * oi.quantity), 0) / ts.total * 100)::NUMERIC, 1) ELSE 0 END AS percentage
  FROM public.categories c
  LEFT JOIN public.products p ON p.category_id = c.id
  LEFT JOIN public.order_items oi ON oi.product_id = p.id
  LEFT JOIN public.orders o ON o.id = oi.order_id AND o.status NOT IN ('cancelled', 'refunded') AND o.created_at >= NOW() - INTERVAL '30 days'
  CROSS JOIN total_sales ts
  GROUP BY c.name, ts.total
  ORDER BY sales DESC;
END;
$$ LANGUAGE plpgsql;

-- 2.7 get_payment_methods
CREATE OR REPLACE FUNCTION public.get_payment_methods(
  period TEXT DEFAULT '30days'
)
RETURNS TABLE (
  method TEXT,
  count INTEGER,
  total NUMERIC,
  percentage NUMERIC
)
SET search_path = ''
AS $$
DECLARE
  days INTEGER;
BEGIN
  days := CASE period
    WHEN '7days' THEN 7
    WHEN '30days' THEN 30
    WHEN '90days' THEN 90
    WHEN '1year' THEN 365
    ELSE 30
  END;

  RETURN QUERY
  WITH total_orders AS (
    SELECT COUNT(*) AS total
    FROM public.orders
    WHERE created_at >= NOW() - (days || ' days')::INTERVAL
    AND status NOT IN ('cancelled', 'refunded')
  )
  SELECT
    o.payment_method AS method,
    COUNT(*)::INTEGER AS count,
    COALESCE(SUM(o.total), 0) AS total,
    CASE WHEN to_total.total > 0 THEN ROUND((COUNT(*)::NUMERIC / to_total.total * 100)::NUMERIC, 1) ELSE 0 END AS percentage
  FROM public.orders o
  CROSS JOIN total_orders to_total
  WHERE o.created_at >= NOW() - (days || ' days')::INTERVAL
  AND o.status NOT IN ('cancelled', 'refunded')
  GROUP BY o.payment_method, to_total.total
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- 2.8 increment_voucher_usage
CREATE OR REPLACE FUNCTION public.increment_voucher_usage(
  voucher_id INTEGER
)
RETURNS VOID
SET search_path = ''
AS $$
BEGIN
  UPDATE public.vouchers
  SET usage_count = usage_count + 1
  WHERE id = voucher_id;
END;
$$ LANGUAGE plpgsql;

-- 2.9 get_top_products
CREATE OR REPLACE FUNCTION public.get_top_products(
  limit_count INTEGER DEFAULT 10,
  days INTEGER DEFAULT 30
)
RETURNS TABLE (
  product_id INTEGER,
  product_name TEXT,
  thumbnail TEXT,
  total_sold INTEGER,
  total_revenue NUMERIC
)
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.thumbnail,
    COALESCE(SUM(oi.quantity), 0)::INTEGER AS total_sold,
    COALESCE(SUM(oi.price * oi.quantity), 0) AS total_revenue
  FROM public.products p
  LEFT JOIN public.order_items oi ON oi.product_id = p.id
  LEFT JOIN public.orders o ON o.id = oi.order_id AND o.status NOT IN ('cancelled', 'refunded') AND o.created_at >= NOW() - (days || ' days')::INTERVAL
  GROUP BY p.id, p.name, p.thumbnail
  ORDER BY total_sold DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 2.10 get_order_timeline
CREATE OR REPLACE FUNCTION public.get_order_timeline(
  order_id TEXT
)
RETURNS TABLE (
  status TEXT,
  event_timestamp TIMESTAMPTZ,
  description TEXT
)
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.status,
    o.updated_at AS event_timestamp,
    CASE o.status
      WHEN 'pending' THEN 'Pesanan dibuat'
      WHEN 'paid' THEN 'Pembayaran diterima'
      WHEN 'processing' THEN 'Sedang diproses'
      WHEN 'shipped' THEN 'Dikirim'
      WHEN 'delivered' THEN 'Selesai'
      WHEN 'cancelled' THEN 'Dibatalkan'
      WHEN 'refunded' THEN 'Direfund'
      ELSE 'Status diperbarui'
    END AS description
  FROM public.orders o
  WHERE o.id = order_id;
END;
$$ LANGUAGE plpgsql;

-- 2.11 check_stock_availability
CREATE OR REPLACE FUNCTION public.check_stock_availability(
  product_id INTEGER,
  quantity INTEGER
)
RETURNS TABLE (
  available BOOLEAN,
  current_stock INTEGER,
  message TEXT
)
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE WHEN stock >= quantity THEN true ELSE false END AS available,
    stock AS current_stock,
    CASE
      WHEN stock >= quantity THEN 'Stok tersedia'
      WHEN stock > 0 THEN 'Stok tidak mencukup. Tersedia: ' || stock || ' unit'
      ELSE 'Stok habis'
    END AS message
  FROM public.products
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- 2.12 generate_order_id
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS TEXT
SET search_path = ''
AS $$
BEGIN
  RETURN 'TJ' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('public.order_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 2.13 get_recent_orders_admin
CREATE OR REPLACE FUNCTION public.get_recent_orders_admin(
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  order_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  product_names TEXT,
  total INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ,
  payment_method TEXT
)
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS order_id,
    p.full_name AS customer_name,
    p.email AS customer_email,
    STRING_AGG(DISTINCT pr.name, ', ') AS product_names,
    o.total,
    o.status,
    o.created_at,
    o.payment_method
  FROM public.orders o
  JOIN public.profiles p ON p.id = o.user_id
  JOIN public.order_items oi ON oi.order_id = o.id
  JOIN public.products pr ON pr.id = oi.product_id
  GROUP BY o.id, p.full_name, p.email, o.total, o.status, o.created_at, o.payment_method
  ORDER BY o.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 2.14 update_product_rating
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.products
  SET rating = (
    SELECT ROUND(AVG(rating)::NUMERIC, 1)
    FROM public.reviews
    WHERE product_id = NEW.product_id AND status = 'approved'
  )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PART 3: TRIGGERS
-- ============================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_product_rating_after_review
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ============================================================
-- PHASE 6: REALTIME NOTIFICATION TRIGGERS
-- ============================================================

-- 6.1 New order -> admin broadcast
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NULL,
    'order',
    'Pesanan baru masuk',
    'Pesanan ' || NEW.id || ' senilai Rp ' || NEW.total::TEXT || ' baru dibuat.',
    JSONB_BUILD_OBJECT('order_id', NEW.id, 'total', NEW.total, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_new_order ON public.orders;
CREATE TRIGGER trg_notify_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();

-- 6.2 Order status changed -> customer
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'order',
      'Status pesanan diperbarui',
      'Pesanan ' || NEW.id || ' sekarang ' || NEW.status || '.',
      JSONB_BUILD_OBJECT('order_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_order_status ON public.orders;
CREATE TRIGGER trg_notify_order_status
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

-- 6.3 Payment received -> customer
CREATE OR REPLACE FUNCTION public.notify_payment_received()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status
     AND NEW.payment_status = 'paid'
     AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'payment',
      'Pembayaran diterima',
      'Pembayaran untuk pesanan ' || NEW.id || ' telah kami terima.',
      JSONB_BUILD_OBJECT('order_id', NEW.id, 'payment_status', NEW.payment_status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_payment_received ON public.orders;
CREATE TRIGGER trg_notify_payment_received
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_payment_received();

-- 6.4 New review -> admin broadcast
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS TRIGGER
SET search_path = ''
AS $$
DECLARE
  product_name TEXT;
BEGIN
  SELECT name INTO product_name FROM public.products WHERE id = NEW.product_id;
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NULL,
    'review',
    'Ulasan baru masuk',
    'Produk ' || COALESCE(product_name, 'ID ' || NEW.product_id::TEXT) || ' mendapat ulasan ' || NEW.rating || ' bintang.',
    JSONB_BUILD_OBJECT('review_id', NEW.id, 'product_id', NEW.product_id, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_new_review ON public.reviews;
CREATE TRIGGER trg_notify_new_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_review();

-- 6.5 Low stock -> admin broadcast
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  IF NEW.stock < 10 AND (OLD.stock IS NULL OR OLD.stock >= 10) THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NULL,
      'stock',
      'Stok menipis',
      'Stok ' || NEW.name || ' tersisa ' || NEW.stock || ' unit.',
      JSONB_BUILD_OBJECT('product_id', NEW.id, 'stock', NEW.stock)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_low_stock ON public.products;
CREATE TRIGGER trg_notify_low_stock
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_low_stock();

-- ============================================================
-- PART 4: SEED DATA
-- ============================================================

-- 4.1 categories
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('Perawatan Tubuh', 'perawatan-tubuh', 'Produk perawatan tubuh berkualitas', '🧴', 1),
  ('Perawatan Rumah', 'perawatan-rumah', 'Pembersih dan perawatan rumah', '🏠', 2),
  ('Kesehatan', 'kesehatan', 'Produk kesehatan dan sanitasi', '💊', 3),
  ('Kecantikan', 'kecantikan', 'Produk kecantikan dan perawatan kulit', '💄', 4),
  ('Elektronik', 'elektronik', 'Perangkat elektronik rumah tangga', '🔌', 5),
  ('Lainnya', 'lainnya', 'Produk lainnya', '📦', 6);

-- 4.2 products
INSERT INTO public.products (
  name, slug, sku, description, short_description, category_id, brand,
  price, original_price, discount_percent, stock, unit, weight,
  dimensions, thumbnail, rating, sold_count, shipping_from, is_active, is_featured
) VALUES
  ('Sabun Cair Hera', 'sabun-cair-hera', 'HR-0001',
   'Sabun Cair Hera adalah pilihan terbaik untuk kebersihan tangan Anda.',
   'Formula lembut, aroma segar', 1, 'Hera Store', 25000, 31000, 20, 245, 'botol', 500,
   '{"length": 8, "width": 4, "height": 15}',
   'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80',
   4.8, 2300, 'Jakarta', true, true),
  ('Pembersih Lantai Premium', 'pembersih-lantai-premium', 'TRG-0002',
   'Pembersih lantai premium dengan formula khusus.',
   'Cocok untuk semua jenis lantai', 2, 'CleanPro', 28000, 35000, 20, 120, 'botol', 1000,
   '{"length": 10, "width": 5, "height": 20}',
   'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80',
   4.7, 1800, 'Jakarta', true, true),
  ('Hand Sanitizer', 'hand-sanitizer', 'TRG-0003',
   'Hand sanitizer dengan kandungan alkohol 70%.',
   'Efektif membunuh 99.9% kuman', 3, 'HealthGuard', 18000, 22000, 18, 500, 'botol', 250,
   '{"length": 6, "width": 3, "height": 12}',
   'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=400&q=80',
   4.9, 3200, 'Jakarta', true, true),
  ('Sabun Cuci Piring', 'sabun-cuci-piring', 'TRG-0004',
   'Sabun cuci piring aroma lemon segar.',
   'Formula anti minyak', 2, 'LemonFresh', 16000, 20000, 20, 300, 'botol', 400,
   '{"length": 7, "width": 4, "height": 14}',
   'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80',
   4.6, 1500, 'Jakarta', true, false),
  ('Pewangi Ruangan', 'pewangi-ruangan', 'TRG-0005',
   'Pewangi ruangan aroma ocean breeze.',
   'Tahan hingga 30 hari', 2, 'FreshAir', 22000, 28000, 21, 180, 'botol', 250,
   '{"length": 6, "width": 3, "height": 12}',
   'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80',
   4.8, 2100, 'Jakarta', true, false),
  ('Sampo Anti Ketombe', 'sampo-anti-ketombe', 'TRG-0006',
   'Sampo anti ketombe formula khusus.',
   'Rambut sehat bebas ketombe', 1, 'HairCare', 35000, 42000, 17, 150, 'botol', 170,
   '{"length": 5, "width": 3, "height": 15}',
   'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=400&q=80',
   4.5, 900, 'Jakarta', true, false),
  ('Lotion Pelembap', 'lotion-pelembap', 'TRG-0007',
   'Lotion pelembap dengan ekstrak alami.',
   'Kelembapan 24 jam', 4, 'SkinGlow', 45000, 55000, 18, 200, 'botol', 100,
   '{"length": 5, "width": 3, "height": 12}',
   'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
   4.7, 1200, 'Jakarta', true, false),
  ('Pembersih Kaca', 'pembersih-kaca', 'TRG-0008',
   'Pembersih kaca formula tanpa noda.',
   'Kilau sempurna', 2, 'ClearView', 19000, 24000, 21, 90, 'botol', 500,
   '{"length": 8, "width": 4, "height": 16}',
   'https://images.unsplash.com/photo-1565023946216-9e7f5c7bd2c3?auto=format&fit=crop&w=400&q=80',
   4.4, 800, 'Jakarta', true, false);

-- 4.3 product variants
INSERT INTO public.product_variants (product_id, name, price, stock, sku) VALUES
  (1, '500 ml', 25000, 100, 'TRG-0001-500'),
  (1, '1 Liter', 45000, 80, 'TRG-0001-1000'),
  (1, '2 Liter', 80000, 65, 'TRG-0001-2000'),
  (2, '1 Liter', 28000, 50, 'TRG-0002-1000'),
  (2, '2 Liter', 50000, 70, 'TRG-0002-2000'),
  (3, '100 ml', 8000, 200, 'TRG-0003-100'),
  (3, '250 ml', 18000, 150, 'TRG-0003-250'),
  (3, '500 ml', 32000, 150, 'TRG-0003-500'),
  (4, '400 ml', 16000, 150, 'TRG-0004-400'),
  (4, '800 ml', 28000, 150, 'TRG-0004-800'),
  (5, '250 ml', 22000, 100, 'TRG-0005-250'),
  (5, '500 ml', 38000, 80, 'TRG-0005-500'),
  (6, '170 ml', 35000, 80, 'TRG-0006-170'),
  (6, '340 ml', 60000, 70, 'TRG-0006-340'),
  (7, '100 ml', 45000, 100, 'TRG-0007-100'),
  (7, '200 ml', 80000, 100, 'TRG-0007-200'),
  (8, '500 ml', 19000, 90, 'TRG-0008-500');

-- 4.4 vouchers
INSERT INTO public.vouchers (code, type, value, min_order, max_discount, usage_limit, valid_from, valid_until) VALUES
  ('TRIGUNA10', 'percentage', 10, 50000, 50000, 500, NOW(), NOW() + INTERVAL '30 days'),
  ('GRATIS5K', 'fixed', 5000, 30000, 5000, 100, NOW(), NOW() + INTERVAL '20 days'),
  ('NEWUSER', 'percentage', 15, 100000, 50000, 999999, NOW(), NOW() + INTERVAL '365 days'),
  ('FLASH20', 'percentage', 20, 100000, 100000, 200, NOW(), NOW() + INTERVAL '7 days');

-- 4.5 flash sales
INSERT INTO public.flash_sales (name, description, starts_at, ends_at) VALUES
  ('Flash Sale Akhir Pekan', 'Diskon spesial akhir pekan', NOW(), NOW() + INTERVAL '2 days'),
  ('Flash Sale Tengah Bulan', 'Penawaran menarik tengah bulan', NOW() + INTERVAL '30 days', NOW() + INTERVAL '32 days');

INSERT INTO public.flash_sale_items (flash_sale_id, product_id, flash_price, flash_stock) VALUES
  (1, 1, 20000, 50),
  (1, 2, 22000, 30),
  (1, 3, 15000, 40),
  (1, 4, 13000, 60),
  (1, 5, 18000, 40);

-- 4.6 store settings
INSERT INTO public.store_settings (
  name, description, email, phone, address, city, province, postal_code,
  warehouse_address, operating_hours, social_media, shipping_couriers,
  payment_methods, free_shipping_enabled, free_shipping_min_order, payment_time_limit,
  bank_accounts
) VALUES (
  'Hera Store',
  'Marketplace produk rumah tangga premium',
  'admin@herastore.com',
  '6281234567890',
  'Jl. Mawar No. 10',
  'Jakarta Selatan',
  'DKI Jakarta',
  '12345',
  'Jl. Mawar No. 10, Jakarta Selatan',
  '{"monday": "08:00-17:00", "tuesday": "08:00-17:00", "wednesday": "08:00-17:00", "thursday": "08:00-17:00", "friday": "08:00-17:00", "saturday": "09:00-15:00", "sunday": "closed"}',
  '{"instagram": "https://instagram.com/herastore", "tiktok": "https://tiktok.com/@herastore", "facebook": "https://facebook.com/herastore"}',
  '["JNE", "J&T", "SiCepat", "Gosend", "Anteraja"]',
  '["transfer_bank", "gopay", "ovo", "dana", "shopeepay", "virtual_account", "cod"]',
  true,
  100000,
  24,
  '[{"bank": "BCA", "account_name": "PT Hera Store", "account_number": "1234567890"}, {"bank": "Mandiri", "account_name": "PT Hera Store", "account_number": "0987654321"}]'
);

-- ============================================================
-- PART 5: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_qna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- products
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Only admins can insert products" ON public.products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Only admins can update products" ON public.products FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Only admins can delete products" ON public.products FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- addresses
CREATE POLICY "Users can view their own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- cart items
CREATE POLICY "Users can view their own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add items to their cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending', 'paid')) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any order" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- order items
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users can insert order items for their orders" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY "Admins can insert any order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- wishlists
CREATE POLICY "Users can view their own wishlist" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own wishlist" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from their own wishlist" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- reviews
CREATE POLICY "Approved reviews are viewable by everyone" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins can view all reviews" ON public.reviews FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users can view own reviews" ON public.reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create reviews for their own orders" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.orders o JOIN public.order_items oi ON oi.order_id = o.id WHERE o.user_id = auth.uid() AND oi.product_id = reviews.product_id AND o.status = 'delivered'));
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any review" ON public.reviews FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- vouchers
CREATE POLICY "Vouchers are viewable by everyone" ON public.vouchers FOR SELECT USING (true);
CREATE POLICY "Only admins can manage vouchers" ON public.vouchers FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- flash sales
CREATE POLICY "Flash sales are viewable by everyone" ON public.flash_sales FOR SELECT USING (true);
CREATE POLICY "Flash sale items are viewable by everyone" ON public.flash_sale_items FOR SELECT USING (true);
CREATE POLICY "Only admins can manage flash sales" ON public.flash_sales FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Only admins can manage flash sale items" ON public.flash_sale_items FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- store settings
CREATE POLICY "Store settings are viewable by everyone" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can update store settings" ON public.store_settings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark notifications as read" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- product variants
CREATE POLICY "Product variants are viewable by everyone" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Only admins can manage variants" ON public.product_variants FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- admin_invitations
CREATE POLICY "Admins can view invitations" ON public.admin_invitations FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can create invitations" ON public.admin_invitations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can update invitations" ON public.admin_invitations FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- product_qna
CREATE POLICY "Product Q&A is viewable by everyone" ON public.product_qna FOR SELECT USING (true);
CREATE POLICY "Authenticated users can ask questions" ON public.product_qna FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own questions" ON public.product_qna FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can answer questions" ON public.product_qna FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- newsletter_subscribers
CREATE POLICY "Newsletter subscribers are viewable by admins" ON public.newsletter_subscribers FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Anyone can insert newsletter subscribers" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- ============================================================
-- PART 6: STORAGE BUCKETS & POLICIES
-- ============================================================

-- 6.1 Create buckets (public = true so public URLs work)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('avatars', 'avatars', true),
  ('payment-proofs', 'payment-proofs', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 6.2 Policies: product-images
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Allow public reads" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'product-images');
CREATE POLICY "Allow authenticated reads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- 6.3 Policies: avatars
CREATE POLICY "Allow authenticated avatar uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Allow public avatar reads" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'avatars');
CREATE POLICY "Allow authenticated avatar reads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Allow authenticated avatar deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

-- 6.4 Policies: payment-proofs
CREATE POLICY "Allow authenticated payment proof uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "Allow public payment proof reads" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'payment-proofs');
CREATE POLICY "Allow authenticated payment proof reads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payment-proofs');
CREATE POLICY "Allow authenticated payment proof deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'payment-proofs');

-- 6.5 Policies: banners
CREATE POLICY "Allow authenticated banner uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Allow public banner reads" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'banners');
CREATE POLICY "Allow authenticated banner reads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'banners');
CREATE POLICY "Allow authenticated banner deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners');

-- ============================================================
-- DONE!
-- ============================================================
SELECT 'Hera Store database initialized successfully!' AS status;
