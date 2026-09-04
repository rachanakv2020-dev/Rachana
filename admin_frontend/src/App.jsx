import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { api } from "./api.js";

const demoOrders = [
  { id: "#FF-1048", customer: "Maya Patel", items: "6 items", total: "$42.80", status: "Packing", date: "Today, 10:42 AM" },
  { id: "#FF-1047", customer: "Noah Williams", items: "3 items", total: "$18.50", status: "Out for delivery", date: "Today, 09:16 AM" },
  { id: "#FF-1046", customer: "Sofia Garcia", items: "9 items", total: "$64.20", status: "Delivered", date: "Yesterday, 05:28 PM" },
  { id: "#FF-1045", customer: "Arjun Mehta", items: "4 items", total: "$27.40", status: "Delivered", date: "Yesterday, 02:05 PM" },
  { id: "#FF-1044", customer: "Elena Rossi", items: "7 items", total: "$51.90", status: "Refunded", date: "Aug 21, 11:31 AM" },
];

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      const data = await api.adminLogin({ email, password });
      sessionStorage.setItem("ff_admin", "true");
      localStorage.setItem("ff_admin_token", data.token);
      onLogin();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-login__visual">
        <div className="admin-login__brand"><span>✳</span> FarmFresh <b>Studio</b></div>
        <div className="admin-login__message">
          <p className="admin-kicker">Operations console</p>
          <h1>Keep the harvest moving.</h1>
          <p>One clear view of every order, payment, and product on the market today.</p>
        </div>
        <div className="admin-login__sprout">✣</div>
      </div>
      <form className="admin-login__form" onSubmit={submit}>
        <div className="admin-login__form-head">
          <span className="admin-mark">✳</span>
          <p className="admin-kicker">FarmFresh / Admin</p>
          <h2>Welcome back</h2>
          <p>Sign in to your operations workspace.</p>
        </div>
        <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="admin-error">{error}</p>}
        <button className="admin-button admin-button--dark" type="submit">Enter workspace <span>→</span></button>
        <p className="admin-hint">Admin credentials are provisioned by your store owner.</p>
      </form>
    </main>
  );
}

function AdminShell({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const pageTitle = location.pathname.includes("orders") ? "Orders" : location.pathname.includes("payments") ? "Payments" : location.pathname.includes("products") ? "Products" : "Overview";
  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <NavLink to="/admin" end className="admin-logo"><span>✳</span><strong>FarmFresh</strong><small>STUDIO</small></NavLink>
        <p className="admin-nav-label">Workspace</p>
        <nav className="admin-nav">
          <NavLink to="/admin" end><span>⌂</span> Overview</NavLink>
          <NavLink to="/admin/orders"><span>☷</span> Orders</NavLink>
          <NavLink to="/admin/payments"><span>◈</span> Payments</NavLink>
          <NavLink to="/admin/products"><span>▦</span> Products</NavLink>
        </nav>
        <div className="admin-sidebar__bottom">
          <div className="admin-profile"><span>AK</span><div><strong>Amara Khan</strong><small>Administrator</small></div><button onClick={onLogout} aria-label="Log out">↗</button></div>
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar"><div><p className="admin-kicker">Monday, August 24, 2026</p><h1>{pageTitle}</h1></div><div className="admin-topbar__actions"><div className="admin-notifications"><button className="admin-icon-button" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications((open) => !open)}>♢</button>{showNotifications && <div className="admin-notification-popover"><strong>Notifications</strong><span>You are all caught up.</span></div>}</div><button className="admin-store-link" onClick={() => navigate("/")}>View storefront <span>↗</span></button></div></header>
        {notice && <div className="admin-toast">{notice}</div>}
        {showProductForm && <ProductForm onClose={() => setShowProductForm(false)} onCreated={(product) => { setProducts((current) => [product, ...current]); setShowProductForm(false); flash(`${product.name} added to the catalog.`); }} />}
        <Routes>
          <Route path="/admin" element={<OverviewLive products={products} onAction={() => setShowProductForm(true)} />} />
          <Route path="/admin/orders" element={<OrdersLive />} />
          <Route path="/admin/payments" element={<PaymentsLive />} />
          <Route path="/admin/products" element={<ProductsAdminManage products={products} search={productSearch} setSearch={setProductSearch} onAction={flash} onAdd={() => setShowProductForm(true)} onProductsChange={setProducts} />} />
        </Routes>
      </div>
    </div>
  );
}

