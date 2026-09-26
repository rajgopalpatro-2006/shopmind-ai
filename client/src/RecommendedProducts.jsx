function RecommendedProducts({
  products = [],
  recentlyViewed = [],
  wishlist = [],
  onViewProduct,
  onAddToCart,
}) {
  // ==========================================
  // FORMAT PRICE
  // ==========================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN");
  };

  // ==========================================
  // GET USER INTEREST CATEGORIES
  // ==========================================

  const interestCategories = [
    ...recentlyViewed.map((product) => product.category),
    ...wishlist.map((product) => product.category),
  ].filter(Boolean);

  // ==========================================
  // COUNT CATEGORY INTEREST
  // ==========================================

  const categoryScores = interestCategories.reduce(
    (scores, category) => {
      scores[category] = (scores[category] || 0) + 1;

      return scores;
    },
    {}
  );

  // ==========================================
  // IDS ALREADY VIEWED
  // ==========================================

  const viewedIds = new Set(
    recentlyViewed.map((product) => product._id)
  );

  // ==========================================
  // BUILD RECOMMENDATIONS
  // ==========================================

  const recommendedProducts = [...products]
    .map((product) => {
      let recommendationScore = 0;

      // User showed interest in this category
      recommendationScore +=
        (categoryScores[product.category] || 0) * 10;

      // Higher rated products get preference
      recommendationScore +=
        Number(product.rating || 0) * 2;

      // Available products get preference
      if (Number(product.stock || 0) > 0) {
        recommendationScore += 3;
      }

      // Products not already viewed get preference
      if (!viewedIds.has(product._id)) {
        recommendationScore += 5;
      }

      return {
        ...product,
        recommendationScore,
      };
    })
    .sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore
    )
    .slice(0, 4);

  // ==========================================
  // DON'T SHOW IF THERE ARE NO PRODUCTS
  // ==========================================

  if (recommendedProducts.length === 0) {
    return null;
  }

  // ==========================================
  // DETERMINE MESSAGE
  // ==========================================

  const personalized =
    recentlyViewed.length > 0 || wishlist.length > 0;

  return (
    <section
      className="recommended-section"
      id="recommended"
    >
      <div className="recommended-container">

        {/* HEADER */}

        <div className="recommended-header">

          <div>
            <span className="recommended-badge">
              ✨ SMART PICKS
            </span>

            <h2>
              🎯 Recommended For You
            </h2>

            <p>
              {personalized
                ? "Suggestions based on your recently viewed products, wishlist and ratings."
                : "Popular and highly rated products you may like."}
            </p>
          </div>

          {personalized && (
            <div className="recommendation-personalized-badge">
              🧠 Personalized
            </div>
          )}

        </div>

        {/* PRODUCT GRID */}

        <div className="recommended-grid">

          {recommendedProducts.map((product) => {
            const stock = Number(product.stock || 0);

            const soldOut = stock <= 0;

            return (
              <article
                className="recommended-card"
                key={product._id}
              >

                {/* PRODUCT ICON */}

                <div className="recommended-icon">

                  <span>
                    {product.icon || "🛍️"}
                  </span>

                  <div className="recommended-ai-badge">
                    AI Pick
                  </div>

                </div>

                {/* PRODUCT INFORMATION */}

                <div className="recommended-info">

                  <span className="recommended-category">
                    {product.category || "Product"}
                  </span>

                  <h3>
                    {product.name}
                  </h3>

                  {/* RATING */}

                  <div className="recommended-rating">
                    ⭐{" "}
                    {Number(
                      product.rating || 0
                    ).toFixed(1)}
                  </div>

                  {/* DESCRIPTION */}

                  <p className="recommended-description">
                    {product.description ||
                      "No description available."}
                  </p>

                  {/* PRICE */}

                  <div className="recommended-price">
                    ₹{formatPrice(product.price)}
                  </div>

                  {/* STOCK */}

                  <div
                    className={`recommended-stock ${
                      soldOut
                        ? "recommended-out-stock"
                        : stock <= 5
                          ? "recommended-low-stock"
                          : "recommended-in-stock"
                    }`}
                  >
                    {soldOut
                      ? "🔴 Out of Stock"
                      : stock <= 5
                        ? `🟠 Only ${stock} Left`
                        : `🟢 In Stock (${stock})`}
                  </div>

                  {/* WHY RECOMMENDED */}

                  <div className="why-recommended">

                    <span>
                      💡
                    </span>

                    <p>
                      {categoryScores[product.category]
                        ? `Recommended because you're interested in ${product.category} products.`
                        : Number(product.rating || 0) >= 4
                          ? "Recommended because customers rate this product highly."
                          : "Recommended based on available products in ShopMind AI."}
                    </p>

                  </div>

                  {/* BUTTONS */}

                  <div className="recommended-actions">

                    <button
                      type="button"
                      className="recommended-view-btn"
                      onClick={() =>
                        onViewProduct?.(product)
                      }
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      className="recommended-cart-btn"
                      disabled={soldOut}
                      onClick={() =>
                        onAddToCart?.(product)
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
          })}

        </div>

      </div>
    </section>
  );
}

export default RecommendedProducts;