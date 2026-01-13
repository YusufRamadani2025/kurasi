-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending', -- pending, paid, shipped, completed, cancelled
  shipping_address text NOT NULL,
  payment_method text DEFAULT 'manual_transfer',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders."
  ON orders FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can create orders."
  ON orders FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Admins/Sellers can view orders containing their products." 
-- Note: Simplified for MVP. Ideally sellers only see their relevant order items.
-- For now, allow sellers to view orders generally or restrict strictly.
-- Let's stick to: Users see own, Admins see all.
  ON orders FOR SELECT
  USING ( 
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 2. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  price numeric NOT NULL -- Store price at time of purchase
);

-- RLS for Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items."
  ON order_items FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items."
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );


-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public."
  ON reviews FOR SELECT
  USING ( true );

CREATE POLICY "Authenticated users can create reviews."
  ON reviews FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own reviews."
  ON reviews FOR DELETE
  USING ( auth.uid() = user_id );


-- 4. STORAGE FOR REVIEW IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Review images are public."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'review-images' );

CREATE POLICY "Users can upload review images."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'review-images' 
    AND auth.role() = 'authenticated'
  ); 
