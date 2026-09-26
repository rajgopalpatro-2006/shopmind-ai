function RecentlyViewed({
  products = [],
  onViewProduct,
  onAddToCart,
  onClear,
}) {
  // =====================================
  // FORMAT PRICE
  // =====================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-IN"
    );
  };

  // =====================================
  // STOCK
  // =====================================

  const getStock = (product) => {
    return Number(product?.stock ?? 0);
  };

  // =====================================
  // DON'T SHOW SECTION IF EMPTY
  // =====================================

  if (!products || products.length === 0) {
    return null;
  }

  // =====================================
  // UI
  // =====================================

  return (
    <section
      className="recently-viewed-section"
      id="recently-viewed"
    >
      <div className="recently-viewed-container">

        {/* HEADER */}

        <div className="recently-viewed-header">
          <div>
            <span className="recently-viewed-badge">
              🕒 YOUR HISTORY
            </span>

            <h2>
              Recently Viewed
            </h2>

            <p>
              Continue exploring products
              you've recently checked out.
            </p>
          </div>

          <button
            type="button"
            className="clear-history-btn"
            onClick={onClear}
          >
            Clear History
          </button>
        </div>

        {/* PRODUCT GRID */}

        <div className="recently-viewed-grid">

          {products.map((product) => {
            const stock =
              getStock(product);

            const soldOut =
              stock <= 0;

            return (
              <article
                className="recent-product-card"
                key={product._id}
              >

                {/* PRODUCT ICON */}

                <div className="recent-product-icon">
                  {product.icon || "🛍️"}
                </div>

                {/* PRODUCT INFO */}

                <div className="recent-product-info">

                  <span className="recent-product-category">
                    {product.category ||
                      "Product"}
                  </span>

                  <h3>
                    {product.name}
                  </h3>

                  <div className="recent-product-rating">
                    ⭐{" "}
                    {Number(
                      product.rating || 0
                    ).toFixed(1)}
                  </div>

                  <p className="recent-product-description">
                    {product.description ||
                      "No description available."}
                  </p>

                  <div className="recent-product-price">
                    ₹
                    {formatPrice(
                      product.price
                    )}
                  </div>

                  {/* STOCK */}

                  <div
                    className={`recent-stock ${
                      soldOut
                        ? "recent-out-stock"
                        : stock <= 5
                          ? "recent-low-stock"
                          : "recent-in-stock"
                    }`}
                  >
                    {soldOut
                      ? "🔴 Out of Stock"
                      : stock <= 5
                        ? `🟠 Only ${stock} Left`
                        : `🟢 In Stock (${stock})`}
                  </div>

                  {/* BUTTONS */}

                  <div className="recent-product-actions">

                    <button
                      type="button"
                      className="recent-view-btn"
                      onClick={() =>
                        onViewProduct?.(
                          product
                        )
                      }
                    >
                      View Again
                    </button>

                    <button
                      type="button"
                      className="recent-cart-btn"
                      disabled={soldOut}
                      onClick={() =>
                        onAddToCart?.(
                          product
                        )
                      }
                    >
                      {soldOut
                        ? "Out of Stock"
                        : "🛒 Add to Cart"}
                    </button>

                  </div>

                </div>

              </article>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default RecentlyViewed;