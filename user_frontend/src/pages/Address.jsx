import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Address() {
  const { user } = useAuth();
  const { items } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: "", city: "", state: "", zip: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
    if (!items.length && !location.state?.fromCheckout) navigate("/products");
  }, [user, items.length, location.state, navigate]);

  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function submit(event) {
    event.preventDefault();
    if (form.address.trim().length < 5 || form.city.trim().length < 2 || form.state.trim().length < 2 || !/^\d{5,6}$/.test(form.zip)) {
      setError("Please enter a complete address and valid ZIP code.");
      return;
    }
    const address = `${form.address.trim()}, ${form.city.trim()}, ${form.state.trim()} - ${form.zip}`;
    navigate("/payment", { state: { fromAddress: true, address } });
  }

  return <main className="address-page"><div className="address-progress"><span className="is-done">1</span><i /><span className="is-active">2</span><i /><span>3</span></div><div className="address-page__layout"><section className="address-card"><p className="hero__eyebrow">Step 2 of 3</p><h1>Delivery address</h1><p className="address-card__sub">Where should we bring your fresh order?</p><form onSubmit={submit}><label>Street address<input name="address" value={form.address} onChange={change} placeholder="House number and street" autoComplete="street-address" required /></label><label>City<input name="city" value={form.city} onChange={change} placeholder="Bengaluru" autoComplete="address-level2" required /></label><div className="address-card__split"><label>State<input name="state" value={form.state} onChange={change} placeholder="Karnataka" autoComplete="address-level1" required /></label><label>ZIP code<input name="zip" value={form.zip} onChange={change} placeholder="560001" inputMode="numeric" pattern="[0-9]{5,6}" autoComplete="postal-code" required /></label></div>{error && <p className="auth__error">{error}</p>}<div className="address-card__actions"><Link to="/cart" className="btn btn--ghost btn--large">← Back</Link><button className="btn btn--primary btn--large" type="submit">Continue to payment →</button></div></form></section><aside className="address-aside"><span className="address-aside__icon">⌂</span><h2>Fresh to your door</h2><p>We’ll use this address to prepare your delivery and calculate the final checkout details.</p><div className="address-aside__note"><span>✳</span><small>Secure checkout<br />Powered by Razorpay</small></div></aside></div></main>;
}