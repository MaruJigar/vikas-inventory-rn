import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your local machine's IP address if testing on a physical device
// Example: 'http://192.168.1.100:3000/api'
const BASE_URL = 'http://localhost:3000/api';

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('@vikas_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  const headers = await getHeaders();
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

export const ApiService = {
  // Auth
  login: (phone, password) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  }),
  register: (userData) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // Users & Approvals
  getUsers: () => apiFetch('/users'),
  approveUser: (id, status) => apiFetch(`/users/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),

  // Attendance
  checkIn: (lat, lng) => apiFetch('/attendance/checkin', {
    method: 'POST',
    body: JSON.stringify({ location_lat: lat, location_lng: lng }),
  }),
  checkOut: (lat, lng) => apiFetch('/attendance/checkout', {
    method: 'POST',
    body: JSON.stringify({ location_lat: lat, location_lng: lng }),
  }),
  getAttendance: () => apiFetch('/attendance'),

  // Products & Inventory
  getProducts: () => apiFetch('/products'),
  getInventory: () => apiFetch('/products/inventory'),

  // Shops
  getShops: () => apiFetch('/shops'),
  createShop: (shopData) => apiFetch('/shops', {
    method: 'POST',
    body: JSON.stringify(shopData),
  }),

  // Orders
  getOrders: () => apiFetch('/orders'),
  createOrder: (orderData) => apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  updateOrderStatus: (id, status) => apiFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};
