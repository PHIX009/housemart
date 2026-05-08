import axios from 'axios';

// Detect if we are running on Vercel or locally
const isDemo = import.meta.env.MODE === 'production' || window.location.hostname !== 'localhost';

const api = axios.create({
  baseURL: isDemo ? '/api/mock' : 'http://localhost:5001/api',
});

// --- MOCK API LOGIC FOR STANDALONE DEMO ---
if (isDemo) {
  const getStorage = (key: string, initial: any) => {
    const saved = localStorage.getItem(`hm_${key}`);
    return saved ? JSON.parse(saved) : initial;
  };

  const setStorage = (key: string, val: any) => {
    localStorage.setItem(`hm_${key}`, JSON.stringify(val));
  };

  const INITIAL_BRANDS = [
    { id: 1, code: 'HMS', name: 'HM Signature', color: '#4A5F78', prefix: 'HMS-2026-' },
    { id: 2, code: 'DA', name: 'Dallah Addar', color: '#8B5E3C', prefix: 'DA-2026-' },
    { id: 3, code: 'HL', name: 'Home.ly', color: '#5C8A3C', prefix: 'HL-2026-' },
    { id: 4, code: 'SK', name: 'SKOV', color: '#2f6b33', prefix: 'SK-2026-' }
  ];

  const INITIAL_CUSTOMERS = [
    { id: 1, name: 'Lulu Hypermarket', account_name: 'Lulu Hypermarket UAE', contact_name: 'Ahmed Al Rashid', role: 'Category buyer', email: 'ahmed.alrashid@luluhypermarket.com', phone: '+971501234567', wa: '+971501234567', address: 'Dubai, UAE' },
    { id: 2, name: 'Homecentre', account_name: 'Homecentre Kuwait', contact_name: 'Fatima Hassan', role: 'Purchasing manager', email: 'fatima@homecentre.com', phone: '+96599876543', wa: '+96599876543', address: 'Kuwait City' }
  ];

  const INITIAL_INVENTORY = [
    { id: 1, brand_id: 1, sku: 'HMS-001', name: 'HM Signature Glass Vase', unit_price: 150, stock_level: 45, category: 'Home Decor' },
    { id: 2, brand_id: 1, sku: 'HMS-002', name: 'Velvet Cushion Cover', unit_price: 45, stock_level: 120, category: 'Textiles' },
    { id: 3, brand_id: 2, sku: 'DA-501', name: 'Dallah Coffee Pot (S)', unit_price: 210, stock_level: 15, category: 'Kitchenware' }
  ];

  const INITIAL_ORDERS = [
    { id: 1, order_number: 'QT-2026-0091', brand_id: 1, brand_name: 'HM Signature', brand_color: '#4A5F78', customer_id: 1, account_name: 'Lulu Hypermarket UAE', type: 'quotation', status: 'Sent to customer', subtotal: 195, vat: 9.75, total: 204.75, created_at: new Date().toISOString() }
  ];

  // Intercept Axios calls
  api.interceptors.request.use((config) => {
    const url = config.url || '';
    
    return new Promise((resolve) => {
      // Mock GET requests
      if (config.method === 'get') {
        let data: any;
        if (url === '/brands') data = getStorage('brands', INITIAL_BRANDS);
        if (url === '/customers') data = getStorage('customers', INITIAL_CUSTOMERS);
        if (url === '/inventory') data = getStorage('inventory', INITIAL_INVENTORY);
        if (url === '/orders') data = getStorage('orders', INITIAL_ORDERS);
        if (url === '/stats') {
          const orders = getStorage('orders', INITIAL_ORDERS);
          data = {
            activeQuotations: orders.filter((o: any) => o.type === 'quotation').length,
            pendingOrders: orders.filter((o: any) => o.type === 'salesorder').length,
            unpaidInvoices: orders.filter((o: any) => o.type === 'invoice').length,
            fulfilmentRate: '98.2%',
            returns: 3,
            quotationValue: `AED ${orders.filter((o: any) => o.type === 'quotation').reduce((s: number, o: any) => s + o.total, 0).toLocaleString()}`,
            orderValue: `AED ${orders.filter((o: any) => o.type === 'salesorder').reduce((s: number, o: any) => s + o.total, 0).toLocaleString()}`,
            invoiceValue: `AED ${orders.filter((o: any) => o.type === 'invoice').reduce((s: number, o: any) => s + o.total, 0).toLocaleString()}`
          };
        }
        
        config.adapter = () => Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config });
      }

      // Mock POST requests
      if (config.method === 'post' && url === '/orders') {
        const brands = getStorage('brands', INITIAL_BRANDS);
        const customers = getStorage('customers', INITIAL_CUSTOMERS);
        const orders = getStorage('orders', INITIAL_ORDERS);
        const newOrder = config.data;
        
        const brand = brands.find((b: any) => b.id.toString() === newOrder.brand_id);
        const customer = customers.find((c: any) => c.id.toString() === newOrder.customer_id);
        
        const brandOrders = orders.filter((o: any) => o.brand_id.toString() === newOrder.brand_id);
        const orderNumber = `${brand.prefix}${(brandOrders.length + 1).toString().padStart(4, '0')}`;
        
        const finalOrder = {
          ...newOrder,
          id: Date.now(),
          order_number: orderNumber,
          brand_name: brand.name,
          brand_color: brand.color,
          account_name: customer.account_name,
          status: newOrder.type === 'quotation' ? 'Sent to customer' : 'Pending Approval',
          created_at: new Date().toISOString()
        };
        
        setStorage('orders', [finalOrder, ...orders]);
        config.adapter = () => Promise.resolve({ data: { success: true, order: finalOrder }, status: 200, statusText: 'OK', headers: {}, config });
      }

      resolve(config);
    });
  });
}

export default api;
