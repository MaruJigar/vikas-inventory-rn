# Vikas Marketing - React Native Inventory App

A full-featured React Native mobile application for B2B inventory and sales management, built with Expo and Firebase integration ready.

## 🎯 Features

### Salesman Portal
- ✅ Login & Role-based Access
- ✅ Dashboard with KPI Metrics
  - Total Orders
  - Revenue
  - Pending Orders
  - Total Customers
- ✅ Customer Management
  - Browse all customers
  - Search & filter
  - View customer details
- ✅ Product Catalog
  - Browse 10+ products
  - Stock status indicators
  - Search & filter by category
- ✅ Shopping Cart
  - Add/remove items
  - Update quantities
  - Dynamic pricing
- ✅ Order Management
  - Create orders
  - Review before submission
  - Calculate tax (18% GST)
  - Order history
  - Order details & tracking
- ✅ Invoice Viewing
  - Detailed invoice display
  - Share functionality
  - Download as PDF (framework ready)

### Admin Dashboard
- ✅ Business Analytics
  - Total orders
  - Revenue tracking
  - Completed orders count
  - Low stock alerts
- ✅ Recent Orders Table
  - Order status tracking
  - Quick navigation to details
- ✅ Inventory Management
  - View all products
  - Update stock levels
  - Monitor stock status
  - Low stock & out-of-stock alerts
- ✅ Notifications System
  - Order notifications
  - Stock alerts
  - Inventory updates
  - Mark as read
- ✅ Task Management
  - Create & assign tasks
  - Priority levels
  - Due date tracking
  - Mark tasks complete

### Design System
- 📱 Mobile-first responsive design
- 🎨 Consistent color scheme
- 🧩 Reusable component patterns
- ⚡ Smooth animations & transitions
- 🌙 Light theme with professional UI

