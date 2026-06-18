-- ============================================================
-- hera store — row level security (rls) policies
-- ============================================================
-- run this in supabase sql editor after schema.sql
-- ============================================================

-- enable rls on all tables
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;
alter table public.vouchers enable row level security;
alter table public.flash_sales enable row level security;
alter table public.flash_sale_items enable row level security;
alter table public.store_settings enable row level security;
alter table public.notifications enable row level security;
alter table public.product_variants enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ============================================================
-- 1. profiles
-- ============================================================
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- admin can update any profile
create policy "Admins can update any profile"
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 2. products
-- ============================================================
create policy "Products are viewable by everyone"
  on public.products for select using (true);

create policy "Only admins can insert products"
  on public.products for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Only admins can update products"
  on public.products for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Only admins can delete products"
  on public.products for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 3. categories
-- ============================================================
create policy "Categories are viewable by everyone"
  on public.categories for select using (true);

create policy "Only admins can manage categories"
  on public.categories for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 4. addresses
-- ============================================================
create policy "Users can view their own addresses"
  on public.addresses for select using (auth.uid() = user_id);

create policy "Users can insert their own addresses"
  on public.addresses for insert with check (auth.uid() = user_id);

create policy "Users can update their own addresses"
  on public.addresses for update using (auth.uid() = user_id);

create policy "Users can delete their own addresses"
  on public.addresses for delete using (auth.uid() = user_id);

-- ============================================================
-- 5. cart items
-- ============================================================
create policy "Users can view their own cart"
  on public.cart_items for select using (auth.uid() = user_id);

create policy "Users can add items to their cart"
  on public.cart_items for insert with check (auth.uid() = user_id);

create policy "Users can update their own cart"
  on public.cart_items for update using (auth.uid() = user_id);

create policy "Users can delete their own cart items"
  on public.cart_items for delete using (auth.uid() = user_id);

-- ============================================================
-- 6. orders
-- ============================================================
create policy "Users can view their own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Users can create their own orders"
  on public.orders for insert with check (auth.uid() = user_id);

create policy "Users can cancel their own orders"
  on public.orders for update using (
    auth.uid() = user_id and status in ('pending', 'paid')
  );

create policy "Admins can update any order"
  on public.orders for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 7. order items
-- ============================================================
create policy "Users can view their own order items"
  on public.order_items for select using (
    exists (select 1 from public.orders where id = order_items.order_id and user_id = auth.uid())
  );

create policy "Admins can view all order items"
  on public.order_items for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Users can insert order items for their orders"
  on public.order_items for insert with check (
    exists (select 1 from public.orders where id = order_items.order_id and user_id = auth.uid())
  );

create policy "Admins can insert any order items"
  on public.order_items for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 8. wishlists
-- ============================================================
create policy "Users can view their own wishlist"
  on public.wishlists for select using (auth.uid() = user_id);

create policy "Users can add to their own wishlist"
  on public.wishlists for insert with check (auth.uid() = user_id);

create policy "Users can remove from their own wishlist"
  on public.wishlists for delete using (auth.uid() = user_id);

-- ============================================================
-- 9. reviews
-- ============================================================
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (is_approved = true);

create policy "Admins can view all reviews"
  on public.reviews for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Users can create reviews for their own orders"
  on public.reviews for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid() and oi.product_id = reviews.product_id and o.status = 'delivered'
    )
  );

create policy "Users can update their own reviews"
  on public.reviews for update using (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

create policy "Admins can update any review"
  on public.reviews for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 10. vouchers
-- ============================================================
create policy "Vouchers are viewable by everyone"
  on public.vouchers for select using (true);

create policy "Only admins can manage vouchers"
  on public.vouchers for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 11. flash sales
-- ============================================================
create policy "Flash sales are viewable by everyone"
  on public.flash_sales for select using (true);

create policy "Flash sale items are viewable by everyone"
  on public.flash_sale_items for select using (true);

create policy "Only admins can manage flash sales"
  on public.flash_sales for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Only admins can manage flash sale items"
  on public.flash_sale_items for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 12. store settings
-- ============================================================
create policy "Store settings are viewable by everyone"
  on public.store_settings for select using (true);

create policy "Only admins can update store settings"
  on public.store_settings for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 13. notifications
-- ============================================================
create policy "Users can view their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can mark notifications as read"
  on public.notifications for update using (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on public.notifications for delete using (auth.uid() = user_id);

-- system can insert notifications
create policy "System can insert notifications"
  on public.notifications for insert with check (true);

-- ============================================================
-- 14. admin invitations
-- ============================================================
alter table public.admin_invitations enable row level security;

create policy "Admins can view invitations"
  on public.admin_invitations for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins can create invitations"
  on public.admin_invitations for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins can update invitations"
  on public.admin_invitations for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 15. product variants
-- ============================================================
create policy "Product variants are viewable by everyone"
  on public.product_variants for select using (true);

create policy "Only admins can manage variants"
  on public.product_variants for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 16. newsletter_subscribers
-- ============================================================
create policy "Newsletter subscribers are viewable by admins"
  on public.newsletter_subscribers for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Anyone can insert newsletter subscribers"
  on public.newsletter_subscribers for insert with check (true);