function OverviewLive({ products, onAction }) {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function refresh() {
      const [nextOrders, nextPayments] = await Promise.all([
        api.getOrders().catch(() => []),
        api.getPayments().catch(() => []),
      ]);
      if (active) {
        setOrders(nextOrders);
        setPayments(nextPayments);
        setLoading(false);
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const grossSales = payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount), 0);
  const averageOrder = orders.length ? orders.reduce((sum, order) => sum + Number(order.total), 0) / orders.length : 0;
  const lowStock = products.filter((product) => Number(product.stock) < 10).length;
  const recentOrders = orders.slice(0, 4).map((order) => ({
    ...order,
    id: `#${order.id}`,
    items: `${order.paymentStatus} payment`,
    total: `₹${Number(order.total).toFixed(2)}`,
  }));

  return <div className="admin-page"><section className="admin-welcome"><div><p className="admin-kicker">Live store activity</p><h2>{loading ? "Loading your market..." : orders.length ? "Your market is looking fresh." : "Your market is ready."}</h2><p>Metrics and orders refresh automatically from customer activity.</p></div><button className="admin-button admin-button--orange" onClick={() => onAction("New product flow is ready to connect.")}>＋ Add product</button></section><div className="stat-grid"><Stat label="Gross sales" value={`₹${grossSales.toFixed(2)}`} delta={`${payments.length} payment${payments.length === 1 ? "" : "s"}`} tone="orange" /><Stat label="Total orders" value={orders.length} delta="All customer orders" tone="green" /><Stat label="Average order" value={`₹${averageOrder.toFixed(2)}`} delta="Across all orders" tone="blue" /><Stat label="Low stock items" value={lowStock} delta={lowStock ? "Needs attention" : "All shelves stocked"} tone="yellow" /></div><div className="admin-grid-two"><section className="admin-panel"><div className="panel-head"><div><p className="admin-kicker">Live pulse</p><h3>Sales overview</h3></div><span className="live-indicator">● Live</span></div>{payments.length === 0 ? <div className="payments-empty"><strong>No sales yet</strong><span>Sales will appear after a customer completes checkout.</span></div> : <div className="live-sales-note">{payments.length} real customer payment{payments.length === 1 ? "" : "s"} recorded in the admin ledger.</div>}</section><section className="admin-panel admin-panel--orders"><div className="panel-head"><div><p className="admin-kicker">Live customer activity</p><h3>Recent orders</h3></div><NavLink to="/admin/orders">View all →</NavLink></div>{recentOrders.length === 0 ? <div className="payments-empty"><strong>No customer orders yet</strong><span>Completed checkouts will appear here.</span></div> : recentOrders.map((order) => <OrderRow key={order.id} order={order} />)}</section></div></div>;
}

