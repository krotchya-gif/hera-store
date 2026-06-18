import React, { createContext, useContext, useState, useCallback } from 'react';

const ComparisonContext = createContext();

export function ComparisonProvider({ children }) {
  const [compareItems, setCompareItems] = useState([]);

  const addToCompare = useCallback((product) => {
    setCompareItems(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev;
      }
      if (prev.length >= 4) {
        alert('Maksimal 4 produk untuk dibandingkan');
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId) => {
    setCompareItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const isInCompare = useCallback((productId) => {
    return compareItems.some(item => item.id === productId);
  }, [compareItems]);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  return (
    <ComparisonContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
