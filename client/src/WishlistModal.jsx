import { useEffect, useState } from "react";

import API_URL from "./api";

// =====================================================
// WISHLIST MODAL
// =====================================================

function WishlistModal({
  onClose,
  onAddToCart,
  onWishlistChanged,
}) {
  // ===================================================
  // STATE
  // ===================================================

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [removingId, setRemovingId] =
    useState("");

  const [clearing, setClearing] =
    useState(false);

  // ===================================================
  // WISHLIST API URL
  // ===================================================

  const WISHLIST_API =
    `${API_URL}/api/wishlist`;

  // ===================================================
  // GET TOKEN
  // ===================================================

  const getToken = () => {
    return localStorage.getItem(
      "shopmindToken"
    );
  };

  // ===================================================
  // UPDATE WISHLIST COUNT IN APP.JSX
  // ===================================================

  const notifyWishlistChanged = (
    updatedProducts
  ) => {
    if (
      typeof onWishlistChanged ===
      "function"
    ) {
      onWishlistChanged(
        updatedProducts
      );
    }
  };

  // ===================================================
  // LOAD WISHLIST
  // ===================================================

  const loadWishlist = async () => {
    try {
      setLoading(true);

      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login to view your wishlist."
        );
      }

      const response = await fetch(
        WISHLIST_API,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not load your wishlist."
        );
      }

      const wishlistProducts =
        data.products || [];

      setProducts(
        wishlistProducts
      );

      notifyWishlistChanged(
        wishlistProducts
      );
    } catch (err) {
      console.error(
        "Load wishlist error:",
        err
      );

      setError(
        err.message ||
          "Could not load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD WHEN MODAL OPENS
  // ===================================================

  useEffect(() => {
    loadWishlist();
  }, []);

  // ===================================================
  // REMOVE PRODUCT
  // ===================================================

  const removeFromWishlist = async (
    productId
  ) => {
    try {
      setRemovingId(
        productId
      );

      setError("");

      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }

      const response = await fetch(
        `${WISHLIST_API}/${productId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not remove product."
        );
      }

      const updatedProducts =
        data.products || [];

      setProducts(
        updatedProducts
      );

      notifyWishlistChanged(
        updatedProducts
      );

      setMessage(
        "Product removed from wishlist."
      );
    } catch (err) {
      console.error(
        "Remove wishlist error:",
        err
      );

      setError(
        err.message ||
          "Could not remove product."
      );
    } finally {
      setRemovingId("");
    }
  };

  // ===================================================
  // CLEAR WISHLIST
  // ===================================================

  const clearWishlist = async () => {
    if (
      products.length === 0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Remove all products from your wishlist?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);

      setError("");

      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }

      const response = await fetch(
        WISHLIST_API,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not clear wishlist."
        );
      }

      setProducts([]);

      notifyWishlistChanged(
        []
      );

      setMessage(
        "Wishlist cleared successfully."
      );
    } catch (err) {
      console.error(
        "Clear wishlist error:",
        err
      );

      setError(
        err.message ||
          "Could not clear wishlist."
      );
    } finally {
      setClearing(false);
    }
  };

  // ===================================================
  // ADD WISHLIST PRODUCT TO CART
  // ===================================================

  const handleAddToCart = (
    product
  ) => {
    if (
      Number(product.stock) <= 0
    ) {
      setError(
        `${product.name} is currently out of stock.`
      );

      return;
    }

    if (
      typeof onAddToCart ===
      "function"
    ) {
      onAddToCart(product);

      setError("");

      setMessage(
        `${product.name} added to cart.`
      );
    }
  };

  // ===================================================
  // FORMAT PRICE
  // ===================================================

  const formatPrice = (
    price
  ) => {
    return Number(
      price || 0
    ).toLocaleString(
      "en-IN"
    );
  };

  // ===================================================
  // HANDLE IMAGE ERROR
  // ===================================================

  const handleImageError = (
    event
  ) => {
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

  // ===================================================
  // MODAL
  // ===================================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="wishlist-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =============================================
            HEADER
        ============================================= */}

        <div className="wishlist-header">
          <div>
            <h2>
              ❤️ My Wishlist
            </h2>

            <p>
              Products you've saved
              for later.
            </p>
          </div>

          <button
            type="button"
            className="wishlist-close-btn"
            onClick={onClose}
            aria-label="Close wishlist"
          >
            ✕
          </button>
        </div>

        {/* =============================================
            CONTENT
        ============================================= */}

        <div className="wishlist-body">
          {/* MESSAGE */}

          {message && (
            <div className="wishlist-success-message">
              ✅ {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="wishlist-error-message">
              ⚠️ {error}
            </div>
          )}

          {/* ===========================================
              LOADING
          =========================================== */}

          {loading && (
            <div className="wishlist-state">
              <div className="wishlist-state-icon">
                ❤️
              </div>

              <h3>
                Loading wishlist...
              </h3>

              <p>
                Getting your saved
                products.
              </p>
            </div>
          )}

          {/* ===========================================
              EMPTY WISHLIST
          =========================================== */}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="wishlist-state">
                <div className="wishlist-state-icon">
                  🤍
                </div>

                <h3>
                  Your wishlist is empty
                </h3>

                <p>
                  Save products you like
                  and they'll appear here.
                </p>

                <button
                  type="button"
                  className="wishlist-shopping-btn"
                  onClick={onClose}
                >
                  ← Continue Shopping
                </button>
              </div>
            )}

          {/* ===========================================
              WISHLIST PRODUCTS
          =========================================== */}

          {!loading &&
            products.length > 0 && (
              <>
                {/* =====================================
                    TOOLBAR
                ===================================== */}

                <div className="wishlist-toolbar">
                  <span>
                    <strong>
                      {products.length}
                    </strong>{" "}
                    {products.length === 1
                      ? "saved product"
                      : "saved products"}
                  </span>

                  <button
                    type="button"
                    className="wishlist-clear-btn"
                    onClick={
                      clearWishlist
                    }
                    disabled={
                      clearing
                    }
                  >
                    {clearing
                      ? "Clearing..."
                      : "🗑️ Clear Wishlist"}
                  </button>
                </div>

                {/* =====================================
                    PRODUCT GRID
                ===================================== */}

                <div className="wishlist-grid">
                  {products.map(
                    (product) => {
                      const stock =
                        Number(
                          product.stock ||
                            0
                        );

                      const inStock =
                        stock > 0;

                      return (
                        <div
                          className="wishlist-card"
                          key={
                            product._id
                          }
                        >
                          {/* =============================
                              REAL PRODUCT IMAGE
                          ============================= */}

                          <div className="wishlist-product-image">
                            {product.image ? (
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name ||
                                  "Product"
                                }
                                className="wishlist-real-image"
                                loading="lazy"
                                onError={
                                  handleImageError
                                }
                              />
                            ) : null}

                            <span
                              className="wishlist-image-fallback"
                              style={{
                                display:
                                  product.image
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              {product.icon ||
                                "📦"}
                            </span>

                            {/* STOCK BADGE */}

                            {!inStock && (
                              <span className="wishlist-image-stock-badge out">
                                Out of Stock
                              </span>
                            )}

                            {inStock &&
                              stock <= 5 && (
                                <span className="wishlist-image-stock-badge low">
                                  Only{" "}
                                  {stock}{" "}
                                  left
                                </span>
                              )}
                          </div>

                          {/* =============================
                              PRODUCT INFORMATION
                          ============================= */}

                          <div className="wishlist-product-info">
                            <div className="wishlist-category">
                              {product.category ||
                                "Product"}
                            </div>

                            <h3>
                              {
                                product.name
                              }
                            </h3>

                            {product.description && (
                              <p className="wishlist-description">
                                {
                                  product.description
                                }
                              </p>
                            )}

                            {/* RATING */}

                            {product.rating !==
                              undefined && (
                              <div className="wishlist-rating">
                                ⭐{" "}
                                {Number(
                                  product.rating ||
                                    0
                                ).toFixed(
                                  1
                                )}
                              </div>
                            )}

                            {/* PRICE */}

                            <div className="wishlist-price">
                              ₹
                              {formatPrice(
                                product.price
                              )}
                            </div>

                            {/* STOCK */}

                            <div
                              className={
                                inStock
                                  ? "wishlist-stock in-stock"
                                  : "wishlist-stock out-stock"
                              }
                            >
                              {inStock
                                ? `✓ In Stock (${stock})`
                                : "✕ Out of Stock"}
                            </div>

                            {/* ===========================
                                ACTIONS
                            =========================== */}

                            <div className="wishlist-actions">
                              <button
                                type="button"
                                className="wishlist-cart-btn"
                                onClick={() =>
                                  handleAddToCart(
                                    product
                                  )
                                }
                                disabled={
                                  !inStock
                                }
                              >
                                {inStock
                                  ? "🛒 Add to Cart"
                                  : "Out of Stock"}
                              </button>

                              <button
                                type="button"
                                className="wishlist-remove-btn"
                                onClick={() =>
                                  removeFromWishlist(
                                    product._id
                                  )
                                }
                                disabled={
                                  removingId ===
                                  product._id
                                }
                              >
                                {removingId ===
                                product._id
                                  ? "Removing..."
                                  : "🗑️ Remove"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

export default WishlistModal;