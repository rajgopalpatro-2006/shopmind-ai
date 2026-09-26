import { useEffect, useMemo, useState } from "react";

import API_URL from "./api";

import LoginModal from "./LoginModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

import AdminPanel from "./AdminPanel";
import AdminOrders from "./AdminOrders";
import AdminDashboard from "./AdminDashboard";

import CartModal from "./CartModal";
import CheckoutModal from "./CheckoutModal";
import MyOrdersModal from "./MyOrdersModal";
import WishlistModal from "./WishlistModal";

import AIShoppingAssistant from "./AIShoppingAssistant";
import ProductComparison from "./ProductComparison";
import ProductReviews from "./ProductReviews";
import RecentlyViewed from "./RecentlyViewed";
import RecommendedProducts from "./RecommendedProducts";

import NotificationModal from "./NotificationModal";
import ProfileModal from "./ProfileModal";

import "./App.css";

function App() {
  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [productsError, setProductsError] =
    useState("");

  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  // =====================================================
  // PRODUCT DETAILS
  // =====================================================

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

  // =====================================================
  // RECENTLY VIEWED
  // =====================================================

  const [
    recentlyViewed,
    setRecentlyViewed,
  ] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          "shopmindRecentlyViewed"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    } catch (error) {
      console.error(
        "Could not load recently viewed:",
        error
      );

      return [];
    }
  });

  // =====================================================
  // CART
  // =====================================================

  const [cart, setCart] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "shopmindCart"
          );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch (error) {
        console.error(
          "Could not load cart:",
          error
        );

        return [];
      }
    });

  const [
    showCart,
    setShowCart,
  ] = useState(false);

  // =====================================================
  // WISHLIST
  // =====================================================

  const [wishlist, setWishlist] =
    useState([]);

  const [
    showWishlist,
    setShowWishlist,
  ] = useState(false);

  const [
    wishlistLoading,
    setWishlistLoading,
  ] = useState(false);

  // =====================================================
  // LOGIN / USER
  // =====================================================

  const [
    showLogin,
    setShowLogin,
  ] = useState(false);

  const [
    showForgotPassword,
    setShowForgotPassword,
  ] = useState(false);

  const [user, setUser] =
    useState(() => {
      try {
        const savedUser =
          localStorage.getItem(
            "shopmindUser"
          );

        return savedUser
          ? JSON.parse(savedUser)
          : null;
      } catch (error) {
        console.error(
          "Could not load saved user:",
          error
        );

        return null;
      }
    });

  // =====================================================
  // CHECKOUT
  // =====================================================

  const [
    showCheckout,
    setShowCheckout,
  ] = useState(false);

  // =====================================================
  // MY ORDERS
  // =====================================================

  const [
    showMyOrders,
    setShowMyOrders,
  ] = useState(false);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    unreadNotifications,
    setUnreadNotifications,
  ] = useState(0);

  // =====================================================
  // PROFILE
  // =====================================================

  const [
    showProfile,
    setShowProfile,
  ] = useState(false);

  // =====================================================
  // ADMIN
  // =====================================================

  const [
    showAdminDashboard,
    setShowAdminDashboard,
  ] = useState(false);

  const [
    showAdminPanel,
    setShowAdminPanel,
  ] = useState(false);

  const [
    showAdminOrders,
    setShowAdminOrders,
  ] = useState(false);

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");

      const response = await fetch(
        `${API_URL}/api/products`
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not load products."
        );
      }

      setProducts(
        data.products || []
      );
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
  // LOAD WISHLIST FROM DATABASE
  // =====================================================

  const loadWishlist = async () => {
    try {
      const token =
        localStorage.getItem(
          "shopmindToken"
        );

      if (!token) {
        setWishlist([]);
        return;
      }

      setWishlistLoading(true);

      const response = await fetch(
        `${API_URL}/api/wishlist`,
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
            "Could not load wishlist."
        );
      }

      setWishlist(
        data.products || []
      );
    } catch (error) {
      console.error(
        "Load wishlist error:",
        error
      );

      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  // =====================================================
  // LOAD WISHLIST WHEN USER CHANGES
  // =====================================================

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  // =====================================================
  // LOAD UNREAD NOTIFICATIONS
  // =====================================================

  const loadUnreadNotifications =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "shopmindToken"
          );

        if (!token) {
          setUnreadNotifications(0);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/notifications/unread-count`,
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
              "Could not load notifications."
          );
        }

        setUnreadNotifications(
          Number(
            data.unreadCount || 0
          )
        );
      } catch (error) {
        console.error(
          "Unread notification error:",
          error
        );

        setUnreadNotifications(0);
      }
    };

  useEffect(() => {
    if (user) {
      loadUnreadNotifications();
    } else {
      setUnreadNotifications(0);
    }
  }, [user]);

  // =====================================================
  // SAVE CART
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "shopmindCart",
      JSON.stringify(cart)
    );
  }, [cart]);

  // =====================================================
  // SAVE RECENTLY VIEWED
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "shopmindRecentlyViewed",
      JSON.stringify(
        recentlyViewed
      )
    );
  }, [recentlyViewed]);

  // =====================================================
  // ADD RECENTLY VIEWED
  // =====================================================

  const addToRecentlyViewed = (
    product
  ) => {
    if (!product?._id) {
      return;
    }

    setRecentlyViewed(
      (currentProducts) => {
        const filtered =
          currentProducts.filter(
            (item) =>
              item._id !==
              product._id
          );

        return [
          product,
          ...filtered,
        ].slice(0, 6);
      }
    );
  };

  // =====================================================
  // OPEN PRODUCT DETAILS
  // =====================================================

  const openProductDetails = (
    product
  ) => {
    if (!product) {
      return;
    }

    addToRecentlyViewed(product);

    setSelectedProduct(product);
  };

  // =====================================================
  // CLEAR RECENTLY VIEWED
  // =====================================================

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);

    localStorage.removeItem(
      "shopmindRecentlyViewed"
    );
  };

  // =====================================================
  // STOCK HELPERS
  // =====================================================

  const getStock = (product) => {
    return Number(
      product?.stock ?? 10
    );
  };

  const getStockLabel = (
    product
  ) => {
    const stock =
      getStock(product);

    if (stock <= 0) {
      return "Out of Stock";
    }

    if (stock <= 5) {
      return `Only ${stock} Left`;
    }

    return "In Stock";
  };

  const getStockClass = (
    product
  ) => {
    const stock =
      getStock(product);

    if (stock <= 0) {
      return "out-stock";
    }

    if (stock <= 5) {
      return "low-stock";
    }

    return "in-stock";
  };

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts =
    useMemo(() => {
      let result = [...products];

      if (
        selectedCategory !==
        "All"
      ) {
        result =
          result.filter(
            (product) =>
              product.category ===
              selectedCategory
          );
      }

      if (search.trim()) {
        const text =
          search
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (product) =>
              product.name
                ?.toLowerCase()
                .includes(text) ||
              product.category
                ?.toLowerCase()
                .includes(text) ||
              product.description
                ?.toLowerCase()
                .includes(text)
          );
      }

      return result;
    }, [
      products,
      search,
      selectedCategory,
    ]);

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
  // CART TOTALS
  // =====================================================

  const cartCount =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 1
        ),
      0
    );

  const cartTotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 1
          ),
      0
    );

  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = (
    product,
    openCart = true
  ) => {
    const availableStock =
      getStock(product);

    if (
      availableStock <= 0
    ) {
      alert(
        `${product.name} is currently out of stock.`
      );

      return;
    }

    setCart(
      (currentCart) => {
        const existingProduct =
          currentCart.find(
            (item) =>
              item._id ===
              product._id
          );

        if (existingProduct) {
          const currentQuantity =
            Number(
              existingProduct.quantity ||
                1
            );

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
              item._id ===
              product._id
                ? {
                    ...item,
                    ...product,
                    quantity:
                      currentQuantity +
                      1,
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
      }
    );

    setSelectedProduct(null);

        if (openCart) {
      setShowCart(true);
    }
  }
};