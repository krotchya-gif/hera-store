import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, addToWishlist as addToWishlistAPI, removeFromWishlist as removeFromWishlistAPI } from '../lib/api';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'hera_wishlist';

function normalizeWishlistItem(item, product) {
  return {
    ...product,
    wishlist_id: item.id
  };
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [initialized, setInitialized] = useState(false);

  // Persist anonymous wishlist to localStorage
  useEffect(() => {
    if (!user?.id) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, user?.id]);

  // Sync wishlist with Supabase when user is logged in
  useEffect(() => {
    if (!user?.id) {
      setInitialized(true);
      return;
    }

    const syncWishlist = async () => {
      try {
        const data = await getWishlist(user.id);
        const serverWishlist = (data || []).map((row) => normalizeWishlistItem(row, row.products));
        setWishlist(serverWishlist);
      } catch (error) {
        console.error('Error syncing wishlist:', error);
      } finally {
        setInitialized(true);
      }
    };

    syncWishlist();
  }, [user?.id]);

  const addToWishlist = async (product) => {
    if (!product?.id) return;

    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });

    if (user?.id) {
      try {
        const data = await addToWishlistAPI(user.id, product.id);
        setWishlist((prev) =>
          prev.map((item) =>
            item.id === product.id && !item.wishlist_id
              ? { ...item, wishlist_id: data.id }
              : item
          )
        );
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        // Rollback optimistic update
        setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      }
    }
  };

  const removeFromWishlist = async (id) => {
    const itemToRemove = wishlist.find((item) => item.id === id);
    if (!itemToRemove) return;

    setWishlist((prev) => prev.filter((item) => item.id !== id));

    if (user?.id && itemToRemove.wishlist_id) {
      try {
        await removeFromWishlistAPI(itemToRemove.wishlist_id);
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        // Rollback optimistic update
        setWishlist((prev) => [...prev, itemToRemove]);
      }
    }
  };

  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        initialized
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
