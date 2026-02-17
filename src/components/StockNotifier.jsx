
import React, { useEffect } from 'react';
import { useVendas } from '../hooks/useVendas';
import { requestNotificationPermission, checkLowStock } from '../utils/notificationUtils';

export default function StockNotifier() {
  const { produtos } = useVendas();

  useEffect(() => {
    // Request permission on mount
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (produtos && produtos.length > 0) {
      // Small delay to ensure DB is ready and avoid spam
      const timer = setTimeout(() => {
        checkLowStock(produtos);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [produtos]);

  return null; // Invisible component
}
