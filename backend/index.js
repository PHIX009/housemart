const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'housemart.db');
const db = new sqlite3.Database(dbPath);

// Brands
app.get('/api/brands', (req, res) => {
    db.all('SELECT * FROM brands', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Customers
app.get('/api/customers', (req, res) => {
    db.all('SELECT * FROM customers', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Inventory
app.get('/api/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Orders
app.get('/api/orders', (req, res) => {
    const query = `
        SELECT o.*, b.name as brand_name, b.color as brand_color, c.account_name
        FROM orders o
        JOIN brands b ON o.brand_id = b.id
        JOIN customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/orders', (req, res) => {
    const { brand_id, customer_id, type, subtotal, vat, total, notes, delivery_date, items } = req.body;
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Get brand prefix and current count to generate order number
        db.get('SELECT prefix, code FROM brands WHERE id = ?', [brand_id], (err, brand) => {
            if (err || !brand) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Brand not found' });
            }
            
            const countQuery = 'SELECT COUNT(*) as count FROM orders WHERE brand_id = ?';
            db.get(countQuery, [brand_id], (err, row) => {
                const orderNumber = `${brand.prefix}${(row.count + 1).toString().padStart(4, '0')}`;
                const status = type === 'quotation' ? 'Sent to customer' : 'Pending Approval';
                
                const orderQuery = `
                    INSERT INTO orders (order_number, brand_id, customer_id, type, status, subtotal, vat, total, notes, delivery_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                db.run(orderQuery, [orderNumber, brand_id, customer_id, type, status, subtotal, vat, total, notes, delivery_date], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }
                    
                    const orderId = this.lastID;
                    const itemQuery = `
                        INSERT INTO order_items (order_id, inventory_id, quantity, unit_price, discount_percent, item_total)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    
                    const itemPromises = items.map(item => {
                        return new Promise((resolve, reject) => {
                            db.run(itemQuery, [orderId, item.inventory_id, item.quantity, item.unit_price, item.discount_percent, item.total], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                    });
                    
                    Promise.all(itemPromises)
                        .then(() => {
                            db.run('COMMIT');
                            res.json({ success: true, order_id: orderId, order_number: orderNumber });
                        })
                        .catch(err => {
                            db.run('ROLLBACK');
                            res.status(500).json({ error: err.message });
                        });
                });
            });
        });
    });
});

// Dashboard Stats
app.get('/api/stats', (req, res) => {
    const query = `
        SELECT 
            COUNT(CASE WHEN type = 'quotation' THEN 1 END) as activeQuotations,
            COUNT(CASE WHEN type = 'salesorder' AND status != 'Completed' THEN 1 END) as pendingOrders,
            COUNT(CASE WHEN type = 'invoice' AND status != 'Paid' THEN 1 END) as unpaidInvoices,
            SUM(CASE WHEN type = 'quotation' THEN total ELSE 0 END) as quotationValue,
            SUM(CASE WHEN type = 'salesorder' THEN total ELSE 0 END) as orderValue,
            SUM(CASE WHEN type = 'invoice' AND status != 'Paid' THEN total ELSE 0 END) as invoiceValue
        FROM orders
    `;
    db.get(query, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            activeQuotations: row.activeQuotations || 0,
            pendingOrders: row.pendingOrders || 0,
            unpaidInvoices: row.unpaidInvoices || 0,
            fulfilmentRate: '98.2%',
            returns: 3,
            quotationValue: `AED ${(row.quotationValue || 0).toLocaleString()}`,
            orderValue: `AED ${(row.orderValue || 0).toLocaleString()}`,
            invoiceValue: `AED ${(row.invoiceValue || 0).toLocaleString()}`
        });
    });
});

app.listen(port, () => {
    console.log(`[BACKEND] HouseMart API Online: PORT ${port}`);
});
