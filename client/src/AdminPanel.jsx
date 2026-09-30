import { useEffect, useMemo, useState } from "react";

import API_URL from "./api";
import "./AdminPanel.css";

function AdminPanel({
  onClose,
  onProductAdded,
  onProductUpdated,
  onProductDeleted,
}) {
  // =====================================================
  // INITIAL FORM
  // =====================================================

  const initialForm = {
    name: "",
    category: "Laptop",
    price: "",
    image: "",
    icon: "💻",
    rating: "",
    stock: "10",
    description: "",
  };

  // =====================================================
  // STATES
  // =====================================================

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] =
    useState(true);

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = [
    "Laptop",
    "Smartphone",
    "Headphones",
    "Smartwatch",
  ];

  // =====================================================
  // CATEGORY ICONS
  // =====================================================

  const categoryIcons = {
    Laptop: "💻",
    Smartphone: "📱",
    Headphones: "🎧",
    Smartwatch: "⌚",
  };

  // =====================================================
  // GET PRODUCT ID
  // =====================================================

  const getProductId = (product) => {
    return product?._id || product?.id || null;
  };

  // =====================================================
  // GET PRODUCT STOCK
  // =====================================================

  const getProductStock = (product) => {
    const stock = Number(product?.stock ?? 0);

    if (!Number.isFinite(stock)) {
      return 0;
    }

    return stock;
  };

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not load products."
        );
      }

      setProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );
    } catch (err) {
      console.error(
        "Admin product loading error:",
        err
      );

      setError(
        err.message ||
          "Could not load products. Make sure the backend is running."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  // =====================================================
  // LOAD ON OPEN
  // =====================================================

  useEffect(() => {
    loadProducts();
  }, []);

  // =====================================================
  // STOCK INFO
  // =====================================================

  const getStockInfo = (product) => {
    const stock = getProductStock(product);

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className: "stock-out",
      };
    }

    if (stock <= 5) {
      return {
        label: `Low Stock (${stock})`,
        className: "stock-low",
      };
    }

    return {
      label: `In Stock (${stock})`,
      className: "stock-good",
    };
  };

  // =====================================================
  // INVENTORY STATISTICS
  // =====================================================

  const inventoryStats = useMemo(() => {
    const total = products.length;

    const inStock = products.filter((product) => {
      return getProductStock(product) > 5;
    }).length;

    const lowStock = products.filter((product) => {
      const stock = getProductStock(product);

      return stock > 0 && stock <= 5;
    }).length;

    const outOfStock = products.filter((product) => {
      return getProductStock(product) <= 0;
    }).length;

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (categoryFilter !== "All") {
      result = result.filter((product) => {
        return product.category === categoryFilter;
      });
    }

    const text = search.trim().toLowerCase();

    if (text) {
      result = result.filter((product) => {
        const name = String(
          product.name || ""
        ).toLowerCase();

        const category = String(
          product.category || ""
        ).toLowerCase();

        const description = String(
          product.description || ""
        ).toLowerCase();

        return (
          name.includes(text) ||
          category.includes(text) ||
          description.includes(text)
        );
      });
    }

    return result;
  }, [products, search, categoryFilter]);

  // =====================================================
  // NORMAL FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // CATEGORY CHANGE
  // =====================================================

  const handleCategoryChange = (event) => {
    const category = event.target.value;

    setForm((current) => ({
      ...current,
      category,
      icon: categoryIcons[category] || "📦",
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      name: "",
      category: "Laptop",
      price: "",
      image: "",
      icon: "💻",
      rating: "",
      stock: "10",
      description: "",
    });

    setEditingId(null);
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Please enter a product name.";
    }

    const price = Number(form.price);

    if (
      form.price === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return "Please enter a valid price.";
    }

    const rating = Number(form.rating);

    if (
      form.rating === "" ||
      !Number.isFinite(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      return "Rating must be between 0 and 5.";
    }

    const stock = Number(form.stock);

    if (
      form.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return "Stock must be a whole number of 0 or more.";
    }

    if (!form.description.trim()) {
      return "Please enter a product description.";
    }

    return null;
  };

  // =====================================================
  // ADD / UPDATE PRODUCT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("shopmindToken") ||
        localStorage.getItem("shopmind_token");

      if (!token) {
        throw new Error(
          "Admin login required."
        );
      }

      const url = editingId
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`;

      const method = editingId
        ? "PUT"
        : "POST";

      const productData = {
        name: form.name.trim(),

        category: form.category,

        price: Number(form.price),

        image: form.image.trim(),

        icon:
          form.icon ||
          categoryIcons[form.category] ||
          "📦",

        rating: Number(form.rating),

        stock: Number(form.stock),

        description: form.description.trim(),
      };

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(productData),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from server."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (editingId
              ? "Could not update product."
              : "Could not add product.")
        );
      }

      // ================================================
      // UPDATE PRODUCT
      // ================================================

      if (editingId) {
        setProducts((currentProducts) =>
          currentProducts.map((product) => {
            return getProductId(product) === editingId
              ? data.product
              : product;
          })
        );

        if (
          typeof onProductUpdated === "function"
        ) {
          onProductUpdated(data.product);
        }

        setMessage(
          "Product updated successfully."
        );
      }

      // ================================================
      // ADD PRODUCT
      // ================================================

      else {
        setProducts((currentProducts) => [
          data.product,
          ...currentProducts,
        ]);

        if (
          typeof onProductAdded === "function"
        ) {
          onProductAdded(data.product);
        }

        setMessage(
          "Product added successfully."
        );
      }

      resetForm();
    } catch (err) {
      console.error(
        "Product save error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while saving the product."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT PRODUCT
  // =====================================================

  const handleEdit = (product) => {
    const productId = getProductId(product);

    if (!productId) {
      setError(
        "Could not find this product."
      );

      return;
    }

    // ================================================
    // SET EDIT MODE
    // ================================================

    setEditingId(productId);

    // ================================================
    // LOAD PRODUCT INTO FORM
    // ================================================

    setForm({
      name: product.name || "",

      category:
        product.category || "Laptop",

      price:
        product.price ?? "",

      image:
        product.image || "",

      icon:
        product.icon ||
        categoryIcons[product.category] ||
        "📦",

      rating:
        product.rating ?? 0,

      stock: Math.max(
        0,
        getProductStock(product)
      ),

      description:
        product.description || "",
    });

    setMessage("");
    setError("");

    // ================================================
    // MOVE TO EDIT FORM
    // ================================================

    setTimeout(() => {
      const formPanel =
        document.querySelector(
          ".ap-form-panel"
        );

      if (formPanel) {
        formPanel.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        formPanel.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      // Focus product name
      const nameInput =
        document.querySelector(
          '.ap-form input[name="name"]'
        );

      if (nameInput) {
        nameInput.focus();
      }
    }, 100);
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {
    resetForm();

    setMessage("");
    setError("");
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const handleDelete = async (product) => {
    const productId = getProductId(product);

    if (!productId) {
      setError(
        "Could not find this product."
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const token =
        localStorage.getItem("shopmindToken") ||
        localStorage.getItem("shopmind_token");

      if (!token) {
        throw new Error(
          "Admin login required."
        );
      }

      const response = await fetch(
        `${API_URL}/api/products/${productId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from server."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Could not delete product."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter((item) => {
          return (
            getProductId(item) !== productId
          );
        })
      );

      if (
        typeof onProductDeleted === "function"
      ) {
        onProductDeleted(productId);
      }

      if (editingId === productId) {
        resetForm();
      }

      setMessage(
        "Product deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err.message ||
          "Could not delete product."
      );
    }
  };

  // =====================================================
  // PRODUCT IMAGE ERROR
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
  // IMAGE PREVIEW ERROR
  // =====================================================

  const handlePreviewError = (event) => {
    event.currentTarget.style.display =
      "none";

    const fallback =
      event.currentTarget.nextElementSibling;

    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return Number(
      price || 0
    ).toLocaleString("en-IN");
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div
      className="admin-products-overlay"
      onClick={onClose}
    >
      <div
        className="admin-products-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="ap-header">
          <div className="ap-header-main">
            <div className="ap-header-icon">
              📦
            </div>

            <div>
              <h2>
                Manage Products
              </h2>

              <p>
                Add new products, update
                inventory and manage your
                ShopMind catalog
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ap-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="ap-stats">
          <div className="ap-stat-card ap-stat-total">
            <div className="ap-stat-icon">
              📦
            </div>

            <div>
              <strong>
                {inventoryStats.total}
              </strong>

              <span>
                Total Products
              </span>
            </div>
          </div>

          <div className="ap-stat-card ap-stat-good">
            <div className="ap-stat-icon">
              ✓
            </div>

            <div>
              <strong>
                {inventoryStats.inStock}
              </strong>

              <span>
                In Stock
              </span>
            </div>
          </div>

          <div className="ap-stat-card ap-stat-low">
            <div className="ap-stat-icon">
              ⚠
            </div>

            <div>
              <strong>
                {inventoryStats.lowStock}
              </strong>

              <span>
                Low Stock
              </span>
            </div>
          </div>

          <div className="ap-stat-card ap-stat-out">
            <div className="ap-stat-icon">
              !
            </div>

            <div>
              <strong>
                {inventoryStats.outOfStock}
              </strong>

              <span>
                Out of Stock
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div className="ap-message ap-success">
            <span>✓</span>

            {message}
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="ap-message ap-error">
            <span>!</span>

            {error}
          </div>
        )}

        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="ap-layout">
          {/* ===============================================
              LEFT SIDE
          =============================================== */}

          <aside className="ap-form-panel">
            <div className="ap-section-heading">
              <div className="ap-section-icon">
                {editingId ? "✏️" : "＋"}
              </div>

              <div>
                <h3>
                  {editingId
                    ? "Edit Product"
                    : "Add New Product"}
                </h3>

                <p>
                  {editingId
                    ? "Update the selected product details"
                    : "Enter product details below"}
                </p>
              </div>
            </div>

            {/* =============================================
                EDIT MODE NOTICE
            ============================================= */}

            {editingId && (
              <div className="ap-edit-notice">
                <span>✏️</span>

                <div>
                  <strong>
                    Editing Product
                  </strong>

                  <p>
                    Make your changes and
                    click Update Product.
                  </p>
                </div>
              </div>
            )}

            {/* =============================================
                PRODUCT FORM
            ============================================= */}

            <form
              className="ap-form"
              onSubmit={handleSubmit}
            >
              {/* PRODUCT NAME */}

              <label className="ap-field ap-full">
                <span>
                  Product Name
                </span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. iPhone 16 Pro"
                  required
                />
              </label>

              {/* CATEGORY */}

              <label className="ap-field">
                <span>
                  Category
                </span>

                <select
                  name="category"
                  value={form.category}
                  onChange={
                    handleCategoryChange
                  }
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* FALLBACK ICON */}

              <label className="ap-field">
                <span>
                  Fallback Icon
                </span>

                <input
                  type="text"
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  placeholder="📱"
                />
              </label>

              {/* PRICE */}

              <label className="ap-field">
                <span>
                  Price (₹)
                </span>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="79999"
                  min="1"
                  required
                />
              </label>

              {/* RATING */}

              <label className="ap-field">
                <span>
                  Rating
                </span>

                <input
                  type="number"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  placeholder="4.5"
                  min="0"
                  max="5"
                  step="0.1"
                  required
                />
              </label>

              {/* ===========================================
                  PRODUCT IMAGE URL
              =========================================== */}

              <label className="ap-field ap-full">
                <span>
                  Product Image URL
                </span>

                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/product-image.jpg"
                />

                <small>
                  Paste a direct image URL.
                  Leave it blank to use the
                  product emoji.
                </small>
              </label>

              {/* ===========================================
                  IMAGE PREVIEW
              =========================================== */}

              {form.image.trim() && (
                <div className="ap-image-preview ap-full">
                  <span className="ap-image-preview-title">
                    Product Image Preview
                  </span>

                  <div className="ap-image-preview-box">
                    <img
                      key={form.image}
                      src={form.image}
                      alt={
                        form.name ||
                        "Product preview"
                      }
                      onError={
                        handlePreviewError
                      }
                    />

                    <div
                      className="ap-preview-fallback"
                      style={{
                        display: "none",
                      }}
                    >
                      <span>
                        {form.icon ||
                          "📦"}
                      </span>

                      <small>
                        Image could not
                        be loaded
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* STOCK */}

              <label className="ap-field ap-full">
                <span>
                  Stock Quantity
                </span>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  step="1"
                  required
                />

                <small>
                  Enter 0 to mark the
                  product as out of stock.
                </small>
              </label>

              {/* DESCRIPTION */}

              <label className="ap-field ap-full">
                <span>
                  Description
                </span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter product description..."
                  rows="4"
                  required
                />
              </label>

              {/* ADD / UPDATE */}

              <button
                type="submit"
                className="ap-submit"
                disabled={loading}
              >
                {loading
                  ? editingId
                    ? "Updating Product..."
                    : "Adding Product..."
                  : editingId
                  ? "💾 Update Product"
                  : "＋ Add Product"}
              </button>

              {/* CANCEL EDIT */}

              {editingId && (
                <button
                  type="button"
                  className="ap-cancel"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={loading}
                >
                  ✕ Cancel Edit
                </button>
              )}
            </form>
          </aside>

          {/* ===============================================
              RIGHT SIDE
          =============================================== */}

          <main className="ap-products-panel">
            <div className="ap-products-heading">
              <div>
                <h3>
                  📦 All Products
                </h3>

                <p>
                  {filteredProducts.length}{" "}
                  product
                  {filteredProducts.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  displayed
                </p>
              </div>
            </div>

            {/* =============================================
                SEARCH + FILTER
            ============================================= */}

            <div className="ap-toolbar">
              <div className="ap-search">
                <span>🔍</span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search products..."
                />
              </div>

              <select
                className="ap-filter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* =============================================
                LOADING
            ============================================= */}

            {productsLoading && (
              <div className="ap-empty">
                <div>⏳</div>

                <h3>
                  Loading products...
                </h3>

                <p>
                  Please wait while
                  ShopMind loads your
                  catalog.
                </p>
              </div>
            )}

            {/* =============================================
                EMPTY
            ============================================= */}

            {!productsLoading &&
              filteredProducts.length ===
                0 && (
                <div className="ap-empty">
                  <div>🔍</div>

                  <h3>
                    No products found
                  </h3>

                  <p>
                    Try another search or
                    select a different
                    category.
                  </p>
                </div>
              )}

            {/* =============================================
                PRODUCTS
            ============================================= */}

            {!productsLoading &&
              filteredProducts.length >
                0 && (
                <div className="ap-product-grid">
                  {filteredProducts.map(
                    (product) => {
                      const productId =
                        getProductId(
                          product
                        );

                      const stock =
                        getProductStock(
                          product
                        );

                      const stockInfo =
                        getStockInfo(
                          product
                        );

                      return (
                        <article
                          className="ap-product-card"
                          key={productId}
                        >
                          {/* ===============================
                              PRODUCT IMAGE
                          =============================== */}

                          <div className="ap-card-top">
                            {product.image ? (
                              <>
                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="ap-product-image"
                                  loading="lazy"
                                  onError={
                                    handleImageError
                                  }
                                />

                                <div
                                  className="ap-product-icon ap-product-icon-fallback"
                                  style={{
                                    display:
                                      "none",
                                  }}
                                >
                                  {product.icon ||
                                    categoryIcons[
                                      product
                                        .category
                                    ] ||
                                    "📦"}
                                </div>
                              </>
                            ) : (
                              <div className="ap-product-icon ap-product-icon-fallback">
                                {product.icon ||
                                  categoryIcons[
                                    product
                                      .category
                                  ] ||
                                  "📦"}
                              </div>
                            )}

                            {/* STOCK BADGE */}

                            <span
                              className={`ap-stock-badge ${stockInfo.className}`}
                            >
                              {
                                stockInfo.label
                              }
                            </span>
                          </div>

                          {/* ===============================
                              PRODUCT INFO
                          =============================== */}

                          <div className="ap-card-body">
                            <h4>
                              {product.name}
                            </h4>

                            <div className="ap-rating">
                              ⭐{" "}
                              {Number(
                                product.rating ||
                                  0
                              ).toFixed(1)}
                            </div>

                            <div className="ap-price">
                              ₹
                              {formatPrice(
                                product.price
                              )}
                            </div>

                            <div className="ap-category">
                              {
                                product.category
                              }
                            </div>

                            <div className="ap-inventory">
                              Inventory:{" "}
                              <strong>
                                {Math.max(
                                  0,
                                  stock
                                )}
                              </strong>{" "}
                              unit
                              {Math.max(
                                0,
                                stock
                              ) === 1
                                ? ""
                                : "s"}
                            </div>
                          </div>

                          {/* ===============================
                              ACTIONS
                          =============================== */}

                          <div className="ap-card-actions">
                            <button
                              type="button"
                              className="ap-edit-btn"
                              onClick={() =>
                                handleEdit(
                                  product
                                )
                              }
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              className="ap-delete-btn"
                              onClick={() =>
                                handleDelete(
                                  product
                                )
                              }
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;