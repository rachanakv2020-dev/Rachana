USE veggie_store;

ALTER TABLE users
  ADD COLUMN role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer';

ALTER TABLE vegetables
  MODIFY COLUMN image VARCHAR(1000) NOT NULL;

ALTER TABLE vegetables
  ADD COLUMN listed TINYINT(1) NOT NULL DEFAULT 1;