## 📋 Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: Context API + AsyncStorage
- **Styling**: StyleSheet + Design Tokens
- **Backend**: Firebase (Ready for integration)
- **Database**: Firebase Realtime/Firestore (Framework ready)
- **Platform**: iOS & Android via Expo

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ (https://nodejs.org)
- Expo CLI: `npm install -g expo-cli`
- Expo App on phone (optional, for testing)

### Installation

1. **Clone or download project**
```bash
cd vikas-inventory-rn
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

4. **Run on device/emulator**
- **iOS**: Press `i` in terminal to open iOS simulator
- **Android**: Press `a` in terminal to open Android emulator  
- **Phone**: Scan QR code with Expo Go app

### Demo Accounts

**Salesman**
- Username: `salesman`
- Password: `1234`

**Admin**
- Username: `admin`
- Password: `1234`

## 📁 Project Structure

```
vikas-inventory-rn/
├── App.js                          # Main app entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── src/
│   ├── context/
│   │   └── AppContext.js          # Global state management
│   ├── data/
│   │   └── mockData.js            # Mock data for development
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── SalesmanDashboardScreen.js
│   │   ├── CustomerSelectScreen.js
│   │   ├── ProductListingScreen.js
│   │   ├── OrderConfirmationScreen.js
│   │   ├── OrderHistoryScreen.js
│   │   ├── OrderDetailsScreen.js
│   │   ├── AdminDashboardScreen.js
│   │   ├── InventoryManagementScreen.js
│   │   ├── NotificationsScreen.js
│   │   ├── TasksScreen.js
│   │   └── InvoiceScreen.js
│   └── styles/
│       └── colors.js              # Design tokens & theme
└── assets/                         # Images & icons (optional)
```

## 🔧 Available Scripts

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Eject from Expo (not recommended)
npm run eject
```

## 🗄️ Data Management

### Current State (Development)
- **Mock Data**: All data comes from `src/data/mockData.js`
- **AsyncStorage**: Local persistence for cart & plan selection
- **In-Memory**: App state managed via Context API

### Firebase Integration (Next Phase)
Ready to connect to Firebase Realtime Database or Firestore:
1. Create Firebase project
2. Configure credentials in `firebase-config.js`
3. Replace mock data imports with Firebase queries
4. Update AppContext to use Firebase APIs

### Mock Data Includes
- 2 Users (Salesman + Admin)
- 8 Customers with details
- 10 Products with pricing & stock
- 5 Sample Orders
- 2 Invoices
- 4 Notifications
- 3 Tasks

## 🎨 Design System

### Colors
- Primary: `#2563eb` (Blue)
- Secondary: `#7c3aed` (Purple)
- Success: `#10b981` (Green)
- Warning: `#f97316` (Orange)
- Danger: `#ef4444` (Red)
- Gray scale: 50-900

### Typography
- Sizes: xs (12) → 3xl (30)
- Weights: Light (300) → Bold (700)
- Font: System font (Inter-like)

### Spacing
- xs: 4px → 3xl: 48px
- Consistent 4px grid system

## 📱 Screens Overview

### Login
- Role selection (Salesman/Admin)
- Demo account quick login
- Credentials display

### Salesman Flow
1. Dashboard → KPIs & recent orders
2. Customer Select → Browse & search
3. Product Listing → Add to cart
4. Order Confirmation → Review & submit
5. Order History → Track orders
6. Order Details → View specifics
7. Invoice → Print/share

### Admin Flow
1. Dashboard → Business metrics
2. Inventory Mgmt → Stock control
3. Notifications → Alert management
4. Tasks → Work tracking
5. Order Management → Order overview

## 🔐 Security Notes

### Development
- Mock data only (demo passwords hardcoded)
- No real authentication

### Production
- Implement Firebase Authentication
- Store credentials securely
- Implement role-based access control (RBAC)
- Enable API security rules

## 📦 Firebase Setup (When Ready)

1. Create Firebase project
2. Enable Realtime Database or Firestore
3. Configure authentication
4. Set up security rules
5. Update AppContext with Firebase SDK
6. Replace mock data with database queries

## 🧪 Testing

Current app includes:
- ✅ Mock data for all flows
- ✅ Role-based navigation
- ✅ Form validation
- ✅ State persistence
- ✅ Error handling

## 📊 Performance

- Lightweight bundle (no heavy frameworks)
- Optimized re-renders with Context
- Efficient list rendering with FlatList
- AsyncStorage for local caching

## 🐛 Known Limitations

1. No real backend (mock data only)
2. No Firebase integration yet
3. PDF download not functional (framework ready)
4. No image uploads
5. No real-time sync (Firebase ready)

## 🚀 Next Steps

### Phase 1 (Current)
✅ React Native frontend complete
✅ All 13 screens implemented
✅ State management ready

### Phase 2 (Firebase)
- [ ] Firebase project setup
- [ ] Authentication integration
- [ ] Realtime database connection
- [ ] Real order persistence

### Phase 3 (Production)
- [ ] App store deployment
- [ ] Play store deployment
- [ ] Performance optimization
- [ ] Push notifications
- [ ] Analytics integration

## 📞 Support & Resources

### React Native
- Docs: https://reactnative.dev
- Expo: https://docs.expo.dev
- React Navigation: https://reactnavigation.org

### Firebase
- Console: https://console.firebase.google.com
- Docs: https://firebase.google.com/docs
- React Native SDK: https://rnfirebase.io

## 📄 License

Private - Vikas Marketing

## 👥 Team

- **Frontend**: Param Buddh & Jigar Maru
- **Project**: B2B Inventory Management System

## 📅 Timeline

- Phase 1: ✅ Complete (May 2, 2026)
- Phase 2: 🔜 In Progress
- Phase 3: 📅 Planned

---

**Ready to start? Run `npm start` and log in with demo credentials!** 🚀

For backend integration, refer to Firebase documentation and update AppContext.js with your credentials.
