const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'housemart.db');
const db = new sqlite3.Database(dbPath);

const schema = `
-- Brands
CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL, -- HMS, DA, HL, SK
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    prefix TEXT NOT NULL
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    contact_name TEXT,
    role TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    payment_terms TEXT DEFAULT 'Net 30 days',
    market TEXT DEFAULT 'UAE'
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_id INTEGER REFERENCES brands(id),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    unit_price REAL NOT NULL,
    stock_level INTEGER DEFAULT 0,
    category TEXT
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    brand_id INTEGER REFERENCES brands(id),
    customer_id INTEGER REFERENCES customers(id),
    type TEXT CHECK (type IN ('quotation', 'salesorder', 'invoice')),
    status TEXT NOT NULL,
    subtotal REAL DEFAULT 0,
    vat REAL DEFAULT 0,
    total REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    shipping_ref TEXT
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    inventory_id INTEGER REFERENCES inventory(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    discount_percent REAL DEFAULT 0,
    item_total REAL NOT NULL
);
`;

const initialData = `
INSERT OR IGNORE INTO brands (code, name, color, prefix) VALUES
('HMS', 'HM Signature', '#4A5F78', 'HMS-2026-'),
('DA', 'Dallah Addar', '#8B5E3C', 'DA-2026-'),
('HL', 'Home.ly', '#5C8A3C', 'HL-2026-'),
('SK', 'SKOV', '#2f6b33', 'SK-2026-');

INSERT OR IGNORE INTO customers (name, account_name, contact_name, role, email, phone, whatsapp, address, market) VALUES
('Lulu Hypermarket', 'Lulu Hypermarket UAE', 'Ahmed Al Rashid', 'Category buyer', 'ahmed.alrashid@luluhypermarket.com', '+971501234567', '+971501234567', 'Dubai, UAE', 'UAE'),
('Homecentre', 'Homecentre Kuwait', 'Fatima Hassan', 'Purchasing manager', 'fatima.hassan@homecentre.com', '+96599876543', '+96599876543', 'Kuwait City', 'Kuwait'),
('Spinneys', 'Spinneys UAE', 'Sara Mitchell', 'Category buyer', 'sara.mitchell@spinneys.com', '+971556789012', '+971556789012', 'Dubai, UAE', 'UAE');
`;

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error creating schema:', err.message);
        } else {
            console.log('Schema created successfully.');
            db.exec(initialData, (err) => {
                if (err) {
                    console.error('Error inserting initial data:', err.message);
                } else {
                    console.log('Initial data inserted successfully.');
                }
                db.close();
            });
        }
    });
});
