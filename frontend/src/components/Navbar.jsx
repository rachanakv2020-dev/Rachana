import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand" onClick={() => setOpen(false)}>
          <span className="nav__brand-mark">🌾</span>
          <span>
            Farm<em>Fresh</em>
          </span>
        </Link>

        <button className="nav__burger" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav__links ${open ? "is-open" : ""}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>
            Vegetables
          </NavLink>
          <NavLink to="/cart" onClick={() => setOpen(false)} className="nav__cart">
            Cart
            {totalItems > 0 && <span className="nav__badge">{totalItems}</span>}
          </NavLink>

          {user ? (
            <div className="nav__user">
              <span>Hi, {user.name.split(" ")[0]}</span>
              <button className="btn btn--ghost btn--small" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn--primary btn--small" onClick={() => setOpen(false)}>
              Log in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
