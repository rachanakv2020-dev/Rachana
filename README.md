# FarmFresh — Vegetable Store

A full-stack demo storefront for selling fresh vegetables online, with a home page,
login/signup, a categorized product catalog with **fixed prices**, and a shopping cart.

```
veggie-store/
├── backend/     Node.js + Express API (auth, products, categories, cart)
└── frontend/    React (Vite) app with the shopping UI
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

### 3. Try it out

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
