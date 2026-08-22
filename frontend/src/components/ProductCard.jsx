import React, { useState } from "react";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="crate">
      {product.tag && <span className="crate__ribbon">{product.tag}</span>}
      <div className="crate__emoji" aria-hidden="true">
        {product.image}
      </div>
      <h3 className="crate__name">{product.name}</h3>
      <p className="crate__stock">{product.stock} {product.unit} in stock</p>

      <div className="crate__footer">
        <div className="pricetag">
          <span className="pricetag__currency">₹</span>
          <span className="pricetag__amount">{product.price}</span>
          <span className="pricetag__unit">/{product.unit}</span>
        </div>
        <button className={`btn btn--primary btn--small ${added ? "is-added" : ""}`} onClick={handleAdd}>
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
