import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import Payment from "./pages/Payment.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import Address from "./pages/Address.jsx";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/address" element={<Address />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer__inner">
          <p>🌾 FarmFresh — picked this morning, priced fairly, delivered by evening.</p>
          <p className="footer__fine">Demo project · fixed prices per kg unless noted.</p>
        </div>
      </footer>
    </div>
  );
}
