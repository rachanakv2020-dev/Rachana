# FarmFresh — Vegetable Store

A full-stack demo storefront for selling fresh vegetables online, with a home page,
login/signup, a categorized product catalog with **fixed prices**, and a shopping cart.

```
veggie-store/
├── backend/          Node.js + Express API — customer routes (/api/*) and admin routes (/api/admin/*)
├── user_frontend/    React (Vite) app with the shopping UI
├── admin_frontend/   React (Vite) app for store operations
└── database/         PostgreSQL schema, seed data, and migrations
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

### 1. Database

```bash
createdb veggie_store
psql -d veggie_store -f database/schema.sql
psql -d veggie_store -f database/seed.sql
```

New schema changes go in numbered files under `database/migrations/`; apply them in order
against an existing database with `psql -d veggie_store -f database/migrations/00N_*.sql`.

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env
# edit .env with your PostgreSQL connection values
npm run seed
npm start
```

The API runs at `http://localhost:5000` and serves both the customer routes (`/api/*`)
and the admin routes (`/api/admin/*`) from one server.

### 3. User frontend

In a new terminal:

```bash
cd user_frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api/*` calls to the backend
(see `user_frontend/vite.config.js`), so keep the backend running at the same time.

### 4. Admin frontend

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME` in `backend/.env`, then run
`npm run seed` (or `npm run provision-admin`) once to provision the admin account.

```bash
cd admin_frontend
npm install
npm run dev
```

The admin app runs at `http://localhost:5174` and talks to the same backend at
`http://localhost:5000`, under the `/api/admin` prefix. Its login only issues a token for
users whose database role is `admin`.

### Razorpay payments

Create Razorpay test keys from the Razorpay Dashboard and set them in `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Set the matching public key in `user_frontend/.env`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

Customers now go from the basket to `/payment`. The backend creates the Razorpay order
and verifies the payment signature before marking the order and payment as paid. Use
Razorpay test mode credentials while developing; never put `RAZORPAY_KEY_SECRET` in a
frontend `.env` file or commit any real keys.

Each app has its own environment file: `user_frontend/.env` controls the customer Vite
app, `admin_frontend/.env` controls the admin Vite app, and `backend/.env` controls the
API (both customer and admin routes) and its database connection. Copy the matching
`.env.example` files when setting up another environment, and never commit the `.env`
files.

### 5. Try it out

1. Open `http://localhost:5173`.
2. Browse vegetables from the Home page or the **Vegetables** tab, filter by category.
3. Add items to your cart (no login required to browse or add to cart).
4. Go to **Cart** → **Place order**. You'll be asked to log in / sign up first — the
  signup form creates a real account against the PostgreSQL database.

## Notes for going to production

- User accounts, the catalog, and the server-side cart are stored in PostgreSQL. Configure
  the connection in `backend/.env` before starting the API.
- Set a strong `JWT_SECRET` environment variable instead of the built-in dev default.
- Prices live in `backend/data/vegetables.js` — edit that file to change stock/prices
  or add new vegetables and categories.
- Add HTTPS, input validation, and rate limiting on the auth routes before going live.

## Tech stack

- **Frontend:** React 18, React Router, Vite, plain CSS (no UI framework)
- **Backend:** Node.js, Express, JWT auth, bcrypt password hashing
- **Database:** PostgreSQL
