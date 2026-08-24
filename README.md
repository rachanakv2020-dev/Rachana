# FarmFresh — Vegetable Store

A full-stack demo storefront for selling fresh vegetables online, with a home page,
login/signup, a categorized product catalog with **fixed prices**, and a shopping cart.

```
veggie-store/
├── backend/          Node.js + Express customer API (auth, products, categories, cart)
├── frontend/         React (Vite) app with the shopping UI
├── admin_backend/    Node.js + Express admin-only API
└── admin_frontend/   React (Vite) app for store operations
```

## Features

- **Home page** — hero section, trust strip, and category shortcuts.
- **Login / Sign up page** — email + password auth backed by the API (JWT).
- **Product listing** — 22 vegetables across 6 categories, each with a fixed price per kg
  (see `backend/data/vegetables.js` to edit prices or add items).
- **Category filter & search** on the products page.
- **Cart** — add/remove/update quantities, subtotal, free-delivery threshold, checkout flow.
  Cart state is kept in the browser (localStorage) so it survives refreshes; a matching
  server-side cart API (`/api/cart`) is also included for logged-in users if you want to
  move cart storage server-side later.

## Getting started

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
# Edit .env and set DB_PASSWORD to your MySQL password.
mysql -u root -p < schema.sql
npm run seed
npm start
```

The API runs at `http://localhost:5000`.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api/*` calls to the backend
(see `frontend/vite.config.js`), so keep the backend running at the same time.

### 3. Admin frontend

For an existing database, run `backend/migrations/admin-role.sql` once first. Set
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME` in `backend/.env`, then run
`npm run seed` once to provision the admin account. Start the separate admin app:

```bash
cd admin_frontend
npm install
npm run dev
```

The admin app runs at `http://localhost:5174` and uses the separate admin API at
`http://localhost:5001`. Its login only issues a token for users whose database role is
`admin`.

### Razorpay payments

Create Razorpay test keys from the Razorpay Dashboard and set them in `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Set the matching public key in `frontend/.env`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

Customers now go from the basket to `/payment`. The backend creates the Razorpay order
and verifies the payment signature before marking the order and payment as paid. Use
Razorpay test mode credentials while developing; never put `RAZORPAY_KEY_SECRET` in a
frontend `.env` file or commit any real keys.

Each app has its own environment file: `frontend/.env` controls the customer Vite app,
`admin_frontend/.env` controls the admin Vite app, `backend/.env` controls the customer
API and database credentials, and `admin_backend/.env` controls the admin API and its
database connection. Copy the matching `.env.example` files when setting up another
environment, and never commit the `.env` files.

### 4. Try it out

1. Open `http://localhost:5173`.
2. Browse vegetables from the Home page or the **Vegetables** tab, filter by category.
3. Add items to your cart (no login required to browse or add to cart).
4. Go to **Cart** → **Place order**. You'll be asked to log in / sign up first — the
  signup form creates a real account against the MySQL database.

## Notes for going to production

- User accounts, the catalog, and the server-side cart are stored in MySQL. Configure
  the connection in `backend/.env` before starting the API.
- Set a strong `JWT_SECRET` environment variable instead of the built-in dev default.
- Prices live in `backend/data/vegetables.js` — edit that file to change stock/prices
  or add new vegetables and categories.
- Add HTTPS, input validation, and rate limiting on the auth routes before going live.

## Tech stack

- **Frontend:** React 18, React Router, Vite, plain CSS (no UI framework)
- **Backend:** Node.js, Express, JWT auth, bcrypt password hashing
