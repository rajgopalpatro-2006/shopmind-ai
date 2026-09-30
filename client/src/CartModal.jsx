function CartModal({
  cart,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onCheckout,
}) {
  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );

  // =====================================================
  // TOTAL PRICE
  // =====================================================

  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-IN"
    );
  };

  // =====================================================
  // PRODUCT ID
  // =====================================================

  const getProductId = (item) => {
    return item?._id || item?.id;
  };

  // =====================================================
  // IMAGE ERROR
  // Show emoji if real image cannot load
  // =====================================================

  const handleImageError = (event) => {
    const image = event.currentTarget;

    image.style.display = "none";

    const fallback =
      image.nextElementSibling;

    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="cart-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="cart-header">
          <div>
            <h2>🛒 Your Cart</h2>

            <p>
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}
            </p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* =================================================
            EMPTY CART
        ================================================= */}

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              🛒
            </div>

            <h3>
              Your cart is empty
            </h3>

            <p>
              Add some products and they
              will appear here.
            </p>

            <button
              type="button"
              className="continue-shopping-btn"
              onClick={onClose}
            >
              ← Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* =============================================
                CART PRODUCTS
            ============================================= */}

            <div className="cart-items">
              {cart.map((item) => {
                const productId =
                  getProductId(item);

                const quantity =
                  Number(
                    item.quantity || 1
                  );

                const price =
                  Number(
                    item.price || 0
                  );

                const itemTotal =
                  price * quantity;

                return (
                  <div
                    className="cart-item"
                    key={productId}
                  >
                    {/* =====================================
                        REAL PRODUCT IMAGE
                    ===================================== */}

                    <div className="cart-item-icon">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={
                            item.name ||
                            "Product"
                          }
                          className="cart-product-image"
                          loading="lazy"
                          onError={
                            handleImageError
                          }
                        />
                      ) : null}

                      <span
                        className="cart-product-image-fallback"
                        style={{
                          display:
                            item.image
                              ? "none"
                              : "flex",
                        }}
                      >
                        {item.icon ||
                          "📦"}
                      </span>
                    </div>

                    {/* =====================================
                        PRODUCT INFO
                    ===================================== */}

                    <div className="cart-item-info">
                      <h3>
                        {item.name}
                      </h3>

                      <p className="cart-category">
                        {item.category ||
                          "Product"}
                      </p>

                      <p className="cart-price">
                        ₹
                        {formatPrice(
                          price
                        )}
                      </p>

                      {/* ===================================
                          QUANTITY
                      =================================== */}

                      <div className="cart-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            onDecrease(
                              productId
                            )
                          }
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>

                        <span>
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onIncrease(
                              productId
                            )
                          }
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* =====================================
                        RIGHT SIDE
                    ===================================== */}

                    <div className="cart-item-right">
                      <strong>
                        ₹
                        {formatPrice(
                          itemTotal
                        )}
                      </strong>

                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() =>
                          onRemove(
                            productId
                          )
                        }
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =============================================
                CART SUMMARY
            ============================================= */}

            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>
                  Total Items
                </span>

                <strong>
                  {totalItems}
                </strong>
              </div>

              <div className="cart-summary-row cart-total">
                <span>
                  Order Total
                </span>

                <strong>
                  ₹
                  {formatPrice(
                    totalPrice
                  )}
                </strong>
              </div>

              {/* ===========================================
                  CHECKOUT
              =========================================== */}

              <button
                type="button"
                className="checkout-btn"
                onClick={onCheckout}
              >
                Proceed to Checkout →
              </button>

              {/* ===========================================
                  CLEAR CART
              =========================================== */}

              <button
                type="button"
                className="clear-cart-btn"
                onClick={onClear}
              >
                🗑️ Clear Cart
              </button>

              {/* ===========================================
                  CONTINUE SHOPPING
              =========================================== */}

              <button
                type="button"
                className="continue-shopping-btn"
                onClick={onClose}
              >
                ← Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartModal;