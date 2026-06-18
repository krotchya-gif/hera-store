import { supabase } from './supabase'

// ============================================================
// PRODUCTS
// ============================================================

export const getProducts = async (filters = {}) => {
  let query = supabase.from('products').select('*, categories(name)')

  if (filters.category) query = query.eq('category_id', filters.category)
  if (filters.minPrice) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters.rating) query = query.gte('rating', filters.rating)
  if (filters.search) query = query.ilike('name', `%${filters.search}%`)

  if (filters.sort) {
    const [column, order] = filters.sort.split('.')
    query = query.order(column, { ascending: order === 'asc' })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (filters.limit) query = query.limit(filters.limit)
  if (filters.offset !== undefined && filters.limit) {
    query = query.range(filters.offset, filters.offset + filters.limit - 1)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getProductsCount = async (filters = {}) => {
  let query = supabase.from('products').select('*', { count: 'exact', head: true })

  if (filters.category) query = query.eq('category_id', filters.category)
  if (filters.minPrice) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters.rating) query = query.gte('rating', filters.rating)
  if (filters.search) query = query.ilike('name', `%${filters.search}%`)

  const { count, error } = await query
  if (error) throw error
  return count || 0
}

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), product_variants(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createProduct = async (product) => {
  const { data, error } = await supabase.from('products').insert(product).select().single()
  if (error) throw error
  return data
}

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  return true
}

export const toggleProductStatus = async (id, isActive) => {
  const { data, error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ============================================================
// CATEGORIES
// ============================================================

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name')
  if (error) throw error
  return data
}

export const createCategory = async (category) => {
  const payload = {
    ...category,
    slug: category.slug || slugify(category.name)
  }
  const { data, error } = await supabase.from('categories').insert(payload).select().single()
  if (error) throw error
  return data
}

export const updateCategory = async (id, updates) => {
  const payload = { ...updates }
  if (updates.name && !updates.slug) payload.slug = slugify(updates.name)
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteCategory = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
  return true
}

// ============================================================
// CART
// ============================================================

export const getCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const addToCart = async (userId, productId, quantity, variant) => {
  // Check if already in cart
  let query = supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (variant === null || variant === undefined) {
    query = query.is('variant', null)
  } else {
    query = query.eq('variant', variant)
  }

  const { data: existing } = await query.maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity, variant })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export const updateCartItem = async (id, updates) => {
  const { data, error } = await supabase.from('cart_items').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const removeCartItem = async (id) => {
  const { error } = await supabase.from('cart_items').delete().eq('id', id)
  if (error) throw error
  return true
}

export const clearCart = async (userId) => {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId)
  if (error) throw error
  return true
}

// ============================================================
// ORDERS
// ============================================================

export const createOrder = async (orderData, items, cartItemIds = []) => {
  // Normalize frontend field names to schema columns
  const payload = {
    ...orderData,
    discount_amount:
      orderData.discount_amount !== undefined
        ? orderData.discount_amount
        : orderData.discount,
    shipping_method:
      orderData.shipping_method !== undefined
        ? orderData.shipping_method
        : orderData.shipping_courier,
  }
  // Remove legacy keys
  delete payload.discount
  delete payload.shipping_courier

  // Start transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single()
  if (orderError) throw orderError

  // Insert order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    variant: item.variant
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) throw itemsError

  // Reduce stock
  for (const item of items) {
    const { error: stockError } = await supabase.rpc('decrement_stock', {
      product_id: item.product_id,
      amount: item.quantity
    })
    if (stockError) throw stockError
  }

  // Clear only checked-out cart items (if ids provided)
  if (cartItemIds.length > 0) {
    const { error: cartError } = await supabase.from('cart_items').delete().in('id', cartItemIds)
    if (cartError) throw cartError
  }

  // Increment voucher usage count if applicable
  if (payload.voucher_code) {
    try {
      const { data: voucher } = await supabase
        .from('vouchers')
        .select('id')
        .eq('code', payload.voucher_code)
        .maybeSingle()
      if (voucher) {
        await supabase.rpc('increment_voucher_usage', { voucher_id: voucher.id })
      }
    } catch (e) {
      console.error('Failed to increment voucher usage:', e)
    }
  }

  return order
}

