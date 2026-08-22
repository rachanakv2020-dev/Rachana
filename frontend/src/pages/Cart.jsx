import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);

  const deliveryFee = totalPrice > 0 && totalPrice < 200 ? 20 : 0;
  const grandTotal = Number((totalPrice + deliveryFee).toFixed(2));

  function handleCheckout() {
    if (!user) {
      navigate("/login");
      return;
    }
    setPlaced(true);
    clearCart();
  }

  if (placed) {
    return (
      <div className="cart cart--empty">
        <div className="cart__empty-card">
          <span className="cart__empty-emoji">✅</span>
          <h1>Order placed!</h1>
          <p>Thanks {user?.name.split(" ")[0]}, your fresh vegetables are on the way.</p>
          <Link to="/products" className="btn btn--primary btn--large">
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart cart--empty">
        <div className="cart__empty-card">
          <span className="cart__empty-emoji">🧺</span>
          <h1>Your basket is empty</h1>
          <p>Add some fresh vegetables to see them here.</p>
          <Link to="/products" className="btn btn--primary btn--large">
            Browse vegetables
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Your basket ({totalItems} item{totalItems === 1 ? "" : "s"})</h1>

      <div className="cart__layout">
        <ul className="cart__list">
          {items.map((item) => (
            <li key={item.id} className="cart__row">
              <span className="cart__emoji">{item.image}</span>
              <div className="cart__row-info">
                <h3>{item.name}</h3>
                <p>₹{item.price} / {item.unit}</p>
              </div>
              <div className="cart__qty">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">
                  −
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <div className="cart__row-subtotal">₹{(item.price * item.quantity).toFixed(2)}</div>
              <button className="cart__remove" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                ✕
              </button>
            </li>
          ))}
        </ul>

        <aside className="cart__summary">
          <h2>Order summary</h2>
          <div className="cart__summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="cart__summary-row">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span>
          </div>
          {deliveryFee > 0 && <p className="cart__hint">Add ₹{(200 - totalPrice).toFixed(2)} more for free delivery.</p>}
          <div className="cart__summary-row cart__summary-total">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
          <button className="btn btn--primary btn--large cart__checkout" onClick={handleCheckout}>
            {user ? "Place order" : "Log in to checkout"}
          </button>
          <button className="cart__clear" onClick={clearCart}>
            Clear basket
          </button>
        </aside>
      </div>
    </div>
  );
}
