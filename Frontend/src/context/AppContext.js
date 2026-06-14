import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockData } from '../data/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState({
    currentUser: null,
    userRole: null,
    cart: [],
    selectedCustomer: null,
    currentPlan: 'enterprise',
    orders: [...mockData.orders],
    customers: [...mockData.customers],
    products: [...mockData.products],
    users: [...mockData.users],
    notifications: [...mockData.notifications],
    invoices: [...mockData.invoices],
    businessConfig: { ...mockData.businessConfig },
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

  // --- AUTH ---
  const handleLogin = (username, password) => {
    const user = mockData.users.find(
      u => u.username === username && u.password === password
    );
    if (user) {
      const newState = { ...appState, currentUser: user, userRole: user.role };
      setAppState(newState);
      saveState(newState);
      showToast(`Welcome, ${user.name}!`, 'success');
      return true;
    }
    showToast('Invalid credentials', 'error');
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
  const submitOrder = () => {
    const customer = appState.selectedCustomer;
    const isInterState = customer.stateCode !== appState.businessConfig.stateCode;

    const subtotal = appState.cart.reduce((sum, item) =>
      sum + (item.appliedPrice || item.price) * item.quantity, 0
    );

    const items = appState.cart.map(item => {
      const unitPrice = item.appliedPrice || item.price;
      const taxableValue = unitPrice * item.quantity;
      const gstRate = item.gstRate || 18;
      const taxAmount = taxableValue * (gstRate / 100);

      return {
        ...item,
        unitPrice,
        taxableValue,
        gstRate,
        cgstAmount: isInterState ? 0 : taxAmount / 2,
        sgstAmount: isInterState ? 0 : taxAmount / 2,
        igstAmount: isInterState ? taxAmount : 0,
        lineTotal: taxableValue + taxAmount,
        discount: item.price > 0 ? ((item.price - unitPrice) / item.price * 100).toFixed(1) : '0.0',
      };
    });

    const taxAmount = items.reduce((sum, item) =>
      sum + (item.cgstAmount + item.sgstAmount + item.igstAmount), 0
    );

    const newOrder = {
      id: `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(appState.orders.length + 1).padStart(3, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      salesmanName: appState.currentUser?.name,
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
      isInterState,
      status: 'pending',
    };

    // Add notification for admin
    const newNotification = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type: 'order',
      title: 'New Order',
      message: `${appState.currentUser?.name} placed order ${newOrder.id} for ${customer.name} — ₹${newOrder.total.toLocaleString('en-IN')}`,
      date: newOrder.date,
      read: false,
    };

    const newState = {
      ...appState,
      orders: [newOrder, ...appState.orders],
      notifications: [newNotification, ...appState.notifications],
      cart: [],
      selectedCustomer: null,
    };

    setAppState(newState);
    saveState(newState);
    showToast('Order submitted successfully!', 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const newOrders = appState.orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    const newState = { ...appState, orders: newOrders };
    setAppState(newState);
    saveState(newState);
    showToast(`Order ${newStatus}`, 'success');
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