function Overview({ onAction }) {
  return <div className="admin-page"><section className="admin-welcome"><div><p className="admin-kicker">Good morning, Amara</p><h2>Your market is looking fresh.</h2><p>Here is what needs your attention today.</p></div><button className="admin-button admin-button--orange" onClick={() => onAction("New product flow is ready to connect.")}>＋ Add product</button></section><div className="stat-grid"><Stat label="Gross sales" value="$12,480.40" delta="+18.6%" tone="orange" /><Stat label="Orders today" value="48" delta="+12.4%" tone="green" /><Stat label="Average order" value="$32.18" delta="+4.2%" tone="blue" /><Stat label="Low stock items" value="7" delta="Needs attention" tone="yellow" /></div><div className="admin-grid-two"><section className="admin-panel"><div className="panel-head"><div><p className="admin-kicker">Live pulse</p><h3>Sales overview</h3></div><select aria-label="Sales period"><option>Last 7 days</option><option>Last 30 days</option></select></div><div className="chart"><div className="chart__labels"><span>$3k</span><span>$2k</span><span>$1k</span><span>$0</span></div><div className="chart__area"><div className="chart__gridlines"><i /><i /><i /><i /></div><svg viewBox="0 0 640 220" preserveAspectRatio="none" aria-label="Sales chart"><path d="M0 180 C50 174 70 135 112 148 S160 180 205 128 S260 138 300 104 S355 126 385 82 S430 116 468 70 S530 96 565 38 S610 60 640 20" /><path className="chart__fill" d="M0 180 C50 174 70 135 112 148 S160 180 205 128 S260 138 300 104 S355 126 385 82 S430 116 468 70 S530 96 565 38 S610 60 640 20 V220 H0Z" /></svg><div className="chart__dates"><span>18 Aug</span><span>20 Aug</span><span>22 Aug</span><span>24 Aug</span></div></div></div></section><section className="admin-panel admin-panel--orders"><div className="panel-head"><div><p className="admin-kicker">Needs a look</p><h3>Recent orders</h3></div><NavLink to="/admin/orders">View all →</NavLink></div>{demoOrders.slice(0, 4).map((order) => <OrderRow key={order.id} order={order} />)}</section></div></div>;
}

function Stat({ label, value, delta, tone }) { return <div className={`stat-card stat-card--${tone}`}><span className="stat-card__icon">{tone === "orange" ? "↗" : tone === "green" ? "◷" : tone === "blue" ? "⌁" : "!"}</span><p>{label}</p><strong>{value}</strong><small>{delta}</small></div>; }
function Status({ children }) { return <span className={`status status--${children.toLowerCase().replaceAll(" ", "-")}`}><i />{children}</span>; }
function OrderRow({ order }) { return <div className="order-row"><span className="order-avatar">{order.customer.split(" ").map((name) => name[0]).join("")}</span><div className="order-customer"><strong>{order.customer}</strong><small>{order.id} · {order.items}</small></div><Status>{order.status}</Status><strong className="order-total">{order.total}</strong></div>; }

