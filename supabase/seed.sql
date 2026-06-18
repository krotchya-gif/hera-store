-- ============================================================
-- hera store — seed data
-- ============================================================
-- run this after schema.sql to populate initial data
-- ============================================================

-- ============================================================
-- categories
-- ============================================================
insert into public.categories (name, slug, description, icon, sort_order) values
  ('Perawatan Tubuh', 'perawatan-tubuh', 'Produk perawatan tubuh berkualitas', '🧴', 1),
  ('Perawatan Rumah', 'perawatan-rumah', 'Pembersih dan perawatan rumah', '🏠', 2),
  ('Kesehatan', 'kesehatan', 'Produk kesehatan dan sanitasi', '💊', 3),
  ('Kecantikan', 'kecantikan', 'Produk kecantikan dan perawatan kulit', '💄', 4),
  ('Elektronik', 'elektronik', 'Perangkat elektronik rumah tangga', '🔌', 5),
  ('Lainnya', 'lainnya', 'Produk lainnya', '📦', 6);

-- ============================================================
-- products
-- ============================================================
insert into public.products (
  name, slug, sku, description, short_description, category_id, brand,
  price, original_price, discount_percent, stock, unit, weight,
  dimensions, thumbnail, rating, sold_count, shipping_from, is_active, is_featured
) values
  (
    'Sabun Cair Triguna', 'sabun-cair-triguna', 'TRG-0001',
    'Sabun Cair Triguna adalah pilihan terbaik untuk kebersihan tangan Anda. Diformulasikan dengan bahan-bahan alami yang lembut di kulit.',
    'Formula lembut, aroma segar, aman untuk semua jenis kulit',
    1, 'Triguna', 25000, 31000, 20, 245, 'botol', 500,
    '{"length": 8, "width": 4, "height": 15}',
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=400&q=80',
    4.8, 2300, 'Jakarta', true, true
  ),
  (
    'Pembersih Lantai Premium', 'pembersih-lantai-premium', 'TRG-0002',
    'Pembersih lantai premium dengan formula khusus untuk berbagai jenis lantai. Membersihkan noda membandel dan memberikan kilau alami.',
    'Cocok untuk semua jenis lantai, formula anti bakteri',
    2, 'CleanPro', 28000, 35000, 20, 120, 'botol', 1000,
    '{"length": 10, "width": 5, "height": 20}',
    'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80',
    4.7, 1800, 'Jakarta', true, true
  ),
  (
    'Hand Sanitizer Antibakteri', 'hand-sanitizer-antibakteri', 'TRG-0003',
    'Hand sanitizer dengan kandungan alkohol 70% yang efektif membunuh 99.9% kuman dan bakteri.',
    'Kandungan alkohol 70%, efektif membunuh kuman',
    3, 'HealthGuard', 18000, 22000, 18, 500, 'botol', 250,
    '{"length": 6, "width": 3, "height": 12}',
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=400&q=80',
    4.9, 3200, 'Jakarta', true, true
  ),
  (
    'Sabun Cuci Piring Lemon', 'sabun-cuci-piring-lemon', 'TRG-0004',
    'Sabun cuci piring dengan aroma lemon segar. Formula anti minyak yang kuat namun tetap lembut di tangan.',
    'Aroma lemon segar, formula anti minyak, lembut di tangan',
    2, 'LemonFresh', 16000, 20000, 20, 300, 'botol', 400,
    '{"length": 7, "width": 4, "height": 14}',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80',
    4.6, 1500, 'Jakarta', true, false
  ),
  (
    'Pewangi Ruangan Ocean Breeze', 'pewangi-ruangan-ocean-breeze', 'TRG-0005',
    'Pewangi ruangan dengan aroma ocean breeze yang menenangkan. Tahan lama hingga 30 hari.',
    'Aroma ocean breeze menenangkan, tahan hingga 30 hari',
    2, 'FreshAir', 22000, 28000, 21, 180, 'botol', 250,
    '{"length": 6, "width": 3, "height": 12}',
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=400&q=80',
    4.8, 2100, 'Jakarta', true, false
  ),
  (
    'Sampo Anti Ketombe', 'sampo-anti-ketombe', 'TRG-0006',
    'Sampo anti ketombe dengan formula khusus untuk menghilangkan ketombe dan mencegahnya kembali.',
    'Formula anti ketombe, menghilangkan gatal, rambut sehat',
    1, 'HairCare', 35000, 42000, 17, 150, 'botol', 170,
    '{"length": 5, "width": 3, "height": 15}',
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=400&q=80',
    4.5, 900, 'Jakarta', true, false
  ),
  (
    'Lotion Pelembap Kulit', 'lotion-pelembap-kulit', 'TRG-0007',
    'Lotion pelembap kulit dengan ekstrak alami yang menjaga kelembapan kulit sepanjang hari.',
    'Ekstrak alami, menjaga kelembapan 24 jam, non-greasy',
    4, 'SkinGlow', 45000, 55000, 18, 200, 'botol', 100,
    '{"length": 5, "width": 3, "height": 12}',
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=400&q=80',
    4.7, 1200, 'Jakarta', true, false
  ),
  (
    'Pembersih Kaca', 'pembersih-kaca', 'TRG-0008',
    'Pembersih kaca dengan formula tanpa noda yang memberikan hasil bersih sempurna.',
    'Formula tanpa noda, kilau sempurna, tidak meninggalkan residu',
    2, 'ClearView', 19000, 24000, 21, 90, 'botol', 500,
    '{"length": 8, "width": 4, "height": 16}',
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=400&q=80',
    4.4, 800, 'Jakarta', true, false
  );

