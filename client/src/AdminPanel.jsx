import { useEffect, useState } from "react";
import API_URL from "./api";

function AdminPanel({
  onClose,
  onProductAdded,
  onProductUpdated,
  onProductDeleted,
}) {
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: "Laptop",
    price: "",
    icon: "💻",
    rating: "",
    stock: "10",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

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
          data.message ||
            "Could not load products."
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error(
        "Admin product loading error:",
        err
      );

      setError(
        "Could not load products. Make sure the backend is running."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      name: "",
      category: "Laptop",
      price: "",
      icon: "💻",
      rating: "",
      stock: "10",
      description: "",
    });

    setEditingId(null);
  };

  // ==========================================
  // CATEGORY ICON
  // ==========================================

  const handleCategoryChange = (e) => {
    const category = e.target.value;

    let icon = "💻";

    if (category === "Smartphone") {
      icon = "📱";
    }

    if (category === "Headphones") {
      icon = "🎧";
    }

    if (category === "Smartwatch") {
      icon = "⌚";
    }

    setForm((current) => ({
      ...current,
      category,
      icon,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // ADD / UPDATE PRODUCT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ==========================================
    // NAME VALIDATION
    // ==========================================

    if (!form.name.trim()) {
      setError(
        "Please enter a product name."
      );

      return;
    }

    // ==========================================
    // PRICE VALIDATION
    // ==========================================

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {
      setError(
        "Please enter a valid price."
      );

      return;
    }

    // ==========================================
    // RATING VALIDATION
    // ==========================================

    if (
      form.rating === "" ||
      Number(form.rating) < 0 ||
      Number(form.rating) > 5
    ) {
      setError(
        "Rating must be between 0 and 5."
      );

      return;
    }

    // ==========================================
    // STOCK VALIDATION
    // ==========================================

    const stockNumber =
      Number(form.stock);

    if (
      form.stock === "" ||
      !Number.isInteger(stockNumber) ||
      stockNumber < 0
    ) {
      setError(
        "Stock must be a whole number of 0 or more."
      );

      return;
    }

    // ==========================================
    // DESCRIPTION VALIDATION
    // ==========================================

    if (!form.description.trim()) {
      setError(
        "Please enter a product description."
      );

      return;
    }

    try {
      setLoading(true);

      const url = editingId
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`;

      const method = editingId
        ? "PUT"
        : "POST";

      const token =
        localStorage.getItem(
          "shopmindToken"
        );

      if (!token) {
        throw new Error(
          "Admin login required."
        );
      }

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: form.name.trim(),

          category:
            form.category,

          price:
            Number(form.price),

          icon:
            form.icon || "📦",

          rating:
            Number(form.rating),

          stock:
            stockNumber,

          description:
            form.description.trim(),
        }),
      });

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            (editingId
              ? "Could not update product."
              : "Could not add product.")
        );
      }

      // ==========================================
      // UPDATE EXISTING PRODUCT
      // ==========================================

      if (editingId) {
        setProducts(
          (currentProducts) =>
            currentProducts.map(
              (product) =>
                product._id ===
                editingId
                  ? data.product
                  : product
            )
        );

        if (onProductUpdated) {
          onProductUpdated(
            data.product
          );
        }

        setMessage(
          "✅ Product updated successfully!"
        );
      }

      // ==========================================
      // ADD NEW PRODUCT
      // ==========================================

      else {
        setProducts(
          (currentProducts) => [
            data.product,
            ...currentProducts,
          ]
        );

        if (onProductAdded) {
          onProductAdded(
            data.product
          );
        }

        setMessage(
          "✅ Product added successfully!"
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
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EDIT PRODUCT
  // ==========================================

  const handleEdit = (product) => {
    setEditingId(
      product._id
    );

    setForm({
      name:
        product.name || "",

      category:
        product.category ||
        "Laptop",

      price:
        product.price ?? "",

      icon:
        product.icon || "💻",

      rating:
        product.rating ?? "",

      /*
        Existing products created before
        inventory support may not contain
        stock yet.

        Give those products 10 by default.
      */

      stock:
        product.stock ??
        10,

      description:
        product.description ||
        "",
    });

    setMessage("");
    setError("");

    const panel =
      document.querySelector(
        ".admin-panel"
      );

    if (panel) {
      panel.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    resetForm();

    setMessage("");

    setError("");
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDelete = async (
    product
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const token =
        localStorage.getItem(
          "shopmindToken"
        );

      if (!token) {
        throw new Error(
          "Admin login required."
        );
      }

      const response = await fetch(
        `${API_URL}/api/products/${product._id}`,
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
            "Could not delete product."
        );
      }

      setProducts(
        (currentProducts) =>
          currentProducts.filter(
            (item) =>
              item._id !==
              product._id
          )
      );

      if (onProductDeleted) {
        onProductDeleted(
          product._id
        );
      }

      if (
        editingId ===
        product._id
      ) {
        resetForm();
      }

      setMessage(
        "✅ Product deleted successfully!"
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

  // ==========================================
  // STOCK HELPERS
  // ==========================================

  const getProductStock = (
    product
  ) => {
    /*
      Old MongoDB products may not have
      stock yet. Display 10 until edited.
    */

    return product.stock ?? 10;
  };

  const getStockInfo = (
    product
  ) => {
    const stock =
      getProductStock(product);

    if (stock === 0) {
      return {
        label:
          "Out of Stock",

        background:
          "#fee2e2",

        color:
          "#dc2626",
      };
    }

    if (stock <= 5) {
      return {
        label:
          `Low Stock (${stock})`,

        background:
          "#fef3c7",

        color:
          "#b45309",
      };
    }

    return {
      label:
        `In Stock (${stock})`,

      background:
        "#dcfce7",

      color:
        "#15803d",
    };
  };

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="admin-panel"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* ===============================
            CLOSE BUTTON
        =============================== */}

        <button
          type="button"
          className="close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        {/* ===============================
            HEADER
        =============================== */}

        <div
          style={{
            marginBottom:
              "25px",
          }}
        >
          <h2>
            ⚙️ Admin Dashboard
          </h2>

          <p>
            Add, edit, delete
            and manage ShopMind
            AI product inventory.
          </p>
        </div>

        {/* ===============================
            SUCCESS MESSAGE
        =============================== */}

        {message && (
          <div
            style={{
              background:
                "#f0fdf4",

              color:
                "#15803d",

              padding:
                "12px",

              borderRadius:
                "10px",

              marginBottom:
                "20px",

              fontWeight:
                "600",
            }}
          >
            {message}
          </div>
        )}

        {/* ===============================
            ERROR MESSAGE
        =============================== */}

        {error && (
          <div
            style={{
              background:
                "#fef2f2",

              color:
                "#dc2626",

              padding:
                "12px",

              borderRadius:
                "10px",

              marginBottom:
                "20px",

              fontWeight:
                "600",
            }}
          >
            {error}
          </div>
        )}

        {/* ===============================
            PRODUCT FORM
        =============================== */}

        <form
          className="admin-form"
          onSubmit={
            handleSubmit
          }
        >
          {/* PRODUCT NAME */}

          <label>
            Product Name

            <input
              type="text"
              name="name"
              value={
                form.name
              }
              onChange={
                handleChange
              }
              placeholder="Example: Dell XPS 15"
              required
            />
          </label>

          {/* CATEGORY */}

          <label>
            Category

            <select
              name="category"
              value={
                form.category
              }
              onChange={
                handleCategoryChange
              }
            >
              <option value="Laptop">
                Laptop
              </option>

              <option value="Smartphone">
                Smartphone
              </option>

              <option value="Headphones">
                Headphones
              </option>

              <option value="Smartwatch">
                Smartwatch
              </option>
            </select>
          </label>

          {/* PRICE */}

          <label>
            Price

            <input
              type="number"
              name="price"
              value={
                form.price
              }
              onChange={
                handleChange
              }
              placeholder="79999"
              min="1"
              required
            />
          </label>

          {/* PRODUCT ICON */}

          <label>
            Product Icon

            <input
              type="text"
              name="icon"
              value={
                form.icon
              }
              onChange={
                handleChange
              }
              placeholder="💻"
            />
          </label>

          {/* RATING */}

          <label>
            Rating

            <input
              type="number"
              name="rating"
              value={
                form.rating
              }
              onChange={
                handleChange
              }
              placeholder="4.5"
              min="0"
              max="5"
              step="0.1"
              required
            />
          </label>

          {/* STOCK */}

          <label>
            Stock Quantity

            <input
              type="number"
              name="stock"
              value={
                form.stock
              }
              onChange={
                handleChange
              }
              placeholder="10"
              min="0"
              step="1"
              required
            />

            <small
              style={{
                display:
                  "block",

                marginTop:
                  "6px",

                color:
                  "#64748b",

                fontSize:
                  "12px",
              }}
            >
              Enter 0 to mark
              this product as
              out of stock.
            </small>
          </label>

          {/* DESCRIPTION */}

          <label>
            Description

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Enter product description..."
              rows="4"
              required
            />
          </label>

          {/* SUBMIT */}

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={
              loading
            }
          >
            {loading
              ? "Saving..."
              : editingId
              ? "💾 Update Product"
              : "＋ Add Product"}
          </button>

          {/* CANCEL EDIT */}

          {editingId && (
            <button
              type="button"
              onClick={
                handleCancelEdit
              }
              style={{
                width:
                  "100%",

                marginTop:
                  "10px",

                padding:
                  "12px",

                borderRadius:
                  "10px",

                border:
                  "1px solid #ddd",

                background:
                  "white",

                cursor:
                  "pointer",

                fontWeight:
                  "600",
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>

        {/* ===============================
            PRODUCT MANAGEMENT
        =============================== */}

        <div
          style={{
            marginTop:
              "35px",
          }}
        >
          <h2>
            📦 Manage Products
          </h2>

          <p
            style={{
              color:
                "#64748b",

              marginTop:
                "5px",
            }}
          >
            Manage product
            details, prices and
            available inventory.
          </p>

          {productsLoading ? (
            <p>
              Loading products...
            </p>
          ) : products.length ===
            0 ? (
            <p>
              No products found.
            </p>
          ) : (
            <div
              style={{
                display:
                  "flex",

                flexDirection:
                  "column",

                gap:
                  "12px",

                marginTop:
                  "20px",
              }}
            >
              {products.map(
                (product) => {
                  const stock =
                    getProductStock(
                      product
                    );

                  const stockInfo =
                    getStockInfo(
                      product
                    );

                  return (
                    <div
                      key={
                        product._id
                      }
                      style={{
                        border:
                          "1px solid #e5e7eb",

                        borderRadius:
                          "12px",

                        padding:
                          "15px",

                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",

                        gap:
                          "15px",
                      }}
                    >
                      {/* PRODUCT INFORMATION */}

                      <div>
                        <div
                          style={{
                            fontSize:
                              "28px",
                          }}
                        >
                          {product.icon ||
                            "📦"}
                        </div>

                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <div
                          style={{
                            marginTop:
                              "5px",

                            color:
                              "#6b7280",
                          }}
                        >
                          {
                            product.category
                          }{" "}
                          • ⭐{" "}
                          {product.rating ||
                            0}
                        </div>

                        {/* PRICE */}

                        <div
                          style={{
                            marginTop:
                              "5px",

                            fontWeight:
                              "700",
                          }}
                        >
                          ₹
                          {Number(
                            product.price ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </div>

                        {/* STOCK BADGE */}

                        <div
                          style={{
                            marginTop:
                              "9px",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-block",

                              padding:
                                "6px 10px",

                              borderRadius:
                                "999px",

                              background:
                                stockInfo.background,

                              color:
                                stockInfo.color,

                              fontSize:
                                "12px",

                              fontWeight:
                                "700",
                            }}
                          >
                            📦{" "}
                            {
                              stockInfo.label
                            }
                          </span>
                        </div>

                        {/* EXACT INVENTORY */}

                        <div
                          style={{
                            marginTop:
                              "6px",

                            color:
                              "#64748b",

                            fontSize:
                              "12px",
                          }}
                        >
                          Inventory:{" "}
                          <strong>
                            {stock}
                          </strong>{" "}
                          unit
                          {stock === 1
                            ? ""
                            : "s"}
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}

                      <div
                        style={{
                          display:
                            "flex",

                          gap:
                            "8px",

                          flexWrap:
                            "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              product
                            )
                          }
                          style={{
                            padding:
                              "8px 12px",

                            cursor:
                              "pointer",
                          }}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              product
                            )
                          }
                          style={{
                            padding:
                              "8px 12px",

                            cursor:
                              "pointer",

                            color:
                              "#dc2626",
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;