function Orders({ onAction }) { return <div className="admin-page"><div className="page-toolbar"><div><p className="admin-kicker">48 orders this week</p><p className="toolbar-copy">Manage fulfillment from first pick to doorstep.</p></div><div className="toolbar-actions"><button className="filter-button">All orders⌄</button><button className="admin-button admin-button--orange" onClick={() => onAction("Order export prepared.")}>Export CSV ↗</button></div></div><section className="admin-panel admin-table-panel"><div className="table-head"><span>Order</span><span>Customer</span><span>Date</span><span>Total</span><span>Status</span><span /></div>{demoOrders.map((order) => <div className="table-row" key={order.id}><strong>{order.id}</strong><span>{order.customer}<small>{order.items}</small></span><span>{order.date}</span><strong>{order.total}</strong><Status>{order.status}</Status><button className="row-menu" onClick={() => onAction(`${order.id} selected.`)} aria-label={`Open ${order.id}`}>•••</button></div>)}</section></div>; }
function Payments() { return <div className="admin-page"><div className="payment-summary"><div><p className="admin-kicker">August 2026</p><h2>$9,842.60</h2><span className="summary-up">↗ 14.8% <em>vs last month</em></span></div><div className="payment-summary__meta"><span>Successful payments</span><strong>96.4%</strong><div className="progress"><i /></div><small>342 of 355 transactions</small></div></div><section className="admin-panel admin-table-panel"><div className="panel-head"><div><p className="admin-kicker">Transaction log</p><h3>Recent payments</h3></div><button className="filter-button">All statuses⌄</button></div><div className="table-head payment-head"><span>Transaction</span><span>Order</span><span>Customer</span><span>Method</span><span>Amount</span><span>Status</span></div>{demoPayments.map((payment) => <div className="table-row payment-row" key={payment.id}><span><strong>{payment.id}</strong><small>{payment.time}</small></span><strong>{payment.order}</strong><span>{payment.customer}</span><span>{payment.method}</span><strong>{payment.amount}</strong><Status>{payment.status}</Status></div>)}</section></div>; }
function ProductsAdmin({ products, search, setSearch, onAction, onAdd }) { const visibleProducts = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())), [products, search]); return <div className="admin-page"><div className="page-toolbar"><div><p className="admin-kicker">{products.length || 12} products in catalog</p><p className="toolbar-copy">Keep your market shelves accurate and ready.</p></div><div className="toolbar-actions"><input className="admin-search" type="search" placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="admin-button admin-button--orange" onClick={onAdd}>＋ Add product</button></div></div><section className="admin-panel admin-table-panel"><div className="table-head product-head"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span /></div>{(visibleProducts.length ? visibleProducts : fallbackProducts).map((product) => <div className="table-row product-row" key={product.id}><span className="product-cell"><span className="product-image">{product.image || "🥬"}</span><strong>{product.name}</strong></span><span>{product.category || "Seasonal"}</span><span>${Number(product.price || 2.8).toFixed(2)} <small>/ {product.unit || "kg"}</small></span><span>{product.stock ?? 24} units</span><Status>{(product.stock ?? 24) < 10 ? "Low stock" : "In stock"}</Status><button className="row-menu" onClick={() => onAction(`${product.name} selected.`)} aria-label={`Open ${product.name}`}>•••</button></div>)}</section></div>; }

function ProductFormLegacy({ onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", price: "", unit: "kg", stock: "", tag: "", image: "🥬" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.getCategories().then((items) => { setCategories(items); setForm((current) => ({ ...current, category: current.category || items[0]?.id || "" })); }).catch(() => setError("Unable to load categories.")); }, []);
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) { event.preventDefault(); setSaving(true); setError(""); try { onCreated(await api.createProduct({ ...form, price: Number(form.price), stock: Number(form.stock) })); } catch (err) { setError(err.message); } finally { setSaving(false); } }
  return <div className="modal-backdrop"><form className="product-modal" onSubmit={submit}><div className="panel-head"><div><p className="admin-kicker">Catalog / New item</p><h3>Add product</h3></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button></div><div className="product-form-grid"><label>Product name<input name="name" value={form.name} onChange={change} placeholder="Rainbow carrots" required /></label><label>Category<select name="category" value={form.category} onChange={change} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Price<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} placeholder="3.80" required /></label><label>Unit<input name="unit" value={form.unit} onChange={change} required /></label><label>Stock<input name="stock" type="number" min="0" step="1" value={form.stock} onChange={change} placeholder="40" required /></label><label>Image emoji<input name="image" value={form.image} onChange={change} maxLength="2" /></label></div>{error && <p className="admin-error">{error}</p>}<div className="modal-actions"><button type="button" className="filter-button" onClick={onClose}>Cancel</button><button type="submit" className="admin-button admin-button--orange" disabled={saving}>{saving ? "Saving..." : "Add to catalog"}</button></div></form></div>;
}

const fallbackProducts = [{ id: 1, name: "Rainbow carrots", category: "Root vegetables", price: 3.8, unit: "kg", stock: 42, image: "🥕" }, { id: 2, name: "Baby spinach", category: "Leafy greens", price: 4.2, unit: "bunch", stock: 8, image: "🥬" }, { id: 3, name: "Heirloom tomatoes", category: "Fruits", price: 5.6, unit: "kg", stock: 31, image: "🍅" }, { id: 4, name: "English cucumber", category: "Fresh picks", price: 2.8, unit: "each", stock: 24, image: "🥒" }];

