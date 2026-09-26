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
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  const [selectedProduct, setSelectedProduct] = useState(null);

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");

      console.log("Loading products from:", API_URL);

      const response = await fetch(`${API_URL}/api/products`);

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
      console.error("Product loading error:", error);

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
      console.error("Could not save cart:", error);
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

    const searchText = search.trim().toLowerCase();

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
  }, [products, search, selectedCategory]);

  // =====================================================
  // STOCK HELPERS
  // =====================================================

  const getStock = (product) => {
    return Math.max(Number(product?.stock ?? 0), 0);
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
  // ADD TO CART
  // =====================================================

  const addToCart = (product) => {
    const availableStock = getStock(product);

    if (availableStock <= 0) {
      alert(`${product.name} is currently out of stock.`);
      return;
    }

    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item._id === product._id
      );

      if (existingProduct) {
        const currentQuantity =
          Number(existingProduct.quantity) || 1;

        if (currentQuantity >= availableStock) {
          alert(
            `Only ${availableStock} unit${
              availableStock === 1 ? "" : "s"
            } of ${product.name} available.`
          );

          return currentCart;
        }

        return currentCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: currentQuantity + 1,
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

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item._id !== productId
      )
    );
  };

  // =====================================================
  // CHANGE QUANTITY
  // =====================================================

  const changeQuantity = (productId, amount) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item._id !== productId) {
          return item;
        }

        const stock = getStock(item);

        const newQuantity =
          Number(item.quantity || 1) + amount;

        if (newQuantity < 1) {
          return item;
        }

        if (newQuantity > stock) {
          alert(`Only ${stock} units available.`);
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
      total + Number(item.quantity || 1),
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
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price || 0));
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app">
      {/* NAVBAR */}

      <nav className="navbar">
        <div
          className="logo"
          onClick={() => {
            setSearch("");
            setSelectedCategory("All");
          }}
        >
          ShopMind AI
        </div>

        <div className="nav-links">
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
          >
            Home
          </button>

          <button
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Products
          </button>

          <button
            className="cart-button"
            onClick={() => setShowCart(true)}
          >
            🛒 Cart ({cartCount})
          </button>
        </div>
      </nav>

      {/* HERO */}

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            ✨ AI Powered Shopping
          </div>

          <h1>
            Shop Smarter with
            <span> ShopMind AI</span>
          </h1>

          <p>
            Discover products faster with intelligent
            search, smart recommendations and a simple
            shopping experience.
          </p>

          <div className="search-box">
            <input
              type="text"
              value={search}
              placeholder="Search laptops, phones, headphones..."
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <button
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER */}

      <section className="category-section">
        <h2>Explore Categories</h2>

        <div className="categories">
          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "category active"
                  : "category"
              }
              onClick={() =>
                setSelectedCategory(category)
              }
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}

      <section
        id="products"
        className="products-section"
      >
        <div className="section-heading">
          <div>
            <h2>Featured Products</h2>

            <p>
              Find the perfect product for you.
            </p>
          </div>

          {!productsLoading && !productsError && (
            <span>
              {filteredProducts.length} products
            </span>
          )}
        </div>

        {/* LOADING */}

        {productsLoading && (
          <div className="status-box">
            <div className="loader"></div>

            <h3>Loading products...</h3>

            <p>
              Connecting to ShopMind AI server.
            </p>
          </div>
        )}

        {/* ERROR */}

        {!productsLoading && productsError && (
          <div className="status-box error-box">
            <h3>⚠️ Unable to load products</h3>

            <p>{productsError}</p>

            <button onClick={loadProducts}>
              Try Again
            </button>
          </div>
        )}

        {/* PRODUCTS GRID */}

        {!productsLoading &&
          !productsError &&
          filteredProducts.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const stock = getStock(product);

                return (
                  <article
                    className="product-card"
                    key={product._id}
                  >
                    <div
                      className="product-icon"
                      onClick={() =>
                        setSelectedProduct(product)
                      }
                    >
                      {product.icon || "🛍️"}
                    </div>

                    <div className="product-info">
                      <span className="product-category">
                        {product.category}
                      </span>

                      <h3>{product.name}</h3>

                      <div className="rating">
                        ⭐ {product.rating || "N/A"}
                      </div>

                      <p className="description">
                        {product.description ||
                          "No description available."}
                      </p>

                      <div className="stock">
                        {stock > 0 ? "🟢" : "🔴"}{" "}
                        {getStockLabel(product)}
                      </div>

                      <div className="product-bottom">
                        <div className="price">
                          {formatPrice(product.price)}
                        </div>

                        <button
                          disabled={stock <= 0}
                          onClick={() =>
                            addToCart(product)
                          }
                        >
                          {stock <= 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>
                      </div>

                      <button
                        className="details-button"
                        onClick={() =>
                          setSelectedProduct(product)
                        }
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        {/* NO RESULTS */}

        {!productsLoading &&
          !productsError &&
          filteredProducts.length === 0 && (
            <div className="status-box">
              <h3>🔎 No products found</h3>

              <p>
                Try another search or category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
              >
                Show All Products
              </button>
            </div>
          )}
      </section>

      {/* PRODUCT DETAILS MODAL */}

      {selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              onClick={() =>
                setSelectedProduct(null)
              }
            >
              ×
            </button>

            <div className="modal-product-icon">
              {selectedProduct.icon || "🛍️"}
            </div>

            <span className="product-category">
              {selectedProduct.category}
            </span>

            <h2>{selectedProduct.name}</h2>

            <div className="rating">
              ⭐ {selectedProduct.rating || "N/A"}
            </div>

            <p>
              {selectedProduct.description ||
                "No description available."}
            </p>

            <h2>
              {formatPrice(selectedProduct.price)}
            </h2>

            <p>
              <strong>Availability:</strong>{" "}
              {getStockLabel(selectedProduct)}
            </p>

            <button
              className="primary-button"
              disabled={
                getStock(selectedProduct) <= 0
              }
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
            >
              {getStock(selectedProduct) <= 0
                ? "Out of Stock"
                : "Add to Cart"}
            </button>
          </div>
        </div>
      )}

      {/* CART MODAL */}

      {showCart && (
        <div
          className="modal-overlay"
          onClick={() => setShowCart(false)}
        >
          <div
            className="modal cart-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              onClick={() =>
                setShowCart(false)
              }
            >
              ×
            </button>

            <h2>🛒 Your Cart</h2>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div>🛒</div>

                <h3>Your cart is empty</h3>

                <p>
                  Add some products to start
                  shopping.
                </p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div
                      className="cart-item"
                      key={item._id}
                    >
                      <div className="cart-icon">
                        {item.icon || "🛍️"}
                      </div>

                      <div className="cart-info">
                        <h4>{item.name}</h4>

                        <p>
                          {formatPrice(item.price)}
                        </p>

                        <div className="quantity-control">
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
                            {item.quantity || 1}
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
                        className="remove-button"
                        onClick={() =>
                          removeFromCart(item._id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total</span>

                  <strong>
                    {formatPrice(cartTotal)}
                  </strong>
                </div>

                <button
                  className="checkout-button"
                  onClick={() =>
                    alert(
                      "Checkout will be connected next."
                    )
                  }
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}

      <footer>
        <h3>ShopMind AI</h3>

        <p>
          AI-powered shopping made simple.
        </p>

        <p>
          © 2026 ShopMind AI. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;