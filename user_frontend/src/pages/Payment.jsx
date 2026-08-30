import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const razorpayScript = "https://checkout.razorpay.com/v1/checkout.js";

export default function Payment() {
  const { user, token } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const address = location.state?.address || "";
  const deliveryFee = totalPrice > 0 && totalPrice < 200 ? 20 : 0;
  const total = Number((totalPrice + deliveryFee).toFixed(2));

  useEffect(() => {
    if (!user) navigate("/login");
    if (!items.length && !location.state?.fromAddress) navigate("/products");
    if (items.length && !location.state?.address) navigate("/address", { state: { fromCheckout: true } });
  }, [user, items.length, location.state, navigate]);

  async function pay() {
    setError("");
    setProcessing(true);
    try {
      const checkout = await api.createRazorpayOrder({ address, items: items.map((item) => ({ id: item.id, quantity: item.quantity })) }, token);
      await loadRazorpay();
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: "FarmFresh",
        description: "Fresh vegetables order",
        order_id: checkout.razorpayOrderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#ef5b09" },
        config: paymentMethod === "upi" ? {
          display: {
            blocks: {
              upi: { name: "Pay using UPI apps", instruments: [{ method: "upi" }] },
            },
            sequence: ["block.upi", "block.other"],
            preferences: { show_default_blocks: true },
          },
        } : undefined,
        handler: async (response) => {
          try {
            await api.verifyRazorpayPayment(response, token);
            clearCart();
            navigate("/order-success", { state: { orderId: checkout.orderId, total } });
          } catch (verificationError) { setError(verificationError.message); }
          finally { setProcessing(false); }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      razorpay.on("payment.failed", (response) => { setError(response.error?.description || "Payment failed. Please try again."); setProcessing(false); });
      razorpay.open();
    } catch (checkoutError) { setError(checkoutError.message); setProcessing(false); }
  }

  return <main className="payment-page"><div className="payment-page__intro"><p className="hero__eyebrow">Step 3 of 3 · Secure checkout</p><h1>Complete your order.</h1><p>Your payment is processed securely by Razorpay. Your card details never touch FarmFresh servers.</p></div><section className="payment-card"><div className="payment-card__brand"><span>✳</span> Razorpay checkout</div><div className="payment-address"><span>Delivering to</span><strong>{address}</strong><Link to="/address" state={{ fromCheckout: true }}>Edit address</Link></div><div className="payment-methods"><span>Choose payment method</span><div><button type="button" className={paymentMethod === "upi" ? "is-active" : ""} onClick={() => setPaymentMethod("upi")}>◈ UPI apps</button><button type="button" className={paymentMethod === "other" ? "is-active" : ""} onClick={() => setPaymentMethod("other")}>▣ Other methods</button></div></div><div className="payment-card__row"><span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span><strong>₹{totalPrice.toFixed(2)}</strong></div><div className="payment-card__row"><span>Delivery</span><strong>{deliveryFee ? `₹${deliveryFee.toFixed(2)}` : "Free"}</strong></div><div className="payment-card__total"><span>Total to pay</span><strong>₹{total.toFixed(2)}</strong></div>{error && <p className="auth__error">{error}</p>}<button className="btn btn--primary btn--large payment-card__button" disabled={processing || !items.length || address.trim().length < 10} onClick={pay}>{processing ? "Opening secure checkout..." : `Pay ₹${total.toFixed(2)}`}</button><Link to="/address" state={{ fromCheckout: true }} className="payment-card__back">← Back to address</Link></section></main>;
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = razorpayScript;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}
