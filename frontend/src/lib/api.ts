import axios from 'axios';

// Detect if we are running on Vercel or locally
const isDemo = import.meta.env.MODE === 'production' || window.location.hostname !== 'localhost';

const api = axios.create({
  baseURL: isDemo ? '/api/mock' : 'http://localhost:5001/api',
});

// --- FULL PROTOTYPE DATA MIGRATION ---
const INITIAL_BRANDS = [
  { id: 1, code: 'HMS', name: 'HM Signature', color: '#4A5F78', prefix: 'HMS-2026-' },
  { id: 2, code: 'DA', name: 'Dallah Addar', color: '#8B5E3C', prefix: 'DA-2026-' },
  { id: 3, code: 'HL', name: 'Home.ly', color: '#5C8A3C', prefix: 'HL-2026-' },
  { id: 4, code: 'SK', name: 'SKOV', color: '#2f6b33', prefix: 'SK-2026-' }
];

const INITIAL_CUSTOMERS = [
  { id: 1, name: 'Lulu Hypermarket', account_name: 'Lulu Hypermarket UAE', contact_name: 'Ahmed Al Rashid', role: 'Category buyer', email: 'ahmed.alrashid@luluhypermarket.com', phone: '+971501234567', wa: '+971501234567', address: 'Dubai, UAE' },
  { id: 2, name: 'Homecentre', account_name: 'Homecentre Kuwait', contact_name: 'Fatima Hassan', role: 'Purchasing manager', email: 'fatima.hassan@homecentre.com', phone: '+96599876543', wa: '+96599876543', address: 'Kuwait City' },
  { id: 3, name: 'Union Coop', account_name: 'Union Coop UAE', contact_name: 'James Park', role: 'Kitchen buyer', email: 'james.park@unioncoop.ae', phone: '+971552345678', wa: '+971552345678', address: 'Dubai, UAE' },
  { id: 4, name: 'Al Kabayel', account_name: 'Al Kabayel Kuwait', contact_name: 'Nadia Al Zahra', role: 'Category manager', email: 'nadia@alkabayel.com.kw', phone: '+96555345678', wa: '+96555345678', address: 'Kuwait City' },
  { id: 5, name: 'Homes R Us', account_name: 'Homes R Us UAE', contact_name: 'Omar Khalil', role: 'Buying director', email: 'omar@homesrus.ae', phone: '+971504567890', wa: '+971504567890', address: 'Dubai, UAE' },
  { id: 6, name: 'Spinneys', account_name: 'Spinneys UAE', contact_name: 'Sara Mitchell', role: 'Category buyer', email: 'sara.mitchell@spinneys.com', phone: '+971556789012', wa: '+971556789012', address: 'Dubai, UAE' },
  { id: 7, name: 'Carrefour', account_name: 'Carrefour Qatar', contact_name: 'Khalid Al Mansouri', role: 'Head of buying', email: 'khalid@carrefour.qa', phone: '+97450123456', wa: '+97450123456', address: 'Doha, Qatar' }
];

const INITIAL_INVENTORY = [
  { id: 1, brand_id: 1, sku: 'HMS-001', name: 'HM Signature Glass Vase', unit_price: 150, stock_level: 45, category: 'Home Decor' },
  { id: 2, brand_id: 1, sku: 'HMS-002', name: 'Velvet Cushion Cover', unit_price: 45, stock_level: 120, category: 'Textiles' },
  { id: 3, brand_id: 2, sku: 'DA-501', name: 'Dallah Coffee Pot (S)', unit_price: 210, stock_level: 15, category: 'Kitchenware' },
  { id: 4, brand_id: 3, sku: 'HL-101', name: 'Home.ly Cotton Towel Set', unit_price: 85, stock_level: 200, category: 'Bath' }
];

const INITIAL_ORDERS = [
  { id: 1, order_number: 'SO-2026-144', brand_id: 1, brand_name: 'HM Signature', brand_color: '#4A5F78', customer_id: 1, account_name: 'Lulu Hypermarket UAE', type: 'salesorder', status: 'Pending Approval', total: 12450, created_at: new Date().toISOString() },
  { id: 2, order_number: 'QT-2026-0091', brand_id: 2, brand_name: 'Dallah Addar', brand_color: '#8B5E3C', customer_id: 2, account_name: 'Homecentre Kuwait', type: 'quotation', status: 'Sent to customer', total: 45200, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, order_number: 'INV-2026-332', brand_id: 3, brand_name: 'Home.ly', brand_color: '#5C8A3C', customer_id: 3, account_name: 'Union Coop UAE', type: 'invoice', status: 'Paid', total: 8100, created_at: new Date(Date.now() - 7200000).toISOString() }
];

