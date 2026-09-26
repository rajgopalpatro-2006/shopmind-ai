function CartModal({
  cart,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onCheckout,
}) {
  // =========================
  // TOTAL ITEMS
  // =========================

  const totalItems = cart.reduce(
    (total, item) =>
      total + (item.quantity || 1),
    0
  );

  // =========================
  // TOTAL PRICE
  // =========================

  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        (item.quantity || 1),
    0
  );

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="cart-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* =====================
            HEADER
        ====================== */}

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
          >
            ✕
          </button>
        </div>

        {/* =====================
            EMPTY CART
        ====================== */}

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              🛒
            </div>

            <h3>Your cart is empty</h3>

            <p>
              Add some products and
              they will appear here.
            </p>

            <button
              type="button"
              className="continue-shopping-btn"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* =====================
                CART PRODUCTS
            ====================== */}

            <div className="cart-items">
              {cart.map((item) => {
                const quantity =
                  item.quantity || 1;

                const itemTotal =
                  Number(item.price) *
                  quantity;

                return (
                  <div
                    className="cart-item"
                    key={item._id}
                  >
                    {/* ICON */}

                    <div className="cart-item-icon">
                      {item.icon ||
                        "📦"}
                    </div>

                    {/* PRODUCT INFO */}

                    <div className="cart-item-info">
                      <h3>
                        {item.name}
                      </h3>

                      <p className="cart-category">
                        {item.category}
                      </p>

                      <p className="cart-price">
                        ₹
                        {Number(
                          item.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      {/* QUANTITY */}

                      <div className="cart-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            onDecrease(
                              item._id
                            )
                          }
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
                              item._id
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}

                    <div className="cart-item-right">
                      <strong>
                        ₹
                        {itemTotal.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() =>
                          onRemove(
                            item._id
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

            {/* =====================
                CART SUMMARY
            ====================== */}

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
                  {totalPrice.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                className="checkout-btn"
                onClick={onCheckout}
              >
                Proceed to Checkout →
              </button>

              {/* CLEAR CART */}

              <button
                type="button"
                className="clear-cart-btn"
                onClick={onClear}
              >
                🗑️ Clear Cart
              </button>

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