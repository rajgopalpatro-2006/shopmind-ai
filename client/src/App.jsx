import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./App.css";

import LoginModal from "./LoginModal";
import AuthModal from "./AuthModal";
import CartModal from "./CartModal";
import CheckoutModal from "./CheckoutModal";
import MyOrdersModal from "./MyOrdersModal";

import AdminPanel from "./AdminPanel";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./AdminOrders";

import WishlistModal from "./WishlistModal";
import AIShoppingAssistant from "./AIShoppingAssistant";
import ProductComparison from "./ProductComparison";
import ReviewsSection from "./ReviewsSection";
import RecentlyViewed from "./RecentlyViewed";
import RecommendedProducts from "./RecommendedProducts";


/* =================================================
   API
================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =================================================
   APP
================================================= */

function App() {

  /* =================================================
     AUTHENTICATION
  ================================================= */

  const [user, setUser] =
    useState(() => {
      try {
        const savedUser =
          localStorage.getItem(
            "shopmind-user"
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


  const [token, setToken] =
    useState(
      () =>
        localStorage.getItem(
          "token"
        ) || ""
    );


  const [
    showLogin,
    setShowLogin,
  ] = useState(false);


  const [
    showAuth,
    setShowAuth,
  ] = useState(false);


  /* =================================================
     PRODUCTS
  ================================================= */

  const [
    products,
    setProducts,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);


  /* =================================================
     SEARCH / FILTER
  ================================================= */

  const [
    search,
    setSearch,
  ] = useState("");


  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");


  const [
    sortOption,
    setSortOption,
  ] = useState("default");


  /* =================================================
     CART
  ================================================= */

  const [
    cart,
    setCart,
  ] = useState(() => {

    try {

      const savedCart =
        localStorage.getItem(
          "shopmind-cart"
        );

      return savedCart
        ? JSON.parse(savedCart)
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


  const [
    showCheckout,
    setShowCheckout,
  ] = useState(false);


  /* =================================================
     ORDERS
  ================================================= */

  const [
    showOrders,
    setShowOrders,
  ] = useState(false);


  /* =================================================
     WISHLIST
  ================================================= */

  const [
    wishlist,
    setWishlist,
  ] = useState(() => {

    try {

      const savedWishlist =
        localStorage.getItem(
          "shopmind-wishlist"
        );

      return savedWishlist
        ? JSON.parse(
            savedWishlist
          )
        : [];

    } catch (error) {

      console.error(
        "Could not load wishlist:",
        error
      );

      return [];
    }

  });


  const [
    showWishlist,
    setShowWishlist,
  ] = useState(false);


  /* =================================================
     COMPARE
  ================================================= */

  const [
    compareProducts,
    setCompareProducts,
  ] = useState([]);


  const [
    showCompare,
    setShowCompare,
  ] = useState(false);


  /* =================================================
     ADMIN
  ================================================= */

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


  /* =================================================
     AI SHOPPING ASSISTANT
  ================================================= */

  const [
    showAIAssistant,
    setShowAIAssistant,
  ] = useState(false);


  /* =================================================
     RECENTLY VIEWED
  ================================================= */

  const [
    recentlyViewed,
    setRecentlyViewed,
  ] = useState(() => {

    try {

      const saved =
        localStorage.getItem(
          "shopmind-recently-viewed"
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


  /* =================================================
     NOTIFICATION
  ================================================= */

  const [
    notification,
    setNotification,
  ] = useState("");


  /* =================================================
     ANIMATED NAVBAR
  ================================================= */

  const [
    navbarScrolled,
    setNavbarScrolled,
  ] = useState(false);


  useEffect(() => {

    const handleNavbarScroll =
      () => {

        setNavbarScrolled(
          window.scrollY > 30
        );

      };


    handleNavbarScroll();


    window.addEventListener(
      "scroll",
      handleNavbarScroll,
      {
        passive: true,
      }
    );


    return () => {

      window.removeEventListener(
        "scroll",
        handleNavbarScroll
      );

    };

  }, []);


  /* =================================================
     HELPERS
  ================================================= */

  const getProductId = (
    product
  ) => {

    return (
      product?._id ||
      product?.id ||
      product?.productId ||
      product?.name
    );

  };


  const getProductStock = (
    product
  ) => {

    const stock =
      Number(
        product?.stock
      );


    if (
      Number.isNaN(stock)
    ) {
      return 0;
    }


    return stock;

  };


  const getStockClass = (
    product
  ) => {

    const stock =
      getProductStock(
        product
      );


    if (stock <= 0) {
      return "stock-out";
    }


    if (stock <= 5) {
      return "stock-low";
    }


    return "stock-available";

  };


  const formatPrice = (
    price
  ) => {

    const value =
      Number(
        price || 0
      );


    return value.toLocaleString(
      "en-IN"
    );

  };


  const showNotification = (
    message
  ) => {

    setNotification(
      message
    );


    window.setTimeout(
      () => {

        setNotification("");

      },
      2500
    );

  };


  /* =================================================
     LOCAL STORAGE
  ================================================= */

  useEffect(() => {

    localStorage.setItem(
      "shopmind-cart",
      JSON.stringify(cart)
    );

  }, [cart]);


  useEffect(() => {

    localStorage.setItem(
      "shopmind-wishlist",
      JSON.stringify(
        wishlist
      )
    );

  }, [wishlist]);


  useEffect(() => {

    localStorage.setItem(
      "shopmind-recently-viewed",
      JSON.stringify(
        recentlyViewed
      )
    );

  }, [recentlyViewed]);


  useEffect(() => {

    if (user) {

      localStorage.setItem(
        "shopmind-user",
        JSON.stringify(user)
      );

    } else {

      localStorage.removeItem(
        "shopmind-user"
      );

    }

  }, [user]);


  /* =================================================
     LOAD CURRENT USER
  ================================================= */

  useEffect(() => {

    if (!token) {

      setUser(null);

      localStorage.removeItem(
        "shopmind-user"
      );

      return;
    }


    const loadCurrentUser =
      async () => {

        try {

          const response =
            await fetch(
              `${API_URL}/api/auth/profile`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          if (!response.ok) {

            throw new Error(
              "Could not load user."
            );

          }


          const data =
            await response.json();


          const currentUser =
            data.user ||
            data;


          setUser(
            currentUser
          );


          localStorage.setItem(
            "shopmind-user",
            JSON.stringify(
              currentUser
            )
          );

        } catch (error) {

          console.error(
            "User load error:",
            error
          );


          const savedUser =
            localStorage.getItem(
              "shopmind-user"
            );


          if (!savedUser) {

            localStorage.removeItem(
              "token"
            );

            setToken("");

            setUser(null);

          }

        }

      };


    loadCurrentUser();

  }, [token]);


  /* =================================================
     LOAD PRODUCTS
  ================================================= */

  const loadProducts =
    async () => {

      try {

        setLoading(true);

        setError("");


        const response =
          await fetch(
            `${API_URL}/api/products`
          );


        if (!response.ok) {

          throw new Error(
            "Unable to load products."
          );

        }


        const data =
          await response.json();


        const productList =
          Array.isArray(data)
            ? data
            : data.products || [];


        setProducts(
          productList
        );

      } catch (error) {

        console.error(
          "Product loading error:",
          error
        );


        setError(
          "Unable to load products. Please make sure the backend server is running."
        );

      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    loadProducts();

  }, []);


  /* =================================================
     AUTH SUCCESS
  ================================================= */

  const handleAuthSuccess = (
    authData
  ) => {

    console.log(
      "Authentication successful:",
      authData
    );


    const newToken =
      authData?.token ||
      authData?.accessToken ||
      "";


    const newUser =
      authData?.user ||
      authData?.data?.user ||
      null;


    if (newToken) {

      localStorage.setItem(
        "token",
        newToken
      );

      setToken(
        newToken
      );

    }


    if (newUser) {

      setUser(
        newUser
      );


      localStorage.setItem(
        "shopmind-user",
        JSON.stringify(
          newUser
        )
      );

    }


    setShowLogin(false);

    setShowAuth(false);


    showNotification(
      `Welcome ${
        newUser?.name ||
        newUser?.username ||
        "back"
      }!`
    );

  };


  /* =================================================
     LOGOUT
  ================================================= */

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "shopmind-user"
    );


    setToken("");

    setUser(null);


    setShowLogin(false);

    setShowAuth(false);

    setShowCart(false);

    setShowCheckout(false);

    setShowOrders(false);

    setShowWishlist(false);

    setShowCompare(false);


    setShowAdminDashboard(
      false
    );

    setShowAdminPanel(
      false
    );

    setShowAdminOrders(
      false
    );


    showNotification(
      "Logged out successfully."
    );

  };


  /* =================================================
     PRODUCT DETAILS
  ================================================= */

  const openProduct = (
    product
  ) => {

    if (!product) {
      return;
    }


    setSelectedProduct(
      product
    );


    setRecentlyViewed(
      (current) => {

        const productId =
          getProductId(
            product
          );


        const filtered =
          current.filter(
            (item) =>
              getProductId(
                item
              ) !== productId
          );


        return [
          product,
          ...filtered,
        ].slice(
          0,
          8
        );

      }
    );

  };


  const closeProduct = () => {

    setSelectedProduct(
      null
    );

  };
    /* =================================================
     CART HELPERS
  ================================================= */

  const addToCart = (product) => {
    if (!product) {
      return;
    }

    const stock =
      getProductStock(product);

    if (stock <= 0) {
      showNotification(
        "This product is out of stock."
      );

      return;
    }

    const productId =
      getProductId(product);

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            getProductId(item) ===
            productId
        );

      if (existingItem) {
        const currentQuantity =
          Number(
            existingItem.quantity || 1
          );

        if (
          currentQuantity >= stock
        ) {
          showNotification(
            "Maximum available stock reached."
          );

          return currentCart;
        }

        return currentCart.map(
          (item) =>
            getProductId(item) ===
            productId
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

    showNotification(
      `${product.name} added to cart.`
    );
  };


  const increaseCartItem = (
    productId
  ) => {
    setCart((currentCart) =>
      currentCart.map(
        (item) => {
          if (
            getProductId(item) !==
            productId
          ) {
            return item;
          }

          const stock =
            getProductStock(item);

          const quantity =
            Number(
              item.quantity || 1
            );

          if (
            quantity >= stock
          ) {
            showNotification(
              "Maximum available stock reached."
            );

            return item;
          }

          return {
            ...item,
            quantity:
              quantity + 1,
          };
        }
      )
    );
  };


  const decreaseCartItem = (
    productId
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (
            getProductId(item) !==
            productId
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              Number(
                item.quantity || 1
              ) - 1,
          };
        })
        .filter(
          (item) =>
            Number(
              item.quantity || 0
            ) > 0
        )
    );
  };


  const removeCartItem = (
    productId
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          getProductId(item) !==
          productId
      )
    );

    showNotification(
      "Product removed from cart."
    );
  };


  const clearCart = () => {
    setCart([]);

    showNotification(
      "Cart cleared."
    );
  };


  /* =================================================
     CHECKOUT
  ================================================= */

  const handleCheckout = () => {
    if (cart.length === 0) {
      showNotification(
        "Your cart is empty."
      );

      return;
    }

    if (!user || !token) {
      setShowCart(false);

      setShowAuth(true);

      showNotification(
        "Please login before checkout."
      );

      return;
    }

    setShowCart(false);

    setShowCheckout(true);
  };


  const handleOrderSuccess = () => {
    setCart([]);

    setShowCheckout(false);

    showNotification(
      "Order placed successfully."
    );

    loadProducts();
  };


  /* =================================================
     WISHLIST
  ================================================= */

  const isWishlisted = (
    productId
  ) => {
    return wishlist.some(
      (item) =>
        getProductId(item) ===
        productId
    );
  };


  const toggleWishlist = (
    product
  ) => {
    if (!product) {
      return;
    }

    const productId =
      getProductId(product);

    setWishlist(
      (currentWishlist) => {
        const exists =
          currentWishlist.some(
            (item) =>
              getProductId(item) ===
              productId
          );

        if (exists) {
          showNotification(
            `${product.name} removed from wishlist.`
          );

          return currentWishlist.filter(
            (item) =>
              getProductId(item) !==
              productId
          );
        }

        showNotification(
          `${product.name} added to wishlist.`
        );

        return [
          ...currentWishlist,
          product,
        ];
      }
    );
  };


  /* =================================================
     COMPARE
  ================================================= */

  const toggleCompare = (
    product
  ) => {
    if (!product) {
      return;
    }

    const productId =
      getProductId(product);

    setCompareProducts(
      (current) => {
        const exists =
          current.some(
            (item) =>
              getProductId(item) ===
              productId
          );

        if (exists) {
          showNotification(
            `${product.name} removed from compare.`
          );

          return current.filter(
            (item) =>
              getProductId(item) !==
              productId
          );
        }

        if (
          current.length >= 4
        ) {
          showNotification(
            "You can compare up to 4 products."
          );

          return current;
        }

        showNotification(
          `${product.name} added to compare.`
        );

        return [
          ...current,
          product,
        ];
      }
    );
  };


  const isComparing = (
    product
  ) => {
    const productId =
      getProductId(product);

    return compareProducts.some(
      (item) =>
        getProductId(item) ===
        productId
    );
  };


  /* =================================================
     ADMIN PRODUCT CALLBACKS
  ================================================= */

  const handleProductAdded = (
    product
  ) => {
    if (product) {
      setProducts(
        (currentProducts) => [
          product,
          ...currentProducts,
        ]
      );
    } else {
      loadProducts();
    }

    showNotification(
      "Product added successfully."
    );
  };


  const handleProductUpdated = (
    updatedProduct
  ) => {
    if (!updatedProduct) {
      loadProducts();

      return;
    }

    const updatedId =
      getProductId(
        updatedProduct
      );


    setProducts(
      (currentProducts) =>
        currentProducts.map(
          (product) =>
            getProductId(
              product
            ) === updatedId
              ? updatedProduct
              : product
        )
    );


    setCart(
      (currentCart) =>
        currentCart.map(
          (product) =>
            getProductId(
              product
            ) === updatedId
              ? {
                  ...updatedProduct,
                  quantity:
                    product.quantity ||
                    1,
                }
              : product
        )
    );


    setWishlist(
      (currentWishlist) =>
        currentWishlist.map(
          (product) =>
            getProductId(
              product
            ) === updatedId
              ? updatedProduct
              : product
        )
    );


    setCompareProducts(
      (current) =>
        current.map(
          (product) =>
            getProductId(
              product
            ) === updatedId
              ? updatedProduct
              : product
        )
    );


    if (
      selectedProduct &&
      getProductId(
        selectedProduct
      ) === updatedId
    ) {
      setSelectedProduct(
        updatedProduct
      );
    }


    showNotification(
      "Product updated successfully."
    );
  };


  const handleProductDeleted = (
    deletedProduct
  ) => {
    const deletedId =
      typeof deletedProduct ===
      "object"
        ? getProductId(
            deletedProduct
          )
        : deletedProduct;


    if (!deletedId) {
      loadProducts();

      return;
    }


    setProducts(
      (currentProducts) =>
        currentProducts.filter(
          (product) =>
            getProductId(
              product
            ) !== deletedId
        )
    );


    setCart(
      (currentCart) =>
        currentCart.filter(
          (product) =>
            getProductId(
              product
            ) !== deletedId
        )
    );


    setWishlist(
      (currentWishlist) =>
        currentWishlist.filter(
          (product) =>
            getProductId(
              product
            ) !== deletedId
        )
    );


    setCompareProducts(
      (current) =>
        current.filter(
          (product) =>
            getProductId(
              product
            ) !== deletedId
        )
    );


    setRecentlyViewed(
      (current) =>
        current.filter(
          (product) =>
            getProductId(
              product
            ) !== deletedId
        )
    );


    if (
      selectedProduct &&
      getProductId(
        selectedProduct
      ) === deletedId
    ) {
      setSelectedProduct(
        null
      );
    }


    showNotification(
      "Product deleted successfully."
    );
  };


  /* =================================================
     DERIVED VALUES
  ================================================= */

  const categories =
    useMemo(() => {
      const values =
        products
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean);

      return [
        "All",
        ...Array.from(
          new Set(values)
        ),
      ];
    }, [products]);


  const filteredProducts =
    useMemo(() => {
      let result = [
        ...products,
      ];


      const normalizedSearch =
        search
          .trim()
          .toLowerCase();


      /* SEARCH */

      if (normalizedSearch) {
        result =
          result.filter(
            (product) => {
              const searchable =
                [
                  product.name,
                  product.category,
                  product.description,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();

              return searchable.includes(
                normalizedSearch
              );
            }
          );
      }


      /* CATEGORY */

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


      /* LOW TO HIGH */

      if (
        sortOption ===
        "price-low"
      ) {
        result.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );
      }


      /* HIGH TO LOW */

      if (
        sortOption ===
        "price-high"
      ) {
        result.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );
      }


      /* RATING */

      if (
        sortOption ===
        "rating"
      ) {
        result.sort(
          (a, b) =>
            Number(
              b.rating || 0
            ) -
            Number(
              a.rating || 0
            )
        );
      }


      /* NAME */

      if (
        sortOption ===
        "name"
      ) {
        result.sort(
          (a, b) =>
            String(
              a.name || ""
            ).localeCompare(
              String(
                b.name || ""
              )
            )
        );
      }


      return result;

    }, [
      products,
      search,
      selectedCategory,
      sortOption,
    ]);


  /* =================================================
     CART COUNT
  ================================================= */

  const cartCount =
    useMemo(() => {
      return cart.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity || 1
          ),
        0
      );
    }, [cart]);


  /* =================================================
     WISHLIST COUNT
  ================================================= */

  const wishlistCount =
    wishlist.length;


  /* =================================================
     SCROLL HELPER
  ================================================= */

  const scrollToSection = (
    sectionId
  ) => {
    const element =
      document.getElementById(
        sectionId
      );

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  };


  /* =================================================
     SCROLL REVEAL ANIMATION
  ================================================= */

  useEffect(() => {
    const revealElements =
      document.querySelectorAll(
        ".scroll-reveal"
      );


    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target.classList.add(
                  "show"
                );

                observer.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: 0.12,

          rootMargin:
            "0px 0px -40px 0px",
        }
      );


    revealElements.forEach(
      (element) => {
        observer.observe(
          element
        );
      }
    );


    return () => {
      observer.disconnect();
    };

  }, [
    products,
    showAIAssistant,
    recentlyViewed,
  ]);


  /* =================================================
     MAIN UI
  ================================================= */

  return (
    <div className="app">

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
            {/* =================================================
          NAVBAR
      ================================================= */}

      <nav
        className={`navbar ${
          navbarScrolled
            ? "navbar-scrolled"
            : ""
        }`}
      >

        {/* =================================================
            BRAND
        ================================================= */}

        <div
          className="brand"
          onClick={() =>
            scrollToSection("home")
          }
        >

          <span className="brand-icon">
            🛍️
          </span>

          <div className="brand-text">

            <h1>
              ShopMind AI
            </h1>

            <p>
              Smart Shopping Assistant
            </p>

          </div>

        </div>


        {/* =================================================
            NAVIGATION LINKS
        ================================================= */}

        <div className="nav-links">

          <button
            type="button"
            className="nav-link-btn"
            onClick={() =>
              scrollToSection("home")
            }
          >
            <span>
              Home
            </span>
          </button>


          <button
            type="button"
            className="nav-link-btn"
            onClick={() =>
              scrollToSection(
                "products"
              )
            }
          >
            <span>
              Products
            </span>
          </button>


          <button
            type="button"
            className="nav-link-btn ai-nav-link"
            onClick={() => {

              setShowAIAssistant(
                true
              );

              window.setTimeout(
                () => {
                  scrollToSection(
                    "ai-shopping"
                  );
                },
                100
              );

            }}
          >

            <span className="nav-link-icon">
              🤖
            </span>

            <span>
              AI Search
            </span>

          </button>


          <button
            type="button"
            className="nav-link-btn wishlist-nav-link"
            onClick={() =>
              setShowWishlist(true)
            }
          >

            <span className="nav-link-icon">
              ❤️
            </span>

            <span>
              Wishlist
            </span>

            {wishlistCount > 0 && (
              <span className="nav-count">
                {wishlistCount}
              </span>
            )}

          </button>


          <button
            type="button"
            className="nav-link-btn cart-nav-link"
            onClick={() =>
              setShowCart(true)
            }
          >

            <span className="nav-link-icon">
              🛒
            </span>

            <span>
              Cart
            </span>

            {cartCount > 0 && (
              <span className="nav-count">
                {cartCount}
              </span>
            )}

          </button>

        </div>


        {/* =================================================
            LOGIN / USER AREA
        ================================================= */}

        <div className="nav-actions">

          {user ? (
            <>

              {/* USER INFORMATION */}

              <div className="user-info">

                <span className="user-avatar">
                  👤
                </span>

                <div className="user-details">

                  <strong>
                    {user.name ||
                      user.username ||
                      "User"}
                  </strong>

                  {user.email && (
                    <small>
                      {user.email}
                    </small>
                  )}

                </div>

              </div>


              {/* ORDERS */}

              <button
                type="button"
                className="orders-nav-btn animated-nav-action"
                onClick={() =>
                  setShowOrders(true)
                }
              >

                <span>
                  📦
                </span>

                Orders

              </button>


              {/* =================================================
                  ADMIN BUTTONS
              ================================================= */}

              {user?.role ===
                "admin" && (

                <div className="admin-nav-actions">

                  <button
                    type="button"
                    className="animated-nav-action"
                    onClick={() =>
                      setShowAdminDashboard(
                        true
                      )
                    }
                  >

                    <span>
                      📊
                    </span>

                    Dashboard

                  </button>


                  <button
                    type="button"
                    className="animated-nav-action"
                    onClick={() =>
                      setShowAdminPanel(
                        true
                      )
                    }
                  >

                    <span>
                      ⚙️
                    </span>

                    Products

                  </button>


                  <button
                    type="button"
                    className="animated-nav-action"
                    onClick={() =>
                      setShowAdminOrders(
                        true
                      )
                    }
                  >

                    <span>
                      📋
                    </span>

                    Admin Orders

                  </button>

                </div>

              )}


              {/* LOGOUT */}

              <button
                type="button"
                className="logout-btn animated-nav-action"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>

            </>
          ) : (

            /* LOGIN */

            <button
              type="button"
              className="login-btn animated-nav-action"
              onClick={() =>
                setShowAuth(true)
              }
            >

              <span>
                👤
              </span>

              Login

            </button>

          )}

        </div>

      </nav>


      {/* =================================================
          HERO SECTION
      ================================================= */}

      <section
        id="home"
        className="hero"
      >

        {/* HERO LEFT SIDE */}

        <div className="hero-content">

          <span className="hero-badge">
            ✨ AI-Powered Shopping
          </span>


          <h2>

            Find the Perfect Product

            <span>
              {" "}
              with ShopMind AI
            </span>

          </h2>


          <p>
            Search smarter, compare
            products, discover personalized
            recommendations and shop with
            confidence.
          </p>


          {/* =================================================
              HERO SEARCH
          ================================================= */}

          <div className="hero-search">

            <span className="search-icon">
              🔎
            </span>


            <input
              type="text"
              value={search}
              placeholder="Search laptops, smartphones, headphones..."
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              onKeyDown={(
                event
              ) => {

                if (
                  event.key ===
                  "Enter"
                ) {

                  scrollToSection(
                    "products"
                  );

                }

              }}
            />


            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "products"
                )
              }
            >
              Search
            </button>

          </div>


          {/* =================================================
              HERO BUTTONS
          ================================================= */}

          <div className="hero-actions">

            <button
              type="button"
              className="primary-btn"
              onClick={() =>
                scrollToSection(
                  "products"
                )
              }
            >
              🛍️ Explore Products
            </button>


            <button
              type="button"
              className="secondary-btn"
              onClick={() => {

                setShowAIAssistant(
                  true
                );


                window.setTimeout(
                  () => {

                    scrollToSection(
                      "ai-shopping"
                    );

                  },
                  100
                );

              }}
            >
              🤖 Ask AI Assistant
            </button>

          </div>


          {/* =================================================
              HERO FEATURES
          ================================================= */}

          <div className="hero-features">

            <div>

              <span>
                🤖
              </span>

              <p>

                <strong>
                  AI Recommendations
                </strong>

                <small>
                  Find products that
                  match your needs.
                </small>

              </p>

            </div>


            <div>

              <span>
                ⚖️
              </span>

              <p>

                <strong>
                  Easy Comparison
                </strong>

                <small>
                  Compare your favorite
                  products.
                </small>

              </p>

            </div>


            <div>

              <span>
                🔒
              </span>

              <p>

                <strong>
                  Smart Shopping
                </strong>

                <small>
                  Simple, fast and
                  convenient.
                </small>

              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            HERO RIGHT SIDE
        ================================================= */}

        <div className="hero-visual">

          <div className="hero-card hero-card-main">

            <span className="hero-card-icon">
              🛍️
            </span>


            <h3>
              Your Personal Shopping
              Assistant
            </h3>


            <p>
              Tell ShopMind what you need
              and discover suitable
              products.
            </p>


            <button
              type="button"
              onClick={() => {

                setShowAIAssistant(
                  true
                );


                window.setTimeout(
                  () => {

                    scrollToSection(
                      "ai-shopping"
                    );

                  },
                  100
                );

              }}
            >
              Try AI Search →
            </button>

          </div>


          {/* FLOATING CARDS */}

          <div className="floating-card floating-card-one">
            ⭐ Top Rated
          </div>


          <div className="floating-card floating-card-two">
            💰 Best Value
          </div>


          <div className="floating-card floating-card-three">
            ✓ In Stock
          </div>

        </div>

      </section>


      {/* =================================================
          AI SHOPPING ASSISTANT
      ================================================= */}

      {showAIAssistant && (

        <section
          id="ai-shopping"
          className="ai-section scroll-reveal"
        >

          <div className="section-heading">

            <div>

              <span className="section-label">
                SHOPMIND AI
              </span>


              <h2>
                🤖 AI Shopping Assistant
              </h2>


              <p>
                Describe what you are
                looking for and let
                ShopMind help you discover
                suitable products.
              </p>

            </div>


            <button
              type="button"
              className="close-ai-btn"
              onClick={() =>
                setShowAIAssistant(
                  false
                )
              }
            >
              ✕ Close
            </button>

          </div>


          <AIShoppingAssistant
            products={products}
            onViewProduct={
              openProduct
            }
            onAddToCart={
              addToCart
            }
          />

        </section>

      )}


      {/* =================================================
          PRODUCTS SECTION
          CONTINUES IN PART 4
      ================================================= */}
            {/* =================================================
          PRODUCTS SECTION
      ================================================= */}

      <section
        id="products"
        className="products-section scroll-reveal"
      >

        <div className="section-heading">

          <div>

            <span className="section-label">
              OUR PRODUCTS
            </span>

            <h2>
              Discover Products
            </h2>

            <p>
              Browse products, compare
              options and add your
              favorites to your cart.
            </p>

          </div>


          <div className="products-count">
            {filteredProducts.length}{" "}
            products
          </div>

        </div>


        {/* =================================================
            SEARCH / FILTER / SORT
        ================================================= */}

        <div className="products-toolbar">

          <div className="product-search-box">

            <span>
              🔎
            </span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />


            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                ✕
              </button>

            )}

          </div>


          {/* CATEGORY FILTER */}

          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(
                event.target.value
              )
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


          {/* SORT */}

          <select
            value={sortOption}
            onChange={(event) =>
              setSortOption(
                event.target.value
              )
            }
          >

            <option value="default">
              Sort: Default
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating">
              Highest Rating
            </option>

            <option value="name">
              Name: A-Z
            </option>

          </select>


          {/* CLEAR FILTERS */}

          {(search ||
            selectedCategory !==
              "All" ||
            sortOption !==
              "default") && (

            <button
              type="button"
              className="clear-filter-btn"
              onClick={() => {

                setSearch("");

                setSelectedCategory(
                  "All"
                );

                setSortOption(
                  "default"
                );

              }}
            >
              Clear
            </button>

          )}

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="products-status">

            <div className="loading-spinner">
              ⏳
            </div>

            <h3>
              Loading products...
            </h3>

            <p>
              Please wait while ShopMind
              loads the product catalog.
            </p>

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (

          <div className="products-status error-state">

            <span>
              ⚠️
            </span>

            <h3>
              Unable to load products
            </h3>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadProducts
              }
            >
              Try Again
            </button>

          </div>

        )}


        {/* =================================================
            NO PRODUCTS
        ================================================= */}

        {!loading &&
          !error &&
          filteredProducts.length ===
            0 && (

            <div className="products-status">

              <span>
                🔍
              </span>

              <h3>
                No products found
              </h3>

              <p>
                Try another search or
                category.
              </p>

              <button
                type="button"
                onClick={() => {

                  setSearch("");

                  setSelectedCategory(
                    "All"
                  );

                  setSortOption(
                    "default"
                  );

                }}
              >
                Show All Products
              </button>

            </div>

          )}


        {/* =================================================
            PRODUCT GRID
        ================================================= */}

        {!loading &&
          !error &&
          filteredProducts.length >
            0 && (

            <div className="products-grid">

              {filteredProducts.map(
                (
                  product,
                  index
                ) => {

                  const productId =
                    getProductId(
                      product
                    );


                  const stock =
                    getProductStock(
                      product
                    );


                  const outOfStock =
                    stock <= 0;


                  const wishlisted =
                    isWishlisted(
                      productId
                    );


                  const comparing =
                    isComparing(
                      product
                    );


                  return (

                    <article
                      className="product-card scroll-reveal"
                      key={productId}
                      style={{
                        transitionDelay:
                          `${
                            Math.min(
                              index,
                              7
                            ) * 70
                          }ms`,
                      }}
                    >

                      {/* =====================================
                          PRODUCT IMAGE
                      ===================================== */}

                      <div className="product-image-area">

                        {product.image ? (

                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="product-image"
                            onError={(
                              event
                            ) => {

                              event.currentTarget.style.display =
                                "none";


                              const fallback =
                                event
                                  .currentTarget
                                  .nextElementSibling;


                              if (
                                fallback
                              ) {

                                fallback.style.display =
                                  "flex";

                              }

                            }}
                          />

                        ) : null}


                        {/* IMAGE FALLBACK */}

                        <div
                          className="product-image-fallback"
                          style={{
                            display:
                              product.image
                                ? "none"
                                : "flex",
                          }}
                        >

                          <span>
                            {product.icon ||
                              "🛍️"}
                          </span>

                        </div>


                        {/* =====================================
                            WISHLIST
                        ===================================== */}

                        <button
                          type="button"
                          className={`product-wishlist-btn ${
                            wishlisted
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleWishlist(
                              product
                            )
                          }
                          title={
                            wishlisted
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >

                          {wishlisted
                            ? "❤️"
                            : "🤍"}

                        </button>


                        {/* =====================================
                            STOCK BADGE
                        ===================================== */}

                        <span
                          className={`product-stock-badge ${getStockClass(
                            product
                          )}`}
                        >

                          {outOfStock
                            ? "Out of Stock"
                            : stock <= 5
                            ? `Only ${stock} left`
                            : "In Stock"}

                        </span>

                      </div>


                      {/* =====================================
                          PRODUCT CONTENT
                      ===================================== */}

                      <div className="product-card-content">

                        <span className="product-category">

                          {product.category ||
                            "Product"}

                        </span>


                        <h3>
                          {product.name}
                        </h3>


                        {/* RATING */}

                        <div className="product-rating">

                          <span>
                            ⭐
                          </span>

                          <strong>
                            {Number(
                              product.rating ||
                                0
                            ).toFixed(
                              1
                            )}
                          </strong>

                        </div>


                        {/* DESCRIPTION */}

                        <p className="product-description">

                          {product.description ||
                            "Discover this product from ShopMind AI."}

                        </p>


                        {/* PRICE */}

                        <div className="product-price">

                          ₹
                          {formatPrice(
                            product.price
                          )}

                        </div>


                        {/* STOCK */}

                        <p
                          className={`product-stock-text ${getStockClass(
                            product
                          )}`}
                        >

                          {outOfStock
                            ? "Currently unavailable"
                            : `${stock} units available`}

                        </p>


                        {/* =====================================
                            PRODUCT ACTIONS
                        ===================================== */}

                        <div className="product-actions">

                          <button
                            type="button"
                            className="view-btn"
                            onClick={() =>
                              openProduct(
                                product
                              )
                            }
                          >
                            👁️ View
                          </button>


                          <button
                            type="button"
                            className="add-cart-btn"
                            onClick={() =>
                              addToCart(
                                product
                              )
                            }
                            disabled={
                              outOfStock
                            }
                          >

                            {outOfStock
                              ? "Out of Stock"
                              : "🛒 Add to Cart"}

                          </button>

                        </div>


                        {/* =====================================
                            COMPARE
                        ===================================== */}

                        <button
                          type="button"
                          className={`compare-btn ${
                            comparing
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleCompare(
                              product
                            )
                          }
                        >

                          {comparing
                            ? "✓ Added to Compare"
                            : "⚖️ Compare"}

                        </button>

                      </div>

                    </article>

                  );

                }
              )}

            </div>

          )}

      </section>


      {/* =================================================
          COMPARE BAR
      ================================================= */}

      {compareProducts.length >
        0 && (

        <section className="compare-bar">

          <div className="compare-bar-info">

            <span>
              ⚖️
            </span>

            <div>

              <strong>
                Compare Products
              </strong>

              <small>

                {
                  compareProducts.length
                }{" "}

                product

                {compareProducts.length !==
                1
                  ? "s"
                  : ""}{" "}

                selected

              </small>

            </div>

          </div>


          {/* SELECTED PRODUCTS */}

          <div className="compare-bar-products">

            {compareProducts.map(
              (product) => (

                <div
                  key={getProductId(
                    product
                  )}
                  className="compare-mini-product"
                >

                  {product.image ? (

                    <img
                      src={
                        product.image
                      }
                      alt={
                        product.name
                      }
                    />

                  ) : (

                    <span>
                      {product.icon ||
                        "🛍️"}
                    </span>

                  )}


                  <span>
                    {product.name}
                  </span>


                  <button
                    type="button"
                    onClick={() =>
                      toggleCompare(
                        product
                      )
                    }
                  >
                    ✕
                  </button>

                </div>

              )
            )}

          </div>


          {/* COMPARE ACTIONS */}

          <div className="compare-bar-actions">

            <button
              type="button"
              onClick={() =>
                setCompareProducts(
                  []
                )
              }
            >
              Clear
            </button>


            <button
              type="button"
              className="primary-btn"
              onClick={() =>
                setShowCompare(
                  true
                )
              }
              disabled={
                compareProducts.length <
                2
              }
            >
              Compare Now
            </button>

          </div>

        </section>

      )}


      {/* =================================================
          RECOMMENDED PRODUCTS

          IMPORTANT:
          This is the ONLY Recommended Products section.
          The duplicate from the old App.jsx is removed.
      ================================================= */}

      {products.length > 0 && (

        <section
          className="recommendations-section scroll-reveal"
        >

          <div className="section-heading">

            <div className="recommendations-heading-content">

              <span className="section-label">
                FOR YOU
              </span>


              <h2>

                <span className="recommendations-sparkle">
                  ✨
                </span>

                {" "}

                Recommended Products

              </h2>


              <p>
                More products you may
                want to explore.
              </p>

            </div>

          </div>


          <div className="recommendations-content">

            <RecommendedProducts
              products={products}
              cart={cart}
              wishlist={wishlist}
              recentlyViewed={
                recentlyViewed
              }
              onViewProduct={
                openProduct
              }
              onAddToCart={
                addToCart
              }
              onToggleWishlist={
                toggleWishlist
              }
            />

          </div>

        </section>

      )}


      {/* =================================================
          REMAINING APP CONTINUES IN PART 5
      ================================================= */}
            {/* =================================================
          PRODUCT DETAILS MODAL
      ================================================= */}

      {selectedProduct && (

        <div
          className="modal-overlay"
          onClick={
            closeProduct
          }
        >

          <div
            className="product-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="modal-close-btn"
              onClick={
                closeProduct
              }
            >
              ✕
            </button>


            {/* =================================================
                PRODUCT IMAGE
            ================================================= */}

            <div className="product-modal-image">

              {selectedProduct.image ? (

                <img
                  src={
                    selectedProduct.image
                  }
                  alt={
                    selectedProduct.name
                  }
                  onError={(
                    event
                  ) => {

                    event.currentTarget.style.display =
                      "none";


                    const fallback =
                      event
                        .currentTarget
                        .nextElementSibling;


                    if (
                      fallback
                    ) {

                      fallback.style.display =
                        "flex";

                    }

                  }}
                />

              ) : null}


              <div
                className="product-modal-image-fallback"
                style={{
                  display:
                    selectedProduct.image
                      ? "none"
                      : "flex",
                }}
              >

                <span>
                  {selectedProduct.icon ||
                    "🛍️"}
                </span>

              </div>

            </div>


            {/* =================================================
                PRODUCT DETAILS
            ================================================= */}

            <div className="product-modal-content">

              <span className="product-category">

                {selectedProduct.category ||
                  "Product"}

              </span>


              <h2>
                {selectedProduct.name}
              </h2>


              {/* RATING */}

              <div className="product-modal-rating">

                <span>
                  ⭐
                </span>

                <strong>

                  {Number(
                    selectedProduct.rating ||
                      0
                  ).toFixed(
                    1
                  )}

                  / 5

                </strong>

              </div>


              {/* PRICE */}

              <div className="product-modal-price">

                ₹
                {formatPrice(
                  selectedProduct.price
                )}

              </div>


              {/* STOCK */}

              <p
                className={`product-modal-stock ${getStockClass(
                  selectedProduct
                )}`}
              >

                {getProductStock(
                  selectedProduct
                ) <= 0
                  ? "🔴 Out of Stock"
                  : `🟢 In Stock (${getProductStock(
                      selectedProduct
                    )})`}

              </p>


              {/* =================================================
                  ABOUT PRODUCT
              ================================================= */}

              <div className="product-modal-about">

                <h3>
                  About this product
                </h3>


                <p>

                  {selectedProduct.description ||
                    "Product information is not available."}

                </p>


                <div className="product-detail-list">

                  {/* CATEGORY */}

                  <div>

                    <span>
                      Category
                    </span>

                    <strong>

                      {selectedProduct.category ||
                        "N/A"}

                    </strong>

                  </div>


                  {/* AVAILABILITY */}

                  <div>

                    <span>
                      Availability
                    </span>

                    <strong>

                      {getProductStock(
                        selectedProduct
                      ) > 0
                        ? `${getProductStock(
                            selectedProduct
                          )} available`
                        : "Out of stock"}

                    </strong>

                  </div>


                  {/* RATING */}

                  <div>

                    <span>
                      Rating
                    </span>

                    <strong>

                      ⭐{" "}

                      {Number(
                        selectedProduct.rating ||
                          0
                      ).toFixed(
                        1
                      )}

                    </strong>

                  </div>

                </div>

              </div>


              {/* =================================================
                  WISHLIST
              ================================================= */}

              <button
                type="button"
                className={`modal-wishlist-btn ${
                  isWishlisted(
                    getProductId(
                      selectedProduct
                    )
                  )
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  toggleWishlist(
                    selectedProduct
                  )
                }
              >

                {isWishlisted(
                  getProductId(
                    selectedProduct
                  )
                )
                  ? "❤️ Remove from Wishlist"
                  : "🤍 Wishlist"}

              </button>


              {/* =================================================
                  COMPARE
              ================================================= */}

              <button
                type="button"
                className={`compare-btn ${
                  isComparing(
                    selectedProduct
                  )
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  toggleCompare(
                    selectedProduct
                  )
                }
              >

                {isComparing(
                  selectedProduct
                )
                  ? "✓ Added to Compare"
                  : "⚖️ Compare"}

              </button>


              {/* =================================================
                  ADD TO CART
              ================================================= */}

              <button
                type="button"
                className="add-cart-btn product-modal-cart-btn"
                disabled={
                  getProductStock(
                    selectedProduct
                  ) <= 0
                }
                onClick={() =>
                  addToCart(
                    selectedProduct
                  )
                }
              >

                {getProductStock(
                  selectedProduct
                ) <= 0
                  ? "Out of Stock"
                  : "🛒 Add to Cart"}

              </button>


              {/* =================================================
                  REVIEWS
              ================================================= */}

              <div className="product-reviews-wrapper">

                <ReviewsSection
                  product={
                    selectedProduct
                  }
                  productId={
                    getProductId(
                      selectedProduct
                    )
                  }
                  user={user}
                  token={token}
                  apiUrl={
                    API_URL
                  }
                />

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          LOGIN MODAL
      ================================================= */}

      {showLogin && (

        <LoginModal
          isOpen={
            showLogin
          }
          onClose={() =>
            setShowLogin(
              false
            )
          }
          onLoginSuccess={
            handleAuthSuccess
          }
          onSwitchToRegister={() => {

            setShowLogin(
              false
            );

            setShowAuth(
              true
            );

          }}
          apiUrl={
            API_URL
          }
        />

      )}


      {/* =================================================
          AUTH MODAL
      ================================================= */}

      {showAuth && (

        <AuthModal
          isOpen={
            showAuth
          }
          onClose={() =>
            setShowAuth(
              false
            )
          }
          onAuthSuccess={
            handleAuthSuccess
          }
          onLoginSuccess={
            handleAuthSuccess
          }
          apiUrl={
            API_URL
          }
        />

      )}


      {/* =================================================
          CART MODAL
      ================================================= */}

      {showCart && (

        <CartModal
          isOpen={
            showCart
          }
          onClose={() =>
            setShowCart(
              false
            )
          }
          cart={
            cart
          }
          items={
            cart
          }
          onIncrease={
            increaseCartItem
          }
          onDecrease={
            decreaseCartItem
          }
          onRemove={
            removeCartItem
          }
          onRemoveItem={
            removeCartItem
          }
          onClear={
            clearCart
          }
          onClearCart={
            clearCart
          }
          onCheckout={
            handleCheckout
          }
          formatPrice={
            formatPrice
          }
        />

      )}


      {/* =================================================
          CHECKOUT MODAL
      ================================================= */}

      {showCheckout && (

        <CheckoutModal
          isOpen={
            showCheckout
          }
          onClose={() =>
            setShowCheckout(
              false
            )
          }
          cart={
            cart
          }
          items={
            cart
          }
          user={
            user
          }
          token={
            token
          }
          apiUrl={
            API_URL
          }
          onOrderSuccess={
            handleOrderSuccess
          }
          onSuccess={
            handleOrderSuccess
          }
        />

      )}


      {/* =================================================
          MY ORDERS
      ================================================= */}

      {showOrders && (

        <MyOrdersModal
          isOpen={
            showOrders
          }
          onClose={() =>
            setShowOrders(
              false
            )
          }
          user={
            user
          }
          token={
            token
          }
          apiUrl={
            API_URL
          }
        />

      )}


      {/* =================================================
          WISHLIST
      ================================================= */}

      {showWishlist && (

        <WishlistModal
          isOpen={
            showWishlist
          }
          onClose={() =>
            setShowWishlist(
              false
            )
          }
          wishlist={
            wishlist
          }
          products={
            wishlist
          }
          items={
            wishlist
          }
          onToggleWishlist={
            toggleWishlist
          }
          onRemove={
            toggleWishlist
          }
          onViewProduct={(
            product
          ) => {

            setShowWishlist(
              false
            );

            openProduct(
              product
            );

          }}
          onAddToCart={
            addToCart
          }
        />

      )}


      {/* =================================================
          PRODUCT COMPARISON MODAL
      ================================================= */}

      {showCompare && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowCompare(
              false
            )
          }
        >

          <div
            className="compare-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close-btn"
              onClick={() =>
                setShowCompare(
                  false
                )
              }
            >
              ✕
            </button>


            <ProductComparison
              products={
                compareProducts
              }
              onViewProduct={(
                product
              ) => {

                setShowCompare(
                  false
                );

                openProduct(
                  product
                );

              }}
              onAddToCart={
                addToCart
              }
            />

          </div>

        </div>

      )}


      {/* =================================================
          ADMIN DASHBOARD
      ================================================= */}

      {showAdminDashboard &&
        user?.role ===
          "admin" && (

          <div
            className="modal-overlay admin-overlay"
            onClick={() =>
              setShowAdminDashboard(
                false
              )
            }
          >

            <div
              className="admin-modal-container"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="modal-close-btn"
                onClick={() =>
                  setShowAdminDashboard(
                    false
                  )
                }
              >
                ✕
              </button>


              <AdminDashboard
                user={
                  user
                }
                token={
                  token
                }
                apiUrl={
                  API_URL
                }
                products={
                  products
                }
              />

            </div>

          </div>

        )}


      {/* =================================================
          ADMIN PRODUCT PANEL
      ================================================= */}

      {showAdminPanel &&
        user?.role ===
          "admin" && (

          <div
            className="modal-overlay admin-overlay"
            onClick={() =>
              setShowAdminPanel(
                false
              )
            }
          >

            <div
              className="admin-modal-container"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="modal-close-btn"
                onClick={() =>
                  setShowAdminPanel(
                    false
                  )
                }
              >
                ✕
              </button>


              <AdminPanel
                products={
                  products
                }
                token={
                  token
                }
                apiUrl={
                  API_URL
                }
                onProductAdded={
                  handleProductAdded
                }
                onProductUpdated={
                  handleProductUpdated
                }
                onProductDeleted={
                  handleProductDeleted
                }
                onRefresh={
                  loadProducts
                }
              />

            </div>

          </div>

        )}


           {/* =================================================
          ADMIN ORDERS
      ================================================= */}

      {showAdminOrders &&
        user?.role === "admin" && (

          <AdminOrders
            user={user}
            token={token}
            apiUrl={API_URL}
            onClose={() => {
              setShowAdminOrders(false);
            }}
          />

        )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div className="footer-content">

          {/* FOOTER BRAND */}

          <div className="footer-brand">

            <div className="footer-logo">

              <span>
                🛍️
              </span>

              <h3>
                ShopMind AI
              </h3>

            </div>


            <p>
              AI-powered shopping made
              simple.
            </p>

          </div>


          {/* FOOTER LINKS */}

          <div className="footer-links">

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "home"
                )
              }
            >
              Home
            </button>


            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "products"
                )
              }
            >
              Products
            </button>


            <button
              type="button"
              onClick={() => {

                setShowAIAssistant(
                  true
                );


                window.setTimeout(
                  () => {

                    scrollToSection(
                      "ai-shopping"
                    );

                  },
                  100
                );

              }}
            >
              AI Search
            </button>


            <button
              type="button"
              onClick={() =>
                setShowWishlist(
                  true
                )
              }
            >
              Wishlist
            </button>

          </div>

        </div>


        <p className="footer-copyright">
          © 2026 ShopMind AI. All
          rights reserved.
        </p>

      </footer>

    </div>
  );
}


export default App;