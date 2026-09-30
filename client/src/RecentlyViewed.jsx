function RecentlyViewed({
  products = [],
  onViewProduct,
  onAddToCart,
  onClear,
}) {
  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-IN"
    );
  };

  // =====================================================
  // GET PRODUCT ID
  // =====================================================

  const getProductId = (product) => {
    return (
      product?._id ||
      product?.id ||
      null
    );
  };

  // =====================================================
  // GET STOCK
  // =====================================================

  const getStock = (product) => {
    return Number(
      product?.stock ?? 0
    );
  };

  // =====================================================
  // IMAGE ERROR
  // Show emoji if image URL fails
  // =====================================================

  const handleImageError = (event) => {
    const image =
      event.currentTarget;

    image.style.display =
      "none";

    const fallback =
      image.nextElementSibling;

    if (fallback) {
      fallback.style.display =
        "flex";
    }
  };

  // =====================================================
  // DON'T SHOW SECTION IF EMPTY
  // =====================================================

  if (
    !products ||
    products.length === 0
  ) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <section
      className="recently-viewed-section"
      id="recently-viewed"
    >
      <div className="recently-viewed-container">

        {/* =================================================
            HEADER
        ================================================= */}

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

          {typeof onClear ===
            "function" && (
            <button
              type="button"
              className="clear-history-btn"
              onClick={onClear}
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {/* =================================================
            PRODUCT GRID
        ================================================= */}

        <div className="recently-viewed-grid">

          {products.map(
            (product, index) => {
              const stock =
                getStock(product);

              const soldOut =
                stock <= 0;

              const lowStock =
                stock > 0 &&
                stock <= 5;

              const productId =
                getProductId(
                  product
                );

              return (
                <article
                  className="recent-product-card"
                  key={
                    productId ||
                    `${product.name}-${index}`
                  }
                >

                  {/* =========================================
                      REAL PRODUCT IMAGE
                  ========================================= */}

                  <div className="recent-product-icon">

                    {product.image ? (
                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name ||
                          "Product"
                        }
                        className="recent-product-real-image"
                        loading="lazy"
                        onError={
                          handleImageError
                        }
                      />
                    ) : null}

                    {/* =======================================
                        EMOJI FALLBACK
                    ======================================= */}

                    <span
                      className="recent-product-image-fallback"
                      style={{
                        display:
                          product.image
                            ? "none"
                            : "flex",
                      }}
                    >
                      {product.icon ||
                        "🛍️"}
                    </span>

                    {/* =======================================
                        RECENTLY VIEWED BADGE
                    ======================================= */}

                    <div className="recent-image-history-badge">
                      🕒 Viewed
                    </div>

                    {/* =======================================
                        STOCK BADGE
                    ======================================= */}

                    {soldOut && (
                      <div className="recent-image-stock recent-image-out">
                        Out of Stock
                      </div>
                    )}

                    {lowStock && (
                      <div className="recent-image-stock recent-image-low">
                        Only {stock} left
                      </div>
                    )}

                  </div>

                  {/* =========================================
                      PRODUCT INFO
                  ========================================= */}

                  <div className="recent-product-info">

                    {/* CATEGORY */}

                    <span className="recent-product-category">
                      {product.category ||
                        "Product"}
                    </span>

                    {/* PRODUCT NAME */}

                    <h3>
                      {product.name}
                    </h3>

                    {/* =======================================
                        RATING
                    ======================================= */}

                    <div className="recent-product-rating">
                      <span>
                        ⭐
                      </span>

                      <strong>
                        {Number(
                          product.rating ||
                            0
                        ).toFixed(1)}
                      </strong>
                    </div>

                    {/* =======================================
                        DESCRIPTION
                    ======================================= */}

                    <p className="recent-product-description">
                      {product.description ||
                        "No description available."}
                    </p>

                    {/* =======================================
                        PRICE
                    ======================================= */}

                    <div className="recent-product-price">
                      ₹
                      {formatPrice(
                        product.price
                      )}
                    </div>

                    {/* =======================================
                        STOCK
                    ======================================= */}

                    <div
                      className={`recent-stock ${
                        soldOut
                          ? "recent-out-stock"
                          : lowStock
                            ? "recent-low-stock"
                            : "recent-in-stock"
                      }`}
                    >
                      {soldOut
                        ? "🔴 Out of Stock"
                        : lowStock
                          ? `🟠 Only ${stock} Left`
                          : `🟢 In Stock (${stock})`}
                    </div>

                    {/* =======================================
                        BUTTONS
                    ======================================= */}

                    <div className="recent-product-actions">

                      {/* VIEW AGAIN */}

                      <button
                        type="button"
                        className="recent-view-btn"
                        onClick={() =>
                          onViewProduct?.(
                            product
                          )
                        }
                      >
                        👁️ View Again
                      </button>

                      {/* ADD TO CART */}

                      <button
                        type="button"
                        className="recent-cart-btn"
                        disabled={
                          soldOut
                        }
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
            }
          )}

        </div>

      </div>
    </section>
  );
}

export default RecentlyViewed;