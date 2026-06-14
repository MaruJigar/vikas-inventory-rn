export const mockData = {
  users: [
    {
      id: 1,
      username: 'salesman',
      password: '1234',
      name: 'Raj Kumar',
      role: 'salesman',
      phone: '+91 98765 43210',
      email: 'raj@vikasmarketing.com',
    },
    {
      id: 2,
      username: 'admin',
      password: '1234',
      name: 'Vikas Patel',
      role: 'admin',
      phone: '+91 98765 00001',
      email: 'admin@vikasmarketing.com',
    },
  ],

  // Business config set by Admin
  businessConfig: {
    companyName: 'Vikas Marketing',
    gstin: '24XXXXX1234X1ZX',
    address: 'Budhishivanagara, Jamnagar, Gujarat - 361006',
    stateCode: '24',
    stateName: 'Gujarat',
    maxDiscountPercent: 15, // Global max discount a salesman can give
  },

  customers: [
    { id: 1, name: 'Patel Kitchenware', city: 'Jamnagar', state: 'Gujarat', stateCode: '24', phone: '98765-43210', email: 'orders@patelkitchen.com', gstNumber: '24AABCP1234M1Z5', totalOrders: 12 },
    { id: 2, name: 'Mehta Trading Co.', city: 'Rajkot', state: 'Gujarat', stateCode: '24', phone: '98765-43211', email: 'bulk@mehtatrading.com', gstNumber: '24AABCM5678N1Z3', totalOrders: 8 },
    { id: 3, name: 'Shah Home Appliances', city: 'Ahmedabad', state: 'Gujarat', stateCode: '24', phone: '98765-43212', email: 'supply@shahhome.com', gstNumber: '24AABCS9012P1Z1', totalOrders: 5 },
    { id: 4, name: 'Desai Hardware', city: 'Junagadh', state: 'Gujarat', stateCode: '24', phone: '98765-43213', email: 'orders@desaihw.com', gstNumber: null, totalOrders: 3 },
    { id: 5, name: 'Royal Kitchen Solutions', city: 'Mumbai', state: 'Maharashtra', stateCode: '27', phone: '98765-43214', email: 'orders@royalkitchen.com', gstNumber: '27AABCR3456Q1Z7', totalOrders: 7 },
    { id: 6, name: 'Golden Fork Catering', city: 'Delhi', state: 'Delhi', stateCode: '07', phone: '98765-43215', email: 'bulk@goldenfork.com', gstNumber: '07AABCG7890R1Z9', totalOrders: 4 },
    { id: 7, name: 'Trivedi Enterprises', city: 'Bhavnagar', state: 'Gujarat', stateCode: '24', phone: '98765-43216', email: 'supply@trivedi.com', gstNumber: '24AABCT1234S1Z2', totalOrders: 6 },
    { id: 8, name: 'Premium Hospitality', city: 'Pune', state: 'Maharashtra', stateCode: '27', phone: '98765-43217', email: 'procurement@premiumhosp.com', gstNumber: '27AABCP5678T1Z4', totalOrders: 2 },
  ],

  products: [
    { id: 1, name: 'SS Dinner Plates (Set of 6)', sku: 'DSP-001', category: 'Plates', hsnCode: '7323', price: 540, gstRate: 18, stock: 450, inStock: true, unit: 'set', maxDiscountPercent: 15 },
    { id: 2, name: 'Steel Pressure Cooker 5L', sku: 'PC-002', category: 'Cookware', hsnCode: '7615', price: 1200, gstRate: 18, stock: 120, inStock: true, unit: 'pcs', maxDiscountPercent: 10 },
    { id: 3, name: 'Non-Stick Frying Pan', sku: 'FP-003', category: 'Cookware', hsnCode: '7323', price: 650, gstRate: 18, stock: 0, inStock: false, unit: 'pcs', maxDiscountPercent: 12 },
    { id: 4, name: 'SS Bowls Set (12 pcs)', sku: 'BS-004', category: 'Bowls', hsnCode: '7323', price: 720, gstRate: 18, stock: 280, inStock: true, unit: 'set', maxDiscountPercent: 15 },
    { id: 5, name: 'Cooking Spoon Set (5 pcs)', sku: 'CS-005', category: 'Utensils', hsnCode: '7323', price: 185, gstRate: 18, stock: 600, inStock: true, unit: 'set', maxDiscountPercent: 10 },
    { id: 6, name: 'SS Serving Tray (Large)', sku: 'ST-006', category: 'Serving', hsnCode: '7323', price: 520, gstRate: 18, stock: 150, inStock: true, unit: 'pcs', maxDiscountPercent: 12 },
    { id: 7, name: 'Copper Bottom Kadai 2L', sku: 'CK-007', category: 'Cookware', hsnCode: '7418', price: 680, gstRate: 18, stock: 95, inStock: true, unit: 'pcs', maxDiscountPercent: 10 },
    { id: 8, name: 'Heavy Duty Stock Pot 10L', sku: 'SP-008', category: 'Cookware', hsnCode: '7323', price: 1800, gstRate: 18, stock: 45, inStock: true, unit: 'pcs', maxDiscountPercent: 8 },
    { id: 9, name: 'Steel Tiffin Set (4 tier)', sku: 'TS-009', category: 'Storage', hsnCode: '7323', price: 420, gstRate: 18, stock: 320, inStock: true, unit: 'set', maxDiscountPercent: 15 },
    { id: 10, name: 'Water Bottle SS 1L', sku: 'WB-010', category: 'Storage', hsnCode: '7323', price: 280, gstRate: 12, stock: 500, inStock: true, unit: 'pcs', maxDiscountPercent: 10 },
  ],

  orders: [
    {
      id: 'ORD-20260428-001', customerId: 1, customerName: 'Patel Kitchenware', salesmanName: 'Raj Kumar',
      date: '2026-04-28', status: 'delivered',
      items: [
        { id: 1, name: 'SS Dinner Plates (Set of 6)', price: 540, appliedPrice: 480, quantity: 50, gstRate: 18, discount: 11.1 },
        { id: 2, name: 'Steel Pressure Cooker 5L', price: 1200, appliedPrice: 1200, quantity: 2, gstRate: 18, discount: 0 },
      ],
      subtotal: 26400, taxAmount: 4752, total: 31152,
    },
    {
      id: 'ORD-20260427-002', customerId: 2, customerName: 'Mehta Trading Co.', salesmanName: 'Raj Kumar',
      date: '2026-04-27', status: 'dispatched',
      items: [
        { id: 4, name: 'SS Bowls Set (12 pcs)', price: 720, appliedPrice: 650, quantity: 30, gstRate: 18, discount: 9.7 },
      ],
      subtotal: 19500, taxAmount: 3510, total: 23010,
    },
    {
      id: 'ORD-20260426-003', customerId: 5, customerName: 'Royal Kitchen Solutions', salesmanName: 'Raj Kumar',
      date: '2026-04-26', status: 'confirmed',
      items: [
        { id: 5, name: 'Cooking Spoon Set (5 pcs)', price: 185, appliedPrice: 185, quantity: 100, gstRate: 18, discount: 0 },
        { id: 6, name: 'SS Serving Tray (Large)', price: 520, appliedPrice: 490, quantity: 5, gstRate: 18, discount: 5.8 },
      ],
      subtotal: 20950, taxAmount: 3771, total: 24721,
    },
    {
      id: 'ORD-20260425-004', customerId: 3, customerName: 'Shah Home Appliances', salesmanName: 'Raj Kumar',
      date: '2026-04-25', status: 'pending',
      items: [
        { id: 7, name: 'Copper Bottom Kadai 2L', price: 680, appliedPrice: 680, quantity: 20, gstRate: 18, discount: 0 },
      ],
      subtotal: 13600, taxAmount: 2448, total: 16048,
    },
    {
      id: 'ORD-20260424-005', customerId: 6, customerName: 'Golden Fork Catering', salesmanName: 'Raj Kumar',
      date: '2026-04-24', status: 'pending',
      items: [
        { id: 8, name: 'Heavy Duty Stock Pot 10L', price: 1800, appliedPrice: 1700, quantity: 5, gstRate: 18, discount: 5.6 },
        { id: 9, name: 'Steel Tiffin Set (4 tier)', price: 420, appliedPrice: 380, quantity: 50, gstRate: 18, discount: 9.5 },
      ],
      subtotal: 27500, taxAmount: 4950, total: 32450,
    },
  ],

  invoices: [
    {
      id: 'INV-001', orderId: 'ORD-20260428-001', customerName: 'Patel Kitchenware',
      date: '2026-04-28', isInterState: false,
      items: [
        { description: 'SS Dinner Plates (Set of 6)', hsnCode: '7323', quantity: 50, unitPrice: 480, gstRate: 18, taxableValue: 24000, cgst: 2160, sgst: 2160, igst: 0, total: 28320 },
        { description: 'Steel Pressure Cooker 5L', hsnCode: '7615', quantity: 2, unitPrice: 1200, gstRate: 18, taxableValue: 2400, cgst: 216, sgst: 216, igst: 0, total: 2832 },
      ],
      subtotal: 26400, totalCgst: 2376, totalSgst: 2376, totalIgst: 0, grandTotal: 31152,
    },
  ],

  notifications: [
    { id: 1, type: 'order', title: 'New Order', message: 'Raj Kumar placed order ORD-20260425-004 for Shah Home Appliances — ₹16,048', date: '2026-04-25', read: false },
    { id: 2, type: 'order', title: 'New Order', message: 'Raj Kumar placed order ORD-20260424-005 for Golden Fork Catering — ₹32,450', date: '2026-04-24', read: false },
    { id: 3, type: 'stock', title: 'Out of Stock', message: 'Non-Stick Frying Pan (FP-003) is out of stock', date: '2026-04-26', read: true },
    { id: 4, type: 'stock', title: 'Low Stock', message: 'Heavy Duty Stock Pot 10L has only 45 units remaining', date: '2026-04-25', read: true },
  ],
};