const MSG_TEMPLATES: Record<string, any> = {
  quotation: {
    wa: `Hi {name},\n\nPlease find attached our quotation *{ref}* for {account}.\n\n📋 *Summary*\nBrand: {brand}\nTotal: {amount} (incl. VAT)\nValid until: {date}\n\nKindly review and let us know if you have any questions or would like to discuss the terms.\n\nBest regards,\nHouseMart Group\n+971 4 226 0012`,
    email: { subject: 'Quotation {ref} — {brand} — HouseMart Group', body: `Dear {name},\n\nPlease find attached our quotation {ref} for your review.\n\nQuotation details:\n• Brand: {brand}\n• Account: {account}\n• Total amount: {amount} (inclusive of 5% UAE VAT)\n• Valid until: {date}\n• Payment terms: Net 30 days\n\nPlease do not hesitate to contact us if you have any questions or require amendments. We look forward to your confirmation.\n\nKind regards,\nHouseMart Group` }
  },
  salesorder: {
    wa: `Hi {name},\n\n✅ Your order *{ref}* has been confirmed.\n\n📦 *Order details*\nBrand: {brand}\nItems: {items}\nTotal: {amount}\nExpected delivery: {date}\n\nWe will keep you updated at every step. You will receive a tracking link once your order is shipped.\n\nThank you for your business!\nHouseMart Group`,
    email: { subject: 'Sales order confirmed — {ref} — {brand}', body: `Dear {name},\n\nThank you for your order. We are pleased to confirm that sales order {ref} has been received and is now being processed.\n\nOrder summary:\n• Order reference: {ref}\n• Brand: {brand}\n• Total amount: {amount}\n• Expected delivery: {date}\n• Delivery address: {account} warehouse\n\nYour dedicated pick list has been sent to our warehouse team. You will receive a shipping notification with a tracking link once your order is dispatched.\n\nKind regards,\nHouseMart Group` }
  },
  invoice: {
    wa: `Hi {name},\n\nPlease find your invoice *{ref}* for order {soref}.\n\n🧾 *Invoice details*\nBrand: {brand}\nAmount: {amount} (incl. VAT)\nDue date: {date}\n\n💳 *Payment details*\nBank: Emirates NBD\nAccount: HouseMart Group LLC\nReference: {ref}\n\nPlease ensure the invoice reference is quoted on your payment. Thank you!\n\nHouseMart Group`,
    email: { subject: 'Invoice {ref} — {amount} due {date} — HouseMart Group', body: `Dear {name},\n\nPlease find attached tax invoice {ref} in respect of your recent order.\n\nInvoice details:\n• Invoice number: {ref}\n• Sales order: {soref}\n• Brand: {brand}\n• Total payable: {amount}\n• Payment due: {date}\n\nBank transfer details:\n• Bank: Emirates NBD\n• Account name: HouseMart Group LLC\n• Reference: Please quote invoice number {ref}\n\nKind regards,\nHouseMart Group` }
  }
};

// --- MOCK API LOGIC ---
if (isDemo) {
  const getStorage = (key: string, initial: any) => {
    const saved = localStorage.getItem(`hm_${key}`);
    return saved ? JSON.parse(saved) : initial;
  };

  const setStorage = (key: string, val: any) => {
    localStorage.setItem(`hm_${key}`, JSON.stringify(val));
  };

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
        if (url === '/templates') data = MSG_TEMPLATES;
        if (url === '/stats') {
          const orders = getStorage('orders', INITIAL_ORDERS);
          data = {
            activeQuotations: orders.filter((o: any) => o.type === 'quotation').length,
            pendingOrders: orders.filter((o: any) => o.type === 'salesorder').length,
            unpaidInvoices: orders.filter((o: any) => o.type === 'invoice' && o.status !== 'Paid').length,
            fulfilmentRate: '98.2%',
            returns: 3,
            quotationValue: `AED ${orders.filter((o: any) => o.type === 'quotation').reduce((s: number, o: any) => s + o.total, 0).toLocaleString()}`,
            orderValue: `AED ${orders.filter((o: any) => o.type === 'salesorder').reduce((s: number, o: any) => s + o.total, 0).toLocaleString()}`,
            invoiceValue: `AED ${orders.filter((o: any) => o.type === 'invoice' && o.status !== 'Paid').reduce((s: number, o: any) => s + o.total, 0).toLocaleString()}`
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
