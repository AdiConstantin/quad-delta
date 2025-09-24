INSERT INTO products (sku, name, price) VALUES
('SKU-200','PG Valve',1999.99),
('SKU-201','PG Sensor',499.50),
('SKU-202','PG Detector',799.00)
ON CONFLICT DO NOTHING;
