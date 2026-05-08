-- HouseMart Database Schema

-- Brands
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL, -- HMS, DA, HL, SK
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL,
    prefix VARCHAR(20) NOT NULL
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    role VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    address TEXT,
    payment_terms VARCHAR(100) DEFAULT 'Net 30 days',
    market VARCHAR(50) DEFAULT 'UAE'
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    stock_level INTEGER DEFAULT 0,
    category VARCHAR(100)
);

-- Orders (Quotations, Sales Orders, Invoices)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    brand_id INTEGER REFERENCES brands(id),
    customer_id INTEGER REFERENCES customers(id),
    type VARCHAR(20) CHECK (type IN ('quotation', 'salesorder', 'invoice')),
    status VARCHAR(50) NOT NULL, -- Pending, Confirmed, Shipped, etc.
    subtotal DECIMAL(15, 2) DEFAULT 0,
    vat DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    shipping_ref VARCHAR(100)
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    inventory_id INTEGER REFERENCES inventory(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    item_total DECIMAL(15, 2) NOT NULL
);

-- Initial Data
INSERT INTO brands (code, name, color, prefix) VALUES
('HMS', 'HM Signature', '#4A5F78', 'HMS-2026-'),
('DA', 'Dallah Addar', '#8B5E3C', 'DA-2026-'),
('HL', 'Home.ly', '#5C8A3C', 'HL-2026-'),
('SK', 'SKOV', '#2f6b33', 'SK-2026-')
ON CONFLICT (code) DO NOTHING;

INSERT INTO customers (name, account_name, contact_name, role, email, phone, whatsapp, address, market) VALUES
('Lulu Hypermarket', 'Lulu Hypermarket UAE', 'Ahmed Al Rashid', 'Category buyer', 'ahmed.alrashid@luluhypermarket.com', '+971501234567', '+971501234567', 'Dubai, UAE', 'UAE'),
('Homecentre', 'Homecentre Kuwait', 'Fatima Hassan', 'Purchasing manager', 'fatima.hassan@homecentre.com', '+96599876543', '+96599876543', 'Kuwait City', 'Kuwait'),
('Spinneys', 'Spinneys UAE', 'Sara Mitchell', 'Category buyer', 'sara.mitchell@spinneys.com', '+971556789012', '+971556789012', 'Dubai, UAE', 'UAE')
ON CONFLICT DO NOTHING;
