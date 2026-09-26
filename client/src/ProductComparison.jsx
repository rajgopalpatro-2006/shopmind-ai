import { useMemo, useState } from "react";

function ProductComparison({
  products = [],
  onViewProduct,
  onAddToCart,
}) {
  const [firstProductId, setFirstProductId] =
    useState("");

  const [secondProductId, setSecondProductId] =
    useState("");

  // =====================================
  // FORMAT PRICE
  // =====================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-IN"
    );
  };

  // =====================================
  // SELECTED PRODUCTS
  // =====================================

  const firstProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product._id === firstProductId
      ),
    [products, firstProductId]
  );

  const secondProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product._id === secondProductId
      ),
    [products, secondProductId]
  );

  // =====================================
  // STOCK
  // =====================================

  const getStockText = (product) => {
    const stock = Number(
      product?.stock || 0
    );

    if (stock <= 0) {
      return "🔴 Out of Stock";
    }

    if (stock <= 5) {
      return `🟠 Only ${stock} Left`;
    }

    return `🟢 In Stock (${stock})`;
  };

  // =====================================
  // RESET
  // =====================================

  const clearComparison = () => {
    setFirstProductId("");
    setSecondProductId("");
  };

  // =====================================
  // UI
  // =====================================

  return (
    <section
      className="comparison-section"
      id="compare"
    >
      <div className="comparison-container">

        {/* HEADER */}

        <div className="comparison-header">
          <div className="comparison-badge">
            ⚖️ SMART COMPARISON
          </div>

          <h2>
            Compare Products
          </h2>

          <p>
            Select two products and compare
            their price, rating, category and
            availability side by side.
          </p>
        </div>

        {/* SELECTORS */}

        <div className="comparison-selectors">

          <div className="comparison-select-box">
            <label>
              Product 1
            </label>

            <select
              value={firstProductId}
              onChange={(e) =>
                setFirstProductId(
                  e.target.value
                )
              }
            >
              <option value="">
                Select first product
              </option>

              {products.map((product) => (
                <option
                  value={product._id}
                  key={product._id}
                  disabled={
                    product._id ===
                    secondProductId
                  }
                >
                  {product.name} - ₹
                  {formatPrice(
                    product.price
                  )}
                </option>
              ))}
            </select>
          </div>

          <div className="comparison-vs">
            VS
          </div>

          <div className="comparison-select-box">
            <label>
              Product 2
            </label>

            <select
              value={secondProductId}
              onChange={(e) =>
                setSecondProductId(
                  e.target.value
                )
              }
            >
              <option value="">
                Select second product
              </option>

              {products.map((product) => (
                <option
                  value={product._id}
                  key={product._id}
                  disabled={
                    product._id ===
                    firstProductId
                  }
                >
                  {product.name} - ₹
                  {formatPrice(
                    product.price
                  )}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* WAITING MESSAGE */}

        {(!firstProduct ||
          !secondProduct) && (
          <div className="comparison-empty">
            <div>
              ⚖️
            </div>

            <h3>
              Choose two products
            </h3>

            <p>
              Select a product on each side
              to start comparing.
            </p>
          </div>
        )}

        {/* COMPARISON */}

        {firstProduct &&
          secondProduct && (
            <>
              <div className="comparison-table">

                {/* PRODUCT HEADERS */}

                <div className="comparison-row comparison-product-row">

                  <div className="comparison-label">
                    Product
                  </div>

                  <div className="comparison-product">
                    <div className="comparison-product-icon">
                      {firstProduct.icon ||
                        "🛍️"}
                    </div>

                    <strong>
                      {firstProduct.name}
                    </strong>
                  </div>

                  <div className="comparison-product">
                    <div className="comparison-product-icon">
                      {secondProduct.icon ||
                        "🛍️"}
                    </div>

                    <strong>
                      {secondProduct.name}
                    </strong>
                  </div>

                </div>

                {/* CATEGORY */}

                <div className="comparison-row">
                  <div className="comparison-label">
                    Category
                  </div>

                  <div>
                    {firstProduct.category ||
                      "—"}
                  </div>

                  <div>
                    {secondProduct.category ||
                      "—"}
                  </div>
                </div>

                {/* PRICE */}

                <div className="comparison-row">
                  <div className="comparison-label">
                    Price
                  </div>

                  <div className="comparison-price">
                    ₹
                    {formatPrice(
                      firstProduct.price
                    )}
                  </div>

                  <div className="comparison-price">
                    ₹
                    {formatPrice(
                      secondProduct.price
                    )}
                  </div>
                </div>

                {/* RATING */}

                <div className="comparison-row">
                  <div className="comparison-label">
                    Rating
                  </div>

                  <div>
                    ⭐{" "}
                    {Number(
                      firstProduct.rating || 0
                    ).toFixed(1)}
                    /5
                  </div>

                  <div>
                    ⭐{" "}
                    {Number(
                      secondProduct.rating || 0
                    ).toFixed(1)}
                    /5
                  </div>
                </div>

                {/* STOCK */}

                <div className="comparison-row">
                  <div className="comparison-label">
                    Availability
                  </div>

                  <div>
                    {getStockText(
                      firstProduct
                    )}
                  </div>

                  <div>
                    {getStockText(
                      secondProduct
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div className="comparison-row">
                  <div className="comparison-label">
                    Description
                  </div>

                  <div className="comparison-description">
                    {firstProduct.description ||
                      "No description available."}
                  </div>

                  <div className="comparison-description">
                    {secondProduct.description ||
                      "No description available."}
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="comparison-row comparison-actions-row">

                  <div className="comparison-label">
                    Actions
                  </div>

                  <div className="comparison-actions">

                    <button
                      type="button"
                      className="comparison-view-btn"
                      onClick={() =>
                        onViewProduct?.(
                          firstProduct
                        )
                      }
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      className="comparison-cart-btn"
                      disabled={
                        Number(
                          firstProduct.stock || 0
                        ) <= 0
                      }
                      onClick={() =>
                        onAddToCart?.(
                          firstProduct
                        )
                      }
                    >
                      🛒 Add to Cart
                    </button>

                  </div>

                  <div className="comparison-actions">

                    <button
                      type="button"
                      className="comparison-view-btn"
                      onClick={() =>
                        onViewProduct?.(
                          secondProduct
                        )
                      }
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      className="comparison-cart-btn"
                      disabled={
                        Number(
                          secondProduct.stock || 0
                        ) <= 0
                      }
                      onClick={() =>
                        onAddToCart?.(
                          secondProduct
                        )
                      }
                    >
                      🛒 Add to Cart
                    </button>

                  </div>

                </div>

              </div>

              <div className="comparison-bottom">

                <button
                  type="button"
                  className="comparison-clear-btn"
                  onClick={
                    clearComparison
                  }
                >
                  ↻ Clear Comparison
                </button>

              </div>
            </>
          )}

      </div>
    </section>
  );
}

export default ProductComparison;