function OrdersLive() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false)); }, []);
  return <div className="admin-page"><div className="page-toolbar"><div><p className="admin-kicker">Customer orders</p><p className="toolbar-copy">Orders placed through the storefront appear here.</p></div></div><section className="admin-panel admin-table-panel">{loading ? <div className="payments-empty">Loading orders...</div> : orders.length === 0 ? <div className="payments-empty"><strong>No customer orders yet</strong><span>Orders will appear here after a customer completes checkout.</span></div> : <><div className="table-head orders-live-head"><span>Order</span><span>Customer</span><span>Date</span><span>Total</span><span>Order status</span><span>Payment</span></div>{orders.map((order) => <div className="table-row orders-live-row" key={order.id}><strong>#{order.id}</strong><span>{order.customer}</span><span>{new Date(order.createdAt).toLocaleString()}</span><strong>₹{Number(order.total).toFixed(2)}</strong><Status>{order.status}</Status><Status>{order.paymentStatus}</Status></div>)}</>}</section></div>;
}

function PaymentsLive() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getPayments().then(setPayments).catch(() => setPayments([])).finally(() => setLoading(false)); }, []);
  const total = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  return <div className="admin-page"><div className="payment-summary"><div><p className="admin-kicker">Live customer payments</p><h2>${total.toFixed(2)}</h2><span className="summary-up">{payments.length} recorded transaction{payments.length === 1 ? "" : "s"}</span></div><div className="payment-summary__meta"><span>Payment records</span><strong>{payments.length}</strong><small>Only completed customer checkouts appear here</small></div></div><section className="admin-panel admin-table-panel"><div className="panel-head"><div><p className="admin-kicker">Transaction log</p><h3>Customer payments</h3></div></div>{loading ? <div className="payments-empty">Loading payment records...</div> : payments.length === 0 ? <div className="payments-empty"><strong>No customer payments yet</strong><span>Payments will appear here after a customer completes checkout.</span></div> : <><div className="table-head payment-head"><span>Transaction</span><span>Order</span><span>Customer</span><span>Method</span><span>Amount</span><span>Status</span></div>{payments.map((payment) => <div className="table-row payment-row" key={payment.id}><span><strong>pay_{payment.id}</strong><small>{new Date(payment.createdAt).toLocaleString()}</small></span><strong>#{payment.orderId}</strong><span>{payment.customer}</span><span>{payment.method}</span><strong>${Number(payment.amount).toFixed(2)}</strong><Status>{payment.status}</Status></div>)}</>}</section></div>;
}

function ProductsAdminManage({ products, search, setSearch, onAction, onAdd, onProductsChange }) {
  const [busyId, setBusyId] = useState(null);
  const visibleProducts = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())), [products, search]);
  async function setListing(product, listed) {
    setBusyId(product.id);
    try {
      const updated = await api.setProductListed(product.id, listed);
      onProductsChange((current) => current.map((item) => item.id === updated.id ? updated : item));
      onAction(`${product.name} ${listed ? "listed" : "unlisted"}.`);
    } catch (error) { onAction(error.message); } finally { setBusyId(null); }
  }
  async function remove(product) {
    if (!window.confirm(`Remove ${product.name} permanently?`)) return;
    setBusyId(product.id);
    try {
      await api.deleteProduct(product.id);
      onProductsChange((current) => current.filter((item) => item.id !== product.id));
      onAction(`${product.name} removed permanently.`);
    } catch (error) { onAction(error.message); } finally { setBusyId(null); }
  }
  return <div className="admin-page"><div className="page-toolbar"><div><p className="admin-kicker">{products.length || 12} products in catalog</p><p className="toolbar-copy">List products for customers, hide them, or remove them.</p></div><div className="toolbar-actions"><input className="admin-search" type="search" placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="admin-button admin-button--orange" onClick={onAdd}>＋ Add product</button></div></div><section className="admin-panel admin-table-panel"><div className="table-head product-head product-head--actions"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span>Actions</span></div>{(visibleProducts.length ? visibleProducts : fallbackProducts).map((product) => <div className="table-row product-row product-row--actions" key={product.id}><span className="product-cell"><span className="product-image">{product.image?.startsWith("http") ? <img src={product.image} alt="" /> : product.image || "🥬"}</span><strong>{product.name}</strong></span><span>{product.category || "Seasonal"}</span><span>${Number(product.price || 2.8).toFixed(2)} <small>/ {product.unit || "kg"}</small></span><span>{product.stock ?? 24} units</span><Status>{product.listed === 0 ? "Unlisted" : (product.stock ?? 24) < 10 ? "Low stock" : "In stock"}</Status><div className="product-actions"><button disabled={busyId === product.id} onClick={() => setListing(product, product.listed === 0)}>{product.listed === 0 ? "List" : "Unlist"}</button><button className="product-actions__remove" disabled={busyId === product.id} onClick={() => remove(product)}>Remove</button></div></div>)}</section></div>;
}

