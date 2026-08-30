import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const { state } = useLocation();
  return (
    <div className="cart cart--empty">
      <div className="cart__empty-card">
        <span className="cart__empty-emoji">✅</span>
        <h1>Payment successful</h1>
        <p>Your order #{state?.orderId || ""} is being prepared. Total paid: ₹{Number(state?.total || 0).toFixed(2)}.</p>
        <Link to="/products" className="btn btn--primary btn--large">Keep shopping</Link>
      </div>
    </div>
  );
}