export const getOrders = async (userId, status) => {
  let query = supabase.from('orders').select('*, order_items(*, products(name, thumbnail))').eq('user_id', userId)
  if (status) query = query.eq('status', status)
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getAllOrders = async (filters = {}) => {
  let query = supabase.from('orders').select('*, order_items(*, products(name, thumbnail)), profiles(full_name, email, phone)')
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo)
  if (filters.search) query = query.or(`id.ilike.%${filters.search}%, profiles.full_name.ilike.%${filters.search}%`)

  query = query.order('created_at', { ascending: false })

  if (filters.limit) query = query.limit(filters.limit)
  if (filters.offset) query = query.range(filters.offset, filters.offset + filters.limit - 1)

  const { data, error } = await query
  if (error) throw error
  return data
}

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const updateOrderTracking = async (id, trackingNumber) => {
  const { data, error } = await supabase.from('orders').update({ tracking_number: trackingNumber }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const cancelOrder = async (id) => {
  const { data, error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const updateOrderPaymentProof = async (id, paymentProofUrl) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_proof: paymentProofUrl, payment_status: 'paid' })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// ADDRESSES
// ============================================================

export const getAddresses = async (userId) => {
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false })
  if (error) throw error
  return data
}

export const createAddress = async (address) => {
  const { data, error } = await supabase.from('addresses').insert(address).select().single()
  if (error) throw error
  return data
}

export const updateAddress = async (id, updates) => {
  const { data, error } = await supabase.from('addresses').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteAddress = async (id) => {
  const { error } = await supabase.from('addresses').delete().eq('id', id)
  if (error) throw error
  return true
}

export const setDefaultAddress = async (userId, addressId) => {
  // Unset current default
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId).eq('is_default', true)
  // Set new default
  const { data, error } = await supabase.from('addresses').update({ is_default: true }).eq('id', addressId).select().single()
  if (error) throw error
  return data
}

// ============================================================
// WISHLIST
// ============================================================

export const getWishlist = async (userId) => {
  const { data, error } = await supabase.from('wishlists').select('*, products(*)').eq('user_id', userId)
  if (error) throw error
  return data
}

export const addToWishlist = async (userId, productId) => {
  const { data, error } = await supabase.from('wishlists').insert({ user_id: userId, product_id: productId }).select().single()
  if (error) throw error
  return data
}

export const removeFromWishlist = async (id) => {
  const { error } = await supabase.from('wishlists').delete().eq('id', id)
  if (error) throw error
  return true
}

// ============================================================
// REVIEWS
// ============================================================

export const getReviews = async (productId, limit = null, offset = 0) => {
  let query = supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar), products(name, thumbnail)')
    .order('created_at', { ascending: false })

  if (productId) query = query.eq('product_id', productId)

  if (limit !== null && limit !== undefined) {
    query = query.range(offset, offset + limit - 1)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const createReview = async (review) => {
  const { data, error } = await supabase.from('reviews').insert(review).select().single()
  if (error) throw error
  return data
}

export const updateReviewStatus = async (id, status) => {
  const { data, error } = await supabase.from('reviews').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const replyReview = async (id, adminReply) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ admin_reply: adminReply })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteReview = async (id) => {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
  return true
}

export const getProductRating = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
  if (error) throw error
  const avg = data.length ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0
  return { average: Math.round(avg * 10) / 10, count: data.length }
}

// ============================================================
// VOUCHERS
// ============================================================

export const getVouchers = async (active = true) => {
  let query = supabase.from('vouchers').select('*')
  if (active) query = query.eq('is_active', true).gte('valid_until', new Date().toISOString())
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const validateVoucher = async (code, orderTotal) => {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .gte('valid_until', new Date().toISOString())
    .lte('min_order', orderTotal)
    .single()
  if (error) throw error
  if (data && data.usage_limit !== null && data.usage_count >= data.usage_limit) {
    return null
  }
  return data
}

export const createVoucher = async (voucher) => {
  // Map frontend field names to actual schema columns
  const payload = {
    code: voucher.code,
    type: voucher.discount_type || voucher.type,
    value: Number(voucher.discount_value || voucher.value || 0),
    min_order: Number(voucher.min_order || 0),
    usage_limit: voucher.max_uses ? Number(voucher.max_uses) : null,
    valid_from: voucher.valid_from ? new Date(voucher.valid_from).toISOString() : new Date().toISOString(),
    valid_until: voucher.valid_until ? new Date(voucher.valid_until).toISOString() : null,
    applicable_products: voucher.applicable_products || '[]',
    is_active: voucher.is_active !== undefined ? voucher.is_active : true
  }

  const { data, error } = await supabase.from('vouchers').insert(payload).select().single()
  if (error) throw error
  return data
}

export const updateVoucher = async (id, updates) => {
  const payload = { ...updates }
  if (updates.discount_type !== undefined) payload.type = updates.discount_type
  if (updates.discount_value !== undefined) payload.value = Number(updates.discount_value)
  if (updates.max_uses !== undefined) payload.usage_limit = updates.max_uses ? Number(updates.max_uses) : null

  const { data, error } = await supabase.from('vouchers').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ============================================================
// FLASH SALES
// ============================================================

export const getFlashSales = async (active = true) => {
  const now = new Date().toISOString()
  let query = supabase.from('flash_sales').select('*, flash_sale_items(*, products(*))')
  if (active) query = query.lte('starts_at', now).gte('ends_at', now)
  const { data, error } = await query.order('starts_at', { ascending: false })
  if (error) throw error
  return data
}

export const createFlashSale = async (flashSale) => {
  const { data, error } = await supabase.from('flash_sales').insert(flashSale).select().single()
  if (error) throw error
  return data
}

// ============================================================
// USERS / PROFILES
// ============================================================

export const getProfile = async (userId) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) throw error
  return data
}

