INSERT INTO categories (id, name, emoji) VALUES
  ('leafy', 'Leafy Greens', '🥬'),
  ('root', 'Root Vegetables', '🥕'),
  ('gourd', 'Gourds & Squash', '🎃'),
  ('nightshade', 'Nightshades', '🍆'),
  ('allium', 'Onion Family', '🧅'),
  ('pod', 'Pods & Beans', '🫛')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    emoji = EXCLUDED.emoji;

INSERT INTO vegetables (id, name, category_id, price, unit, stock, listed, tag, image) VALUES
  (1, 'Spinach', 'leafy', 30.00, 'kg', 40, true, 'Fresh cut today', '🥬'),
  (2, 'Kale', 'leafy', 60.00, 'kg', 25, true, 'Farm favorite', '🥬'),
  (3, 'Lettuce', 'leafy', 45.00, 'kg', 30, true, 'Crisp & crunchy', '🥬'),
  (4, 'Fenugreek (Methi)', 'leafy', 25.00, 'kg', 35, true, '', '🌿'),
  (5, 'Carrot', 'root', 40.00, 'kg', 60, true, 'Sweet & crunchy', '🥕'),
  (6, 'Potato', 'root', 25.00, 'kg', 100, true, 'Best seller', '🥔'),
  (7, 'Beetroot', 'root', 35.00, 'kg', 45, true, '', '🥔'),
  (8, 'Radish', 'root', 20.00, 'kg', 50, true, '', '🥕'),
  (9, 'Pumpkin', 'gourd', 30.00, 'kg', 20, true, '', '🎃'),
  (10, 'Bottle Gourd', 'gourd', 28.00, 'kg', 22, true, '', '🥒'),
  (11, 'Cucumber', 'gourd', 32.00, 'kg', 55, true, 'Hydrating', '🥒'),
  (12, 'Bitter Gourd', 'gourd', 38.00, 'kg', 18, true, '', '🥒'),
  (13, 'Tomato', 'nightshade', 35.00, 'kg', 70, true, 'Vine ripened', '🍅'),
  (14, 'Brinjal (Eggplant)', 'nightshade', 30.00, 'kg', 40, true, '', '🍆'),
  (15, 'Bell Pepper', 'nightshade', 70.00, 'kg', 28, true, 'Rainbow mix', '🫑'),
  (16, 'Chili Pepper', 'nightshade', 55.00, 'kg', 20, true, 'Spicy', '🌶️'),
  (17, 'Onion', 'allium', 28.00, 'kg', 90, true, 'Kitchen staple', '🧅'),
  (18, 'Garlic', 'allium', 120.00, 'kg', 30, true, '', '🧄'),
  (19, 'Spring Onion', 'allium', 22.00, 'bunch', 40, true, '', '🧅'),
  (20, 'Green Beans', 'pod', 45.00, 'kg', 33, true, '', '🫛'),
  (21, 'Green Peas', 'pod', 50.00, 'kg', 27, true, 'Sweet & tender', '🫛'),
  (22, 'Okra (Ladyfinger)', 'pod', 40.00, 'kg', 24, true, '', '🫛')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    unit = EXCLUDED.unit,
    stock = EXCLUDED.stock,
    listed = EXCLUDED.listed,
    tag = EXCLUDED.tag,
    image = EXCLUDED.image;

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Store Administrator', 'admin@veggiestore.local', '$2a$10$M0jQxWbN3I9JfC.pR0h9M.pv.U0OVV5OR0Y1xxHkpExl9wzZAwVra', 'admin')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = 'admin';