-- ============================================================
-- product variants
-- ============================================================
insert into public.product_variants (product_id, name, price, stock, sku) values
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

-- ============================================================
-- vouchers
-- ============================================================
insert into public.vouchers (code, type, value, min_order, max_discount, usage_limit, valid_from, valid_until) values
  ('TRIGUNA10', 'percentage', 10, 50000, 50000, 500, now(), now() + interval '30 days'),
  ('GRATIS5K', 'fixed', 5000, 30000, 5000, 100, now(), now() + interval '20 days'),
  ('NEWUSER', 'percentage', 15, 100000, 50000, 999999, now(), now() + interval '365 days'),
  ('FLASH20', 'percentage', 20, 100000, 100000, 200, now(), now() + interval '7 days');

-- ============================================================
-- flash sales
-- ============================================================
insert into public.flash_sales (name, description, starts_at, ends_at) values
  ('Flash Sale Akhir Pekan', 'Diskon spesial akhir pekan untuk produk pembersih', now(), now() + interval '2 days'),
  ('Flash Sale Tengah Bulan', 'Penawaran menarik tengah bulan Juli', now() + interval '30 days', now() + interval '32 days');

insert into public.flash_sale_items (flash_sale_id, product_id, flash_price, flash_stock) values
  (1, 1, 20000, 50),
  (1, 2, 22000, 30),
  (1, 3, 15000, 40),
  (1, 4, 13000, 60),
  (1, 5, 18000, 40);

-- ============================================================
-- store settings
-- ============================================================
insert into public.store_settings (
  name, description, email, phone, address, city, province, postal_code,
  warehouse_address, operating_hours, social_media, shipping_couriers,
  payment_methods, free_shipping_enabled, free_shipping_min_order, payment_time_limit,
  bank_accounts
) values (
  'Hera Store',
  'Marketplace produk rumah tangga premium dengan kualitas terjamin',
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
-- dummy users (for testing - create via auth signup in real app)
-- ============================================================
-- note: these users would be created via supabase auth ui
-- the profiles are auto-created by trigger

-- ============================================================
-- dummy orders (for testing)
-- ============================================================
-- orders would be created via checkout flow