function ProductForm({ onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", price: "", unit: "kg", stock: "", tag: "", image: "" });
  const [imageMode, setImageMode] = useState("upload");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { api.getCategories().then((items) => { setCategories(items); setForm((current) => ({ ...current, category: current.category || items[0]?.id || "" })); }).catch(() => setError("Unable to load categories.")); }, []);
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function chooseImage(event) { const file = event.target.files[0]; if (!file) return; setUploading(true); setError(""); try { const result = await api.uploadImage(file); setForm((current) => ({ ...current, image: result.url })); } catch (err) { setError(err.message); } finally { setUploading(false); } }
  async function submit(event) { event.preventDefault(); setSaving(true); setError(""); try { onCreated(await api.createProduct({ ...form, price: Number(form.price), stock: Number(form.stock), image: form.image || "🥬" })); } catch (err) { setError(err.message); } finally { setSaving(false); } }
  return <div className="modal-backdrop"><form className="product-modal" onSubmit={submit}><div className="panel-head"><div><p className="admin-kicker">Catalog / New item</p><h3>Add product</h3></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button></div><div className="product-form-grid"><label>Product name<input name="name" value={form.name} onChange={change} placeholder="Rainbow carrots" required /></label><label>Category<select name="category" value={form.category} onChange={change} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Price (whole number)<input name="price" type="number" min="0" step="1" inputMode="numeric" value={form.price} onChange={change} placeholder="4" required /></label><label>Unit<input name="unit" value={form.unit} onChange={change} required /></label><label>Stock<input name="stock" type="number" min="0" step="1" inputMode="numeric" value={form.stock} onChange={change} placeholder="40" required /></label><div className="image-field"><span>Product image</span><div className="image-mode"><button type="button" className={imageMode === "upload" ? "is-active" : ""} onClick={() => setImageMode("upload")}>Upload file</button><button type="button" className={imageMode === "url" ? "is-active" : ""} onClick={() => setImageMode("url")}>Cloudinary URL</button></div>{imageMode === "upload" ? <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} /> : <input name="image" type="url" value={form.image} onChange={change} placeholder="https://res.cloudinary.com/..." />}{uploading && <small>Uploading image...</small>}{form.image && <small className="image-ready">Image ready</small>}</div></div>{error && <p className="admin-error">{error}</p>}<div className="modal-actions"><button type="button" className="filter-button" onClick={onClose}>Cancel</button><button type="submit" className="admin-button admin-button--orange" disabled={saving || uploading}>{saving ? "Saving..." : "Add to catalog"}</button></div></form></div>;
}

export default function Admin() { const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("ff_admin") === "true" && Boolean(localStorage.getItem("ff_admin_token"))); if (!authenticated) return <AdminLogin onLogin={() => setAuthenticated(true)} />; return <AdminShell onLogout={() => { sessionStorage.removeItem("ff_admin"); localStorage.removeItem("ff_admin_token"); setAuthenticated(false); }} />; }