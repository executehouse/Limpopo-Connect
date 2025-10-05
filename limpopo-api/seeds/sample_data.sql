-- Limpopo Connect - Sample Data

-- To run: psql -U <user> -d <dbname> -f seeds/sample_data.sql

-- Clear existing data
TRUNCATE TABLE users, businesses, business_categories, events, market_items, news_articles, uploads, roles RESTART IDENTITY CASCADE;

-- ROLES
INSERT INTO roles (name) VALUES ('admin'), ('business'), ('resident'), ('visitor');

-- USERS
-- Password for all users is 'password123'
-- Hash generated using argon2 in a dummy script:
-- require('argon2').hash('password123').then(h => console.log(h))
-- Using a placeholder hash for now. Replace with real argon2 hash.
INSERT INTO users (id, email, password_hash, role, name, is_verified) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@limpopo.co.za', '$argon2id$v=19$m=65536,t=3,p=4$JtIDqfk+T4MycqwZ3Kt3kw$nKBT1u0KJVyf8cDGPqUhWq2HqyYmS0YigQzAI/EBYNs', 'admin', 'Admin User', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'business@limpopo.co.za', '$argon2id$v=19$m=65536,t=3,p=4$JtIDqfk+T4MycqwZ3Kt3kw$nKBT1u0KJVyf8cDGPqUhWq2HqyYmS0YigQzAI/EBYNs', 'business', 'Business Owner', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'resident@limpopo.co.za', '$argon2id$v=19$m=65536,t=3,p=4$JtIDqfk+T4MycqwZ3Kt3kw$nKBT1u0KJVyf8cDGPqUhWq2HqyYmS0YigQzAI/EBYNs', 'resident', 'Local Resident', true);

-- BUSINESS CATEGORIES
INSERT INTO business_categories (name, slug) VALUES
('Restaurant', 'restaurant'),
('Lodge', 'lodge'),
('Tour Operator', 'tour-operator'),
('Craft Market', 'craft-market');

-- BUSINESSES
INSERT INTO businesses (owner_id, name, category_id, description, address, lat, lng, geom, phone, website, is_verified) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Savannah Grill', 1, 'Authentic African cuisine under the stars.', '123 Baobab Lane, Polokwane', -23.9045, 29.4689, ST_SetSRID(ST_MakePoint(29.4689, -23.9045), 4326), '015-123-4567', 'https://savannahgrill.co.za', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Marula Lodge', 2, 'Luxury accommodation in the heart of the bushveld.', '456 Marula Drive, Hoedspruit', -24.3499, 30.9707, ST_SetSRID(ST_MakePoint(30.9707, -24.3499), 4326), '015-987-6543', 'https://marulalodge.co.za', true);

-- EVENTS
INSERT INTO events (title, description, start_at, end_at, address, lat, lng, geom, created_by, capacity, status) VALUES
('Polokwane Tech Meetup', 'Monthly meetup for tech enthusiasts.', '2024-08-15 18:00:00+02', '2024-08-15 20:00:00+02', '100 Tech Street, Polokwane', -23.9045, 29.4689, ST_SetSRID(ST_MakePoint(29.4689, -23.9045), 4326), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 50, 'scheduled'),
('Hoedspruit Farmers Market', 'Weekly market with fresh local produce.', '2024-08-17 09:00:00+02', '2024-08-17 14:00:00+02', 'Market Square, Hoedspruit', -24.3499, 30.9707, ST_SetSRID(ST_MakePoint(30.9707, -24.3499), 4326), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 200, 'scheduled');

-- MARKET ITEMS
INSERT INTO market_items (seller_id, title, description, price, stock) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Hand-carved Wooden Giraffe', 'A beautiful, tall giraffe statue, carved from local mopane wood.', 750.00, 5),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Beaded Zulu Necklace', 'Traditional Zulu beadwork in a stunning necklace.', 250.50, 15);

-- UPLOADS (placeholders)
INSERT INTO uploads (id, blob_path, mime_type, size, uploaded_by) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'photos/savannah_grill_main.jpg', 'image/jpeg', 123456, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'hero_images/limpopo_sunset.jpg', 'image/jpeg', 789012, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- NEWS ARTICLES
INSERT INTO news_articles (title, slug, content, excerpt, author_id, published_at, tags, hero_image_id) VALUES
('Limpopo Tourism Boom', 'limpopo-tourism-boom', 'Full article content here...', 'Visitor numbers to the Limpopo province have surged in the last quarter, officials report.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-08-01 10:00:00+02', '{"tourism", "economy"}', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');