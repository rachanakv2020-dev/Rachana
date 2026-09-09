import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ category: activeCategory, search })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const categoryLabel = useMemo(() => {
    if (activeCategory === "all") return "All vegetables";
    return (Array.isArray(categories) ? categories : []).find((c) => c.id === activeCategory)?.name || "Vegetables";
  }, [activeCategory, categories]);

  function selectCategory(id) {
    if (id === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", id);
    }
    setSearchParams(searchParams);
  }

  return (
    <div className="shop">
      <aside className="shop__sidebar">
        <h2>Categories</h2>
        <ul className="shop__cat-list">
          <li>
            <button
              className={activeCategory === "all" ? "is-active" : ""}
              onClick={() => selectCategory("all")}
            >
              🧺 All vegetables
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                className={activeCategory === cat.id ? "is-active" : ""}
                onClick={() => selectCategory(cat.id)}
              >
                {cat.emoji} {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="shop__main">
        <div className="shop__head">
          <div>
            <h1>{categoryLabel}</h1>
            <p>{loading ? "Loading…" : `${products.length} item${products.length === 1 ? "" : "s"} available`}</p>
          </div>
          <input
            type="search"
            className="shop__search"
            placeholder="Search vegetables…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {!loading && products.length === 0 && (
          <div className="shop__empty">
            <p>No vegetables match your search. Try a different name or category.</p>
          </div>
        )}

        <div className="shop__grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
