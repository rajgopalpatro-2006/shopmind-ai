import { useEffect, useMemo, useState } from "react";
import API_URL from "./api";
import "./App.css";

function App() {
  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // =====================================================
  // SEARCH / FILTER
  // =====================================================

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // =====================================================
  // CART
  // =====================================================

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("shopmindCart");

      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Could not load cart:", error);

      return [];
    }
  });

  const [showCart, setShowCart] = useState(false);

  // =====================================================
  // SELECTED PRODUCT
  // =====================================================

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  // =====================================================
  // AI CHAT
  // =====================================================

  const [aiMessage, setAiMessage] = useState("");

  const [aiMessages, setAiMessages] = useState([
    {
      sender: "ai",
      text:
        "Hi! 👋 I'm ShopMind AI. Tell me what you're looking for and I'll help you find it.",
    },
  ]);

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");

      console.log("Loading products from:", API_URL);

      const response = await fetch(
        `${API_URL}/api/products`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned status ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Products API response:", data);

      if (!data.success) {
        throw new Error(
          data.message || "Could not load products."
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error(
        "Product loading error:",
        error
      );

      setProductsError(
        "Could not load products. Please try again."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // =====================================================
  // SAVE CART
  // =====================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "shopmindCart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Could not save cart:",
        error
      );
    }
  }, [cart]);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = [
    "All",
    "Laptop",
    "Smartphone",
    "Headphones",
    "Smartwatch",
  ];

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter(
        (product) =>
          product.category === selectedCategory
      );
    }

    const searchText = search
      .trim()
      .toLowerCase();

    if (searchText) {
      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || "";

        const category =
          product.category?.toLowerCase() || "";

        const description =
          product.description?.toLowerCase() || "";

        return (
          name.includes(searchText) ||
          category.includes(searchText) ||
          description.includes(searchText)
        );
      });
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
  ]);

  // =====================================================
  // STOCK HELPERS
  // =====================================================

  const getStock = (product) => {
    return Math.max(
      Number(product?.stock ?? 0),
      0
    );
  };

  const getStockLabel = (product) => {
    const stock = getStock(product);

    if (stock <= 0) {
      return "Out of Stock";
    }

    if (stock <= 5) {
      return `Only ${stock} Left`;
    }

    return "In Stock";
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(Number(price || 0));
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (event) => {
    event.preventDefault();

    document
      .getElementById("products")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = (product) => {
    const availableStock =
      getStock(product);

    if (availableStock <= 0) {
      alert(
        `${product.name} is currently out of stock.`
      );

      return;
    }

    setCart((currentCart) => {
      const existingProduct =
        currentCart.find(
          (item) =>
            item._id === product._id
        );

      if (existingProduct) {
        const currentQuantity =
          Number(
            existingProduct.quantity
          ) || 1;

        if (
          currentQuantity >=
          availableStock
        ) {
          alert(
            `Only ${availableStock} unit${
              availableStock === 1
                ? ""
                : "s"
            } of ${product.name} available.`
          );

          return currentCart;
        }

        return currentCart.map(
          (item) =>
            item._id === product._id
              ? {
                  ...item,
                  quantity:
                    currentQuantity + 1,
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // =====================================================
  // REMOVE FROM CART
  // =====================================================

  const removeFromCart = (
    productId
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item._id !== productId
      )
    );
  };

  // =====================================================
  // CHANGE QUANTITY
  // =====================================================

  const changeQuantity = (
    productId,
    amount
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item._id !== productId) {
          return item;
        }

        const stock =
          getStock(item);

        const newQuantity =
          Number(
            item.quantity || 1
          ) + amount;

        if (newQuantity < 1) {
          return item;
        }

        if (newQuantity > stock) {
          alert(
            `Only ${stock} units available.`
          );

          return item;
        }

        return {
          ...item,
          quantity: newQuantity,
        };
      })
    );
  };

  // =====================================================
  // CART TOTALS
  // =====================================================

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 1),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  // =====================================================
  // SIMPLE AI ASSISTANT
  // =====================================================

  const handleAIChat = (event) => {
    event.preventDefault();

    const message =
      aiMessage.trim();

    if (!message) {
      return;
    }

    setAiMessages(
      (currentMessages) => [
        ...currentMessages,
        {
          sender: "user",
          text: message,
        },
      ]
    );

    const lowerMessage =
      message.toLowerCase();

    let matchingProducts =
      products.filter((product) => {
        const productText = `
          ${product.name || ""}
          ${product.category || ""}
          ${product.description || ""}
        `.toLowerCase();

        return lowerMessage
          .split(/\s+/)
          .some(
            (word) =>
              word.length > 2 &&
              productText.includes(word)
          );
      });

    // Price detection:
    // Example: "laptop under 70000"
    const numbers =
      message.match(/\d+/g);

    if (
      numbers &&
      lowerMessage.includes("under")
    ) {
      const budget =
        Number(
          numbers.join("")
        );

      if (
        Number.isFinite(budget)
      ) {
        matchingProducts =
          products.filter(
            (product) =>
              Number(
                product.price
              ) <= budget
          );
      }
    }

    let reply;

    if (
      matchingProducts.length > 0
    ) {
      const suggestions =
        matchingProducts
          .slice(0, 3)
          .map(
            (product) =>
              `• ${product.name} — ${formatPrice(
                product.price
              )}`
          )
          .join("\n");

      reply =
        `Here are some products you may like:\n${suggestions}`;
    } else {
      reply =
        "I couldn't find an exact match. Try asking for a laptop, smartphone, headphones or smartwatch, and you can also mention your budget.";
    }

    window.setTimeout(() => {
      setAiMessages(
        (currentMessages) => [
          ...currentMessages,
          {
            sender: "ai",
            text: reply,
          },
        ]
      );
    }, 300);

    setAiMessage("");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="navbar">

        <div
          className="logo"
          onClick={() => {
            setSearch("");
            setSelectedCategory(
              "All"
            );

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          🛍️ ShopMind{" "}
          <span>AI</span>
        </div>

        <nav>
          <a href="#home">
            Home
          </a>

          <a href="#products">
            Products
          </a>

          <a href="#ai">
            AI Assistant
          </a>
        </nav>

        <div className="navbar-actions">

          <button
            className="cart-btn"
            onClick={() =>
              setShowCart(true)
            }
          >
            🛒 Cart

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </button>

          <button
            className="login-btn"
            onClick={() =>
              alert(
                "Login will be connected in the next step."
              )
            }
          >
            Login
          </button>

        </div>

      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-text">

          <div className="badge">
            ✨ AI-Powered Shopping
            Assistant
          </div>

          <h1>
            Shop Smarter.
            <br />
            <span>
              Buy Better.
            </span>
          </h1>

          <p>
            Discover products,
            compare options and find
            products that match your
            needs with ShopMind AI.
          </p>

          <form
            className="search-box"
            onSubmit={
              handleSearch
            }
          >

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search laptops, phones, headphones..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            <button type="submit">
              Search
            </button>

          </form>

        </div>

        <div className="ai-card">

          <div className="ai-icon">
            🤖
          </div>

          <h2>
            Your AI Shopping
            Assistant
          </h2>

          <p>
            Tell ShopMind AI what
            you're looking for and
            discover products that
            fit your needs.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              document
                .getElementById("ai")
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                })
            }
          >
            Try AI Assistant
          </button>

        </div>

      </section>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <section
        className="products-section"
        id="products"
      >

        <div className="section-heading">

          <span>
            EXPLORE PRODUCTS
          </span>

          <h2>
            Find what you're
            looking for
          </h2>

          <p>
            Search and filter
            products based on your
            requirements.
          </p>

        </div>

        {/* CATEGORY FILTER */}

        <div className="categories">

          {categories.map(
            (category) => (
              <button
                key={category}
                className={
                  selectedCategory ===
                  category
                    ? "category active"
                    : "category"
                }
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
              >
                {category}
              </button>
            )
          )}

        </div>

        {/* LOADING */}

        {productsLoading && (
          <div className="status-box">

            <div className="loader">
            </div>

            <h3>
              Loading products...
            </h3>

            <p>
              Connecting to
              ShopMind AI server.
            </p>

          </div>
        )}

        {/* ERROR */}

        {!productsLoading &&
          productsError && (
            <div className="status-box error-box">

              <h3>
                ⚠️ Unable to load
                products
              </h3>

              <p>
                {productsError}
              </p>

              <button
                className="primary-btn"
                onClick={
                  loadProducts
                }
              >
                Try Again
              </button>

            </div>
          )}

        {/* PRODUCTS */}

        {!productsLoading &&
          !productsError &&
          filteredProducts.length >
            0 && (
            <div className="product-grid">

              {filteredProducts.map(
                (product) => {
                  const stock =
                    getStock(
                      product
                    );

                  return (
                    <div
                      className="product-card"
                      key={
                        product._id
                      }
                    >

                      <div
                        className="product-image"
                        onClick={() =>
                          setSelectedProduct(
                            product
                          )
                        }
                      >
                        {product.icon ||
                          "🛍️"}
                      </div>

                      <div className="product-info">

                        <span className="product-category">
                          {
                            product.category
                          }
                        </span>

                        <h3>
                          {
                            product.name
                          }
                        </h3>

                        <div className="rating">
                          ⭐{" "}
                          {product.rating ||
                            "N/A"}
                        </div>

                        <p className="description">
                          {product.description ||
                            "No description available."}
                        </p>

                        <div className="stock">

                          {stock > 0
                            ? "🟢"
                            : "🔴"}{" "}

                          {getStockLabel(
                            product
                          )}

                        </div>

                        <div className="product-bottom">

                          <div className="price">
                            {formatPrice(
                              product.price
                            )}
                          </div>

                          <button
                            disabled={
                              stock <= 0
                            }
                            onClick={() =>
                              addToCart(
                                product
                              )
                            }
                          >
                            {stock <= 0
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </button>

                        </div>

                        <button
                          className="view-btn"
                          onClick={() =>
                            setSelectedProduct(
                              product
                            )
                          }
                        >
                          View Details
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        {/* NO RESULTS */}

        {!productsLoading &&
          !productsError &&
          filteredProducts.length ===
            0 && (
            <div className="status-box">

              <h3>
                🔎 No products found
              </h3>

              <p>
                Try another search
                or category.
              </p>

              <button
                className="primary-btn"
                onClick={() => {
                  setSearch("");

                  setSelectedCategory(
                    "All"
                  );
                }}
              >
                Show All Products
              </button>

            </div>
          )}

      </section>

      {/* =================================================
          AI ASSISTANT
      ================================================= */}

      <section
        className="ai-section"
        id="ai"
      >

        <div className="ai-section-text">

          <span className="badge">
            🤖 SMART SHOPPING
          </span>

          <h2>
            Ask ShopMind AI
          </h2>

          <p>
            Not sure what to buy?
            Tell our shopping
            assistant what you need
            and your budget.
          </p>

          <div className="ai-features">

            <div>
              ✓ Product discovery
            </div>

            <div>
              ✓ Budget-based
              suggestions
            </div>

            <div>
              ✓ Smart product
              matching
            </div>

          </div>

        </div>

        <div className="chat-card">

          <div className="chat-header">

            <div className="ai-avatar">
              🤖
            </div>

            <div>
              <h3>
                ShopMind AI
              </h3>

              <p>
                ● Online
              </p>
            </div>

          </div>

          <div className="chat-messages">

            {aiMessages.map(
              (message, index) => (
                <div
                  key={index}
                  className={
                    message.sender ===
                    "user"
                      ? "user-message"
                      : "ai-message"
                  }
                >
                  {message.text
                    .split("\n")
                    .map(
                      (
                        line,
                        lineIndex
                      ) => (
                        <div
                          key={
                            lineIndex
                          }
                        >
                          {line}
                        </div>
                      )
                    )}
                </div>
              )
            )}

          </div>

          <form
            className="chat-input"
            onSubmit={
              handleAIChat
            }
          >

            <input
              type="text"
              placeholder="Ask ShopMind AI..."
              value={aiMessage}
              onChange={(event) =>
                setAiMessage(
                  event.target.value
                )
              }
            />

            <button type="submit">
              ➤
            </button>

          </form>

        </div>

      </section>

      {/* =================================================
          PRODUCT DETAILS MODAL
      ================================================= */}

      {selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedProduct(
              null
            )
          }
        >

          <div
            className="product-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="close-btn"
              onClick={() =>
                setSelectedProduct(
                  null
                )
              }
            >
              ✕
            </button>

            <div className="modal-icon">
              {selectedProduct.icon ||
                "🛍️"}
            </div>

            <span className="product-category">
              {
                selectedProduct.category
              }
            </span>

            <h2>
              {
                selectedProduct.name
              }
            </h2>

            <div className="modal-rating">
              ⭐{" "}
              {selectedProduct.rating ||
                "N/A"}
            </div>

            <p>
              {selectedProduct.description ||
                "No description available."}
            </p>

            <div className="modal-price">
              {formatPrice(
                selectedProduct.price
              )}
            </div>

            <p>
              <strong>
                Availability:
              </strong>{" "}
              {getStockLabel(
                selectedProduct
              )}
            </p>

            <button
              className="buy-btn"
              disabled={
                getStock(
                  selectedProduct
                ) <= 0
              }
              onClick={() => {
                addToCart(
                  selectedProduct
                );

                if (
                  getStock(
                    selectedProduct
                  ) > 0
                ) {
                  setSelectedProduct(
                    null
                  );
                }
              }}
            >
              {getStock(
                selectedProduct
              ) <= 0
                ? "Out of Stock"
                : "🛒 Add to Cart"}
            </button>

          </div>

        </div>
      )}

      {/* =================================================
          CART MODAL
      ================================================= */}

      {showCart && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowCart(false)
          }
        >

          <div
            className="cart-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="cart-header">

              <h2>
                🛒 Your Cart
              </h2>

              <button
                className="close-btn"
                onClick={() =>
                  setShowCart(
                    false
                  )
                }
              >
                ✕
              </button>

            </div>

            {cart.length === 0 ? (

              <div className="empty-cart">

                <div className="empty-cart-icon">
                  🛒
                </div>

                <h3>
                  Your cart is
                  empty
                </h3>

                <p>
                  Add some products
                  to get started.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    setShowCart(
                      false
                    )
                  }
                >
                  Continue Shopping
                </button>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map(
                    (item) => (
                      <div
                        className="cart-item"
                        key={
                          item._id
                        }
                      >

                        <div className="cart-item-icon">
                          {item.icon ||
                            "🛍️"}
                        </div>

                        <div className="cart-item-info">

                          <h3>
                            {
                              item.name
                            }
                          </h3>

                          <p>
                            {formatPrice(
                              item.price
                            )}
                          </p>

                          <div className="quantity-controls">

                            <button
                              onClick={() =>
                                changeQuantity(
                                  item._id,
                                  -1
                                )
                              }
                            >
                              −
                            </button>

                            <span>
                              {item.quantity ||
                                1}
                            </span>

                            <button
                              onClick={() =>
                                changeQuantity(
                                  item._id,
                                  1
                                )
                              }
                            >
                              +
                            </button>

                          </div>

                        </div>

                        <button
                          className="remove-btn"
                          onClick={() =>
                            removeFromCart(
                              item._id
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>
                    )
                  )}

                </div>

                <div className="cart-summary">

                  <div className="cart-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      {formatPrice(
                        cartTotal
                      )}
                    </strong>

                  </div>

                  <button
                    className="checkout-btn"
                    onClick={() =>
                      alert(
                        "Checkout will be connected in the next step."
                      )
                    }
                  >
                    Proceed to
                    Checkout
                  </button>

                </div>

              </>

            )}

          </div>

        </div>
      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <div className="footer-content">

          <div>
            <h3>
              🛍️ ShopMind AI
            </h3>

            <p>
              AI-powered shopping
              made simple.
            </p>
          </div>

          <div>
            <p>
              © 2026 ShopMind AI.
              All rights reserved.
            </p>
          </div>

        </div>

      </footer>

    </div>
  );
}

export default App;