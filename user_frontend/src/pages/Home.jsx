import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function Home() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__text">
          <p className="hero__eyebrow">Harvested at dawn · delivered by dusk</p>
          <h1>
            Vegetables that taste like
            <br />
            they still remember the <em>soil</em>.
          </h1>
          <p className="hero__sub">
            We buy straight from small farms outside the city and sell at one fair, fixed
            price — no haggling, no surprise markups at checkout.
          </p>
          <div className="hero__cta">
            <Link to="/products" className="btn btn--primary btn--large">
              Shop vegetables
            </Link>
            <Link to="/login" className="btn btn--ghost btn--large">
              Create an account
            </Link>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="hero__crate hero__crate--1">🥕</div>
          <div className="hero__crate hero__crate--2">🍅</div>
          <div className="hero__crate hero__crate--3">🥬</div>
          <div className="hero__crate hero__crate--4">🫑</div>
        </div>
      </section>

      <section className="strip">
        <div className="strip__item">
          <strong>Fixed pricing</strong>
          <span>One price per vegetable, all week</span>
        </div>
        <div className="strip__item">
          <strong>Same-day pick</strong>
          <span>Harvested the morning of delivery</span>
        </div>
        <div className="strip__item">
          <strong>No middlemen</strong>
          <span>Bought directly from local farms</span>
        </div>
      </section>

      <section className="cats">
        <div className="cats__head">
          <h2>Shop by category</h2>
          <Link to="/products" className="cats__all">
            View all vegetables →
          </Link>
        </div>
        <div className="cats__grid">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="cats__card">
              <span className="cats__emoji">{cat.emoji}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