export const getAllUsers = async (role) => {
  let query = supabase.from('profiles').select('*')
  if (role) query = query.eq('role', role)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const updateUserRole = async (userId, role) => {
  const { data, error } = await supabase.from('profiles').update({ role }).eq('id', userId).select().single()
  if (error) throw error
  return data
}

// ============================================================
// STORE SETTINGS
// ============================================================

export const getStoreSettings = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').single()
  if (error) throw error
  return data
}

export const updateStoreSettings = async (updates) => {
  const { data, error } = await supabase.from('store_settings').update(updates).eq('id', 1).select().single()
  if (error) throw error
  return data
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export const getNotifications = async (userId, limit = 20) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (userId) query = query.or(`user_id.eq.${userId},user_id.is.null`)
  else query = query.is('user_id', null)
  const { data, error } = await query
  if (error) throw error
  return data
}

export const createNotification = async (notification) => {
  const { data, error } = await supabase.from('notifications').insert(notification).select().single()
  if (error) throw error
  return data
}

export const createNotificationForAdmins = async (title, message, type = 'order') => {
  const { data: admins, error: adminError } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'super_admin'])
  if (adminError) throw adminError
  if (!admins || admins.length === 0) return []

  const notifications = admins.map(a => ({
    user_id: a.id,
    title,
    message,
    type,
    is_read: false
  }))

  const { data, error } = await supabase.from('notifications').insert(notifications).select()
  if (error) throw error
  return data
}

export const markNotificationRead = async (id) => {
  const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const getLowStockProducts = async (threshold = 10) => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock, thumbnail')
    .lt('stock', threshold)
    .order('stock', { ascending: true })
  if (error) throw error
  return data
}

// ============================================================
// ADMIN INVITATIONS
// ============================================================

export const getAdminInvitations = async () => {
  const { data, error } = await supabase
    .from('admin_invitations')
    .select('*, inviter:profiles(full_name, email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createAdminInvitation = async (invitation) => {
  const token = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`
  const { data, error } = await supabase
    .from('admin_invitations')
    .insert({ ...invitation, token })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateInvitationStatus = async (id, status) => {
  const { data, error } = await supabase.from('admin_invitations').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ============================================================
// ANALYTICS / DASHBOARD
// ============================================================

export const getDashboardStats = async (period = '30days') => {
  const { data, error } = await supabase.rpc('get_dashboard_stats', { period })
  if (error) throw error
  // Transform array of { metric, value, change_percent } into flat object
  const stats = {}
  if (Array.isArray(data)) {
    data.forEach(row => {
      const key = row.metric
      stats[key] = Number(row.value) || 0
      stats[key.replace('total_', '') + '_change'] = (row.change_percent >= 0 ? '+' : '') + (Number(row.change_percent) || 0) + '%'
    })
  }
  // Map total_items_sold -> total_products_sold for frontend compatibility
  if (stats.total_items_sold !== undefined) {
    stats.total_products_sold = stats.total_items_sold
  }
  return stats
}

export const getSalesData = async (days = 30) => {
  const { data, error } = await supabase.rpc('get_sales_data', { days })
  if (error) throw error
  // Map sale_date -> date, revenue -> penjualan for frontend compatibility
  if (Array.isArray(data)) {
    return data.map(row => ({
      date: row.sale_date || '',
      penjualan: Number(row.revenue) || 0
    }))
  }
  return data
}

export const getCategorySales = async () => {
  const { data, error } = await supabase.rpc('get_category_sales')
  if (error) throw error
  // Map category_name -> name, sales -> value, and add colors
  const categoryColors = ['#16A34A', '#15803D', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0', '#6B7280', '#9CA3AF']
  if (Array.isArray(data)) {
    return data.map((row, idx) => ({
      name: row.category_name || '',
      value: Number(row.sales) || 0,
      color: categoryColors[idx % categoryColors.length]
    }))
  }
  return data
}

export const getPaymentMethods = async (period = '30days') => {
  const { data, error } = await supabase.rpc('get_payment_methods', { period })
  if (error) throw error
  return data
}

export const subscribeNewsletter = async (email) => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })
    .select()
    .single()
  if (error) throw error
  return data
}
