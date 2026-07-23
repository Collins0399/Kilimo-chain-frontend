const BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper to construct query params
const queryParams = (params) => {
  if (!params) return '';
  const parts = Object.entries(params)
    .filter(([_, val]) => val !== undefined && val !== null && val !== '')
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

// Generic request wrapper
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('kilimo_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.message || data.error || errorMsg;
    } catch (e) {
      try {
        errorMsg = await response.text() || errorMsg;
      } catch (inner) {}
    }
    throw new Error(errorMsg);
  }

  // Handle plain text response or empty response
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
};

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.accessToken) {
        localStorage.setItem('kilimo_token', data.accessToken);
        localStorage.setItem('kilimo_user', JSON.stringify({
          userId: data.userId,
          fullName: data.fullName,
          role: data.role,
        }));
      }
      return data;
    },
    register: async (fullName, phoneNumber, email, password) => {
      return await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, phoneNumber, email, password }),
      });
    },
    logout: () => {
      localStorage.removeItem('kilimo_token');
      localStorage.removeItem('kilimo_user');
    },
    getCurrentUser: () => {
      try {
        return JSON.parse(localStorage.getItem('kilimo_user'));
      } catch (e) {
        return null;
      }
    },
    getToken: () => localStorage.getItem('kilimo_token'),
  },

  // Buyer Portal Services
  buyer: {
    getListings: async () => {
      return await request('/api/buyer/listings');
    },
    createRequest: async (harvestId, buyerId, quantityRequested, deliveryLocation, additionalNotes) => {
      return await request('/api/buyer/requests', {
        method: 'POST',
        body: JSON.stringify({
          harvestId: Number(harvestId),
          buyerId: Number(buyerId),
          quantityRequested: Number(quantityRequested),
          deliveryLocation,
          additionalNotes,
        }),
      });
    },
    getRequests: async (buyerId) => {
      return await request(`/api/buyer/requests/buyer/${buyerId}`);
    },
  },

  // Payments
  payments: {
    initiate: async (buyerRequestId, phoneToPayWith) => {
      const params = queryParams({ buyerRequestId, phoneToPayWith });
      return await request(`/api/payments/initiate${params}`, {
        method: 'POST',
      });
    },
    simulateCallback: async (merchantRequestId, checkoutRequestId, amount, mpesaReceiptNumber, transactionDesc, status) => {
      return await request('/api/payments/simulate-callback', {
        method: 'POST',
        body: JSON.stringify({
          checkoutRequestId,
          resultCode: status === 'SUCCESS' ? 0 : 1,
          resultDesc: transactionDesc || 'Processed',
          mpesaReceiptNumber: mpesaReceiptNumber || ('MOCK' + Date.now()),
        }),
      });
    },
  },

  // Cooperative Admin Services
  admin: {
    getDashboardStats: async () => {
      return await request('/api/admin/dashboard');
    },
    getFarmers: async (filters = {}) => {
      const params = queryParams(filters);
      return await request(`/api/admin/farmers${params}`);
    },
    registerFarmer: async (dto) => {
      return await request('/api/admin/farmers', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },
    verifyFarmer: async (id, verify) => {
      return await request(`/api/admin/farmers/${id}/verify?verify=${verify}`, {
        method: 'PUT',
      });
    },
    toggleFarmerActive: async (id, active) => {
      return await request(`/api/admin/farmers/${id}/toggle-active?active=${active}`, {
        method: 'PUT',
      });
    },
    getHarvests: async (filters = {}) => {
      const params = queryParams(filters);
      return await request(`/api/admin/harvests${params}`);
    },
    getHarvestById: async (id) => {
      return await request(`/api/admin/harvests/${id}`);
    },
    deleteHarvest: async (id) => {
      return await request(`/api/admin/harvests/${id}`, {
        method: 'DELETE',
      });
    },
    getBuyerRequests: async (status) => {
      const params = queryParams({ status });
      return await request(`/api/admin/buyer-requests${params}`);
    },
    approveRequest: async (id) => {
      return await request(`/api/admin/buyer-requests/${id}/approve`, {
        method: 'PUT',
      });
    },
    rejectRequest: async (id) => {
      return await request(`/api/admin/buyer-requests/${id}/reject`, {
        method: 'PUT',
      });
    },
    getPayments: async (status) => {
      const params = queryParams({ status });
      return await request(`/api/admin/payments${params}`);
    },
    getNotifications: async () => {
      return await request('/api/admin/notifications');
    },
    markNotificationRead: async (id) => {
      return await request(`/api/admin/notifications/${id}/read`, {
        method: 'PUT',
      });
    },
    deleteNotification: async (id) => {
      return await request(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });
    },
    completeRequest: async (id) => {
      return await request(`/api/admin/buyer-requests/${id}/complete`, {
        method: 'PUT',
      });
    },
    getSmsLogs: async (filters = {}) => {
      const params = queryParams(filters);
      return await request(`/api/admin/sms/logs${params}`);
    },
    getSmsStats: async () => {
      return await request('/api/admin/sms/stats');
    },
    sendBroadcastSms: async (message) => {
      return await request('/api/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
  },

  // Market Prices Services
  marketPrices: {
    getAll: async (filters = {}) => {
      const params = queryParams(filters);
      return await request(`/api/market-prices${params}`);
    },
    create: async (marketPrice) => {
      return await request('/api/market-prices', {
        method: 'POST',
        body: JSON.stringify(marketPrice),
      });
    },
    update: async (id, marketPrice) => {
      return await request(`/api/market-prices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(marketPrice),
      });
    },
    delete: async (id) => {
      return await request(`/api/market-prices/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // USSD / SMS Offline Gateway Simulator
  ussd: {
    sendRequest: async ({ sessionId, serviceCode, msisdn, input, countryCode = 'KE', network = 'Safaricom' }) => {
      // USSD Controller expects application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('sessionId', sessionId);
      formData.append('serviceCode', serviceCode);
      formData.append('msisdn', msisdn);
      formData.append('input', input);
      formData.append('countryCode', countryCode);
      formData.append('network', network);

      const response = await fetch(`${BASE_URL}/ussd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'USSD system error');
      }

      return await response.text();
    },
  },
};
