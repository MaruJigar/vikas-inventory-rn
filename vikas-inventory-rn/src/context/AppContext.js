import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/api';
import { mockData } from '../data/mockData';

export const AppContext = createContext();

  const [appState, setAppState] = useState({
    currentUser: null,
    userRole: null,
    cart: [],
    selectedCustomer: null,
    currentPlan: 'enterprise',
    orders: [],
    customers: [],
    products: [],
    users: [],
    notifications: [],
    invoices: [],
    businessConfig: { gstRate: 18, stateCode: '27' }, // Default config
    isLoading: false, // Added loading state
  });

  const [toasts, setToasts] = useState([]);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('appState');
      if (savedState) {
        setAppState(prev => ({ ...prev, ...JSON.parse(savedState) }));
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  const saveState = async (newState) => {
    try {
      await AsyncStorage.setItem('appState', JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  const loadInitialData = async () => {
    setAppState(prev => ({ ...prev, isLoading: true }));
    try {
      const [productsRes, shopsRes, ordersRes, usersRes] = await Promise.all([
        ApiService.getProducts().catch(() => ({ data: [] })),
        ApiService.getShops().catch(() => ({ data: [] })),
        ApiService.getOrders().catch(() => ({ data: [] })),
        ApiService.getUsers().catch(() => ({ data: [] }))
      ]);

      const newState = {
        ...appState,
        products: productsRes.data || [],
        customers: shopsRes.data || [],
        orders: ordersRes.data || [],
        users: usersRes.data || [],
        isLoading: false
      };
      
      setAppState(prev => ({ ...prev, ...newState }));
      saveState(newState);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setAppState(prev => ({ ...prev, isLoading: false }));
      showToast('Failed to sync data with server', 'error');
    }
  };

  // --- AUTH ---
  const handleLogin = async (phone, password) => {
    try {
      const response = await ApiService.login(phone, password);
      if (response.success) {
        await AsyncStorage.setItem('@vikas_token', response.token);
        const user = response.user;
        const newState = { ...appState, currentUser: user, userRole: user.role };
        setAppState(newState);
        saveState(newState);
        showToast(`Welcome, ${user.name}!`, 'success');
        
        // Fetch all data immediately after successful login
        await loadInitialData();
        return true;
      }
    } catch (error) {
      showToast(error.message || 'Invalid credentials', 'error');
    }
    return false;
  };

  const handleLogout = () => {
    const newState = { ...appState, currentUser: null, userRole: null, cart: [], selectedCustomer: null };
    setAppState(newState);
    saveState(newState);
    showToast('Logged out successfully', 'info');
  };

  // --- CUSTOMER ---
  const selectCustomer = (customerId) => {
    const customer = appState.customers.find(c => c.id === customerId);
    if (customer) {
      const newState = { ...appState, selectedCustomer: customer, cart: [] };
      setAppState(newState);
      saveState(newState);
      return true;
    }
    return false;
  };

  // --- CART (with appliedPrice support) ---
  const addToCart = (product, quantity) => {
    const appliedPrice = product.appliedPrice || product.price;
    const existingItem = appState.cart.find(item => item.id === product.id);

    let newCart;
    if (existingItem) {
      newCart = appState.cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity, appliedPrice }
          : item
      );
    } else {
      newCart = [...appState.cart, { ...product, quantity, appliedPrice }];
    }

    const newState = { ...appState, cart: newCart };
    setAppState(newState);
    saveState(newState);
    showToast(`${product.name} added`, 'success');
  };

  const removeFromCart = (productId) => {
    const newCart = appState.cart.filter(item => item.id !== productId);
    const newState = { ...appState, cart: newCart };
    setAppState(newState);
    saveState(newState);
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = appState.cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    const newState = { ...appState, cart: newCart };
    setAppState(newState);
    saveState(newState);
  };

  const updateCartPrice = (productId, newPrice) => {
    const newCart = appState.cart.map(item =>
      item.id === productId ? { ...item, appliedPrice: newPrice } : item
    );
    const newState = { ...appState, cart: newCart };
    setAppState(newState);
    saveState(newState);
  };

  // --- ORDERS ---
  const submitOrder = async (orderDataWithLocation = {}) => {
    const customer = appState.selectedCustomer;

    const items = appState.cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }));

    const payload = {
      shop_id: customer.id,
      items: items,
      location_lat: orderDataWithLocation.location_lat || null,
      location_lng: orderDataWithLocation.location_lng || null
    };

    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      const response = await ApiService.createOrder(payload);
      
      if (response.success) {
        // Refresh orders after submission
        await loadInitialData();
        
        const newState = {
          ...appState,
          cart: [],
          selectedCustomer: null,
          isLoading: false
        };
        setAppState(prev => ({ ...prev, ...newState }));
        saveState(newState);
        showToast('Order submitted successfully!', 'success');
        
        return { id: response.orderNumber || response.orderId };
      }
    } catch (error) {
      setAppState(prev => ({ ...prev, isLoading: false }));
      showToast(error.message || 'Failed to submit order', 'error');
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      await ApiService.updateOrderStatus(orderId, newStatus);
      await loadInitialData();
      showToast(`Order ${newStatus}`, 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update order', 'error');
    } finally {
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // --- NOTIFICATIONS ---
  const markNotificationAsRead = (notificationId) => {
    const newNotifications = appState.notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    const newState = { ...appState, notifications: newNotifications };
    setAppState(newState);
    saveState(newState);
  };

  // --- INVENTORY (Admin only) ---
  const updateProduct = (productId, updates) => {
    const newProducts = appState.products.map(product =>
      product.id === productId
        ? { ...product, ...updates, inStock: (updates.stock !== undefined ? updates.stock : product.stock) > 0 }
        : product
    );
    const newState = { ...appState, products: newProducts };
    setAppState(newState);
    saveState(newState);
  };

  // Legacy mapping for safety
  const updateStock = (id, stock) => updateProduct(id, { stock });

  // --- TEAM MANAGEMENT (Admin only) ---
  const addSalesman = (newUserData) => {
    const newUser = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      role: 'salesman',
      ...newUserData,
    };
    const newState = { ...appState, users: [...appState.users, newUser] };
    setAppState(newState);
    saveState(newState);
    showToast('Salesman account created', 'success');
    return true;
  };

  const deleteSalesman = (userId) => {
    const newUsers = appState.users.filter(u => u.id !== userId);
    const newState = { ...appState, users: newUsers };
    setAppState(newState);
    saveState(newState);
    showToast('Salesman removed', 'info');
  };

  // --- TOAST ---
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        toasts,
        loadInitialData,
        handleLogin,
        handleLogout,
        selectCustomer,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartPrice,
        submitOrder,
        updateOrderStatus,
        markNotificationAsRead,
        updateStock,
        updateProduct,
        addSalesman,
        deleteSalesman,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
