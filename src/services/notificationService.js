import { supabase } from '../lib/supabase';

// ============================================================
// REALTIME NOTIFICATIONS
// ============================================================

export const subscribeToOrders = (userId, callback) => {
  const subscription = supabase
    .channel('orders-channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: userId ? `user_id=eq.${userId}` : undefined
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToCart = (userId, callback) => {
  const subscription = supabase
    .channel('cart-channel')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: userId ? `user_id=eq.${userId}` : undefined
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToProducts = (callback) => {
  const subscription = supabase
    .channel('products-channel')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToNotifications = (userId, callback) => {
  const subscription = supabase
    .channel('notifications-channel')
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
        const n = payload.new;
        const isMine = n.user_id === userId;
        const isBroadcast = n.user_id === null;
        if (isMine || isBroadcast) callback(n);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const createNotification = async (userId, title, message, type = 'order') => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
      is_read: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
};

export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${userId},user_id.is.null`)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
};
