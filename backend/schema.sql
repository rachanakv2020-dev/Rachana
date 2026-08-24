CREATE DATABASE IF NOT EXISTS veggie_store;
USE veggie_store;

CREATE TABLE IF NOT EXISTS users (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(120) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS categories (
	id VARCHAR(32) NOT NULL,
	name VARCHAR(120) NOT NULL,
	emoji VARCHAR(16) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS vegetables (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(120) NOT NULL,
	category_id VARCHAR(32) NOT NULL,
	price DECIMAL(10, 2) NOT NULL,
	unit VARCHAR(20) NOT NULL,
	stock INT UNSIGNED NOT NULL DEFAULT 0,
	listed TINYINT(1) NOT NULL DEFAULT 1,
	tag VARCHAR(120) NOT NULL DEFAULT '',
	image VARCHAR(1000) NOT NULL,
	PRIMARY KEY (id),
	CONSTRAINT fk_vegetables_category
		FOREIGN KEY (category_id) REFERENCES categories (id)
		ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS cart_items (
	user_id INT UNSIGNED NOT NULL,
	vegetable_id INT UNSIGNED NOT NULL,
	quantity INT UNSIGNED NOT NULL DEFAULT 1,
	PRIMARY KEY (user_id, vegetable_id),
	CONSTRAINT fk_cart_items_user
		FOREIGN KEY (user_id) REFERENCES users (id)
		ON DELETE CASCADE,
	CONSTRAINT fk_cart_items_vegetable
		FOREIGN KEY (vegetable_id) REFERENCES vegetables (id)
		ON DELETE CASCADE
);

	CREATE TABLE IF NOT EXISTS orders (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		user_id INT UNSIGNED NOT NULL,
		shipping_address VARCHAR(500) NOT NULL,
		total DECIMAL(10, 2) NOT NULL,
		status ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (id),
		CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS payments (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		order_id BIGINT UNSIGNED NOT NULL,
		user_id INT UNSIGNED NOT NULL,
		amount DECIMAL(10, 2) NOT NULL,
		method VARCHAR(40) NOT NULL DEFAULT 'Cash on delivery',
		gateway_order_id VARCHAR(100) NULL,
		gateway_payment_id VARCHAR(100) NULL,
		status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (id),
		CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
		CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
	);
