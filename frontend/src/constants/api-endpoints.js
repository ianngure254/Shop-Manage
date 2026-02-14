export const API_ENDPOINTS = {
  PRODUCTS: {
    BASE: '/products',
    SINGLE: (id) => `/products/${id}`,
    UPDATE_STOCK: (id) => `/products/${id}/stock`,
  },


  REPORTS: {
    BASE: '/reports',
    INVENTORY: '/reports/inventory',
    SALES: '/reports/sales',
    DAILY: '/reports/daily',
  },

  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_AS_READ: (id) => `/notifications/${id}/read`,
  },
};
