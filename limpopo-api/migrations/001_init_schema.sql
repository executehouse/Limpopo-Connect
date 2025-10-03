-- Limpopo Connect - Initial Schema Migration

-- Helper function to update 'updated_at' column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- USERS & AUTHENTICATION
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'visitor',
    name TEXT,
    phone TEXT,
    profile_photo_id UUID, -- FK added later
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
CREATE INDEX idx_users_email ON users(email);

-- BUSINESSES
CREATE TABLE business_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category_id INT REFERENCES business_categories(id) ON DELETE SET NULL,
    description TEXT,
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326),
    phone TEXT,
    website TEXT,
    open_hours JSONB,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 1
);
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_category_id ON businesses(category_id);
CREATE INDEX idx_businesses_geom ON businesses USING GIST (geom);
CREATE INDEX idx_businesses_name_trgm ON businesses USING GIN (name gin_trgm_ops);
CREATE TRIGGER set_businesses_timestamp
BEFORE UPDATE ON businesses
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- UPLOADS & PHOTOS
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blob_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size BIGINT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_uploads_uploaded_by ON uploads(uploaded_by);

ALTER TABLE users ADD CONSTRAINT fk_users_profile_photo
FOREIGN KEY (profile_photo_id) REFERENCES uploads(id) ON DELETE SET NULL;

CREATE TABLE business_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE,
    width INT,
    height INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_business_photos_business_id ON business_photos(business_id);

-- REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type TEXT NOT NULL, -- 'business', 'event', 'market_item'
    target_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE TRIGGER set_reviews_timestamp
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE,
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    capacity INT,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'cancelled', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_events_geom ON events USING GIST (geom);
CREATE INDEX idx_events_title_trgm ON events USING GIN (title gin_trgm_ops);
CREATE TRIGGER set_events_timestamp
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed', -- 'confirmed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);

-- MARKETPLACE
CREATE TABLE market_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'ZAR',
    stock INT,
    shipping_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_market_items_seller_id ON market_items(seller_id);
CREATE INDEX idx_market_items_title_trgm ON market_items USING GIN (title gin_trgm_ops);
CREATE TRIGGER set_market_items_timestamp
BEFORE UPDATE ON market_items
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'paid', 'shipped', 'completed', 'cancelled'
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE TRIGGER set_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES market_items(id) ON DELETE RESTRICT,
    qty INT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_item_id ON order_items(item_id);

-- NEWS
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    hero_image_id UUID REFERENCES uploads(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_news_articles_author_id ON news_articles(author_id);
CREATE INDEX idx_news_articles_slug ON news_articles(slug);
CREATE INDEX idx_news_articles_tags ON news_articles USING GIN (tags);
CREATE TRIGGER set_news_articles_timestamp
BEFORE UPDATE ON news_articles
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    channel TEXT NOT NULL, -- 'email', 'sms', 'push'
    status TEXT NOT NULL, -- 'queued', 'sent', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- AUDIT
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    meta_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);