import { useMemo, useState } from "react";

function AIShoppingAssistant({
  products = [],
  onViewProduct,
  onAddToCart,
}) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] =
    useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  // =====================================
  // FORMAT PRICE
  // =====================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-IN"
    );
  };

  // =====================================
  // EXTRACT BUDGET
  // =====================================

  const extractBudget = (text) => {
    const cleanedText = text
      .toLowerCase()
      .replace(/₹/g, "")
      .replace(/,/g, "");

    // Examples:
    // under 70000
    // below 1 lakh
    // less than 50000
    // budget 80000
    // upto 90000
    // up to 90000

    const lakhMatch = cleanedText.match(
      /(?:under|below|less than|upto|up to|budget(?: of)?|within)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/
    );

    if (lakhMatch) {
      return Math.round(
        Number(lakhMatch[1]) * 100000
      );
    }

    const thousandMatch = cleanedText.match(
      /(?:under|below|less than|upto|up to|budget(?: of)?|within)\s*(\d+(?:\.\d+)?)\s*k\b/
    );

    if (thousandMatch) {
      return Math.round(
        Number(thousandMatch[1]) * 1000
      );
    }

    const normalMatch = cleanedText.match(
      /(?:under|below|less than|upto|up to|budget(?: of)?|within)\s*(\d{3,})/
    );

    if (normalMatch) {
      return Number(normalMatch[1]);
    }

    return null;
  };

  // =====================================
  // DETECT CATEGORY
  // =====================================

  const detectCategory = (text) => {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("laptop") ||
      lowerText.includes("notebook")
    ) {
      return "Laptop";
    }

    if (
      lowerText.includes("phone") ||
      lowerText.includes("smartphone") ||
      lowerText.includes("mobile") ||
      lowerText.includes("iphone")
    ) {
      return "Smartphone";
    }

    if (
      lowerText.includes("headphone") ||
      lowerText.includes("headphones") ||
      lowerText.includes("earphone") ||
      lowerText.includes("earphones") ||
      lowerText.includes("headset")
    ) {
      return "Headphones";
    }

    if (
      lowerText.includes("watch") ||
      lowerText.includes("smartwatch")
    ) {
      return "Smartwatch";
    }

    return null;
  };

  // =====================================
  // DETECT INTENT
  // =====================================

  const detectIntent = (text) => {
    const lowerText = text.toLowerCase();

    const intent = {
      gaming: false,
      aiMl: false,
      cheap: false,
      best: false,
      premium: false,
      highlyRated: false,
    };

    if (
      lowerText.includes("gaming") ||
      lowerText.includes("game")
    ) {
      intent.gaming = true;
    }

    if (
      lowerText.includes("ai/ml") ||
      lowerText.includes("ai ml") ||
      lowerText.includes(
        "machine learning"
      ) ||
      lowerText.includes(
        "artificial intelligence"
      ) ||
      lowerText.includes("coding") ||
      lowerText.includes(
        "programming"
      )
    ) {
      intent.aiMl = true;
    }

    if (
      lowerText.includes("cheap") ||
      lowerText.includes("affordable") ||
      lowerText.includes("budget")
    ) {
      intent.cheap = true;
    }

    if (
      lowerText.includes("best") ||
      lowerText.includes("recommend") ||
      lowerText.includes(
        "recommended"
      )
    ) {
      intent.best = true;
    }

    if (
      lowerText.includes("premium") ||
      lowerText.includes("flagship")
    ) {
      intent.premium = true;
    }

    if (
      lowerText.includes(
        "highest rated"
      ) ||
      lowerText.includes(
        "best rated"
      ) ||
      lowerText.includes(
        "top rated"
      )
    ) {
      intent.highlyRated = true;
    }

    return intent;
  };

  // =====================================
  // PRODUCT SEARCHABLE TEXT
  // =====================================

  const getSearchableText = (product) => {
    return `
      ${product.name || ""}
      ${product.category || ""}
      ${product.description || ""}
    `.toLowerCase();
  };

  // =====================================
  // SCORE PRODUCT
  // =====================================

  const calculateScore = (
    product,
    text,
    category,
    budget,
    intent
  ) => {
    let score = 0;

    const searchable =
      getSearchableText(product);

    const productPrice =
      Number(product.price || 0);

    const productRating =
      Number(product.rating || 0);

    const productStock =
      Number(product.stock || 0);

    // -------------------------------------
    // CATEGORY
    // -------------------------------------

    if (
      category &&
      product.category
        ?.toLowerCase() ===
        category.toLowerCase()
    ) {
      score += 50;
    }

    // -------------------------------------
    // BUDGET
    // -------------------------------------

    if (budget !== null) {
      if (productPrice <= budget) {
        score += 35;

        // Give products close to the
        // budget a slightly better score.
        if (
          productPrice >=
          budget * 0.7
        ) {
          score += 10;
        }
      } else {
        score -= 100;
      }
    }

    // -------------------------------------
    // WORD MATCHING
    // -------------------------------------

    const ignoredWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "under",
      "below",
      "than",
      "need",
      "want",
      "show",
      "find",
      "give",
      "looking",
      "product",
      "products",
      "best",
      "good",
      "please",
      "recommend",
      "recommended",
      "budget",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[₹,./]/g, " ")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          !ignoredWords.has(word) &&
          !/^\d+$/.test(word)
      );

    words.forEach((word) => {
      if (
        searchable.includes(word)
      ) {
        score += 8;
      }
    });

    // -------------------------------------
    // GAMING
    // -------------------------------------

    if (intent.gaming) {
      if (
        searchable.includes("gaming") ||
        searchable.includes("game") ||
        searchable.includes("rog") ||
        searchable.includes("gpu") ||
        searchable.includes("rtx")
      ) {
        score += 30;
      }
    }

    // -------------------------------------
    // AI / ML / CODING
    // -------------------------------------

    if (intent.aiMl) {
      if (
        product.category
          ?.toLowerCase() ===
        "laptop"
      ) {
        score += 20;
      }

      if (
        searchable.includes("ai") ||
        searchable.includes(
          "machine learning"
        ) ||
        searchable.includes(
          "performance"
        ) ||
        searchable.includes(
          "gaming"
        ) ||
        searchable.includes("gpu") ||
        searchable.includes("rtx")
      ) {
        score += 20;
      }
    }

    // -------------------------------------
    // HIGH RATING
    // -------------------------------------

    score += productRating * 3;

    if (
      intent.highlyRated ||
      intent.best
    ) {
      score += productRating * 4;
    }

    // -------------------------------------
    // STOCK
    // -------------------------------------

    if (productStock <= 0) {
      score -= 200;
    } else {
      score += 10;
    }

    return score;
  };

  // =====================================
  // CREATE REASONS
  // =====================================

  const createReasons = (
    product,
    category,
    budget,
    intent
  ) => {
    const reasons = [];

    const price =
      Number(product.price || 0);

    const rating =
      Number(product.rating || 0);

    const stock =
      Number(product.stock || 0);

    const searchable =
      getSearchableText(product);

    if (
      category &&
      product.category
        ?.toLowerCase() ===
        category.toLowerCase()
    ) {
      reasons.push(
        `Matches your ${category.toLowerCase()} requirement`
      );
    }

    if (
      budget !== null &&
      price <= budget
    ) {
      reasons.push(
        `Within your ₹${formatPrice(
          budget
        )} budget`
      );
    }

    if (
      intent.gaming &&
      (
        searchable.includes("gaming") ||
        searchable.includes("rog") ||
        searchable.includes("gpu") ||
        searchable.includes("rtx")
      )
    ) {
      reasons.push(
        "Suitable for gaming and performance-focused use"
      );
    }

    if (
      intent.aiMl &&
      product.category
        ?.toLowerCase() ===
        "laptop"
    ) {
      reasons.push(
        "Relevant for AI/ML, coding and development workloads"
      );
    }

    if (rating >= 4) {
      reasons.push(
        `Strong ${rating.toFixed(
          1
        )}/5 rating`
      );
    }

    if (stock > 0) {
      reasons.push(
        `${stock} unit${
          stock === 1 ? "" : "s"
        } currently in stock`
      );
    }

    if (reasons.length === 0) {
      reasons.push(
        "Relevant to your search"
      );
    }

    return reasons.slice(0, 4);
  };

  // =====================================
  // RUN AI SEARCH
  // =====================================

  const handleSearch = (e) => {
    e.preventDefault();

    const text = query.trim();

    if (!text) {
      setMessage(
        "Tell me what you are looking for."
      );

      setResults([]);

      return;
    }

    if (products.length === 0) {
      setMessage(
        "Products are not available right now."
      );

      setResults([]);

      return;
    }

    const category =
      detectCategory(text);

    const budget =
      extractBudget(text);

    const intent =
      detectIntent(text);

    let scoredProducts =
      products.map((product) => ({
        ...product,

        aiScore: calculateScore(
          product,
          text,
          category,
          budget,
          intent
        ),
      }));

    // -------------------------------------
    // REMOVE OUT OF STOCK
    // -------------------------------------

    scoredProducts =
      scoredProducts.filter(
        (product) =>
          Number(
            product.stock || 0
          ) > 0
      );

    // -------------------------------------
    // CATEGORY FILTER
    // -------------------------------------

    if (category) {
      const categoryProducts =
        scoredProducts.filter(
          (product) =>
            product.category
              ?.toLowerCase() ===
            category.toLowerCase()
        );

      if (
        categoryProducts.length > 0
      ) {
        scoredProducts =
          categoryProducts;
      }
    }

    // -------------------------------------
    // BUDGET FILTER
    // -------------------------------------

    if (budget !== null) {
      scoredProducts =
        scoredProducts.filter(
          (product) =>
            Number(
              product.price || 0
            ) <= budget
        );
    }

    // -------------------------------------
    // SORT
    // -------------------------------------

    scoredProducts.sort(
      (a, b) => {
        if (
          intent.cheap &&
          !intent.best
        ) {
          return (
            Number(a.price || 0) -
            Number(b.price || 0)
          );
        }

        if (
          intent.highlyRated
        ) {
          return (
            Number(
              b.rating || 0
            ) -
            Number(
              a.rating || 0
            )
          );
        }

        return (
          b.aiScore -
          a.aiScore
        );
      }
    );

    const recommended =
      scoredProducts.slice(0, 4);

    setSubmittedQuery(text);

    setResults(recommended);

    if (
      recommended.length === 0
    ) {
      if (
        category &&
        budget !== null
      ) {
        setMessage(
          `I couldn't find an in-stock ${category.toLowerCase()} under ₹${formatPrice(
            budget
          )}. Try increasing your budget.`
        );
      } else {
        setMessage(
          "I couldn't find a suitable in-stock product for that request. Try changing your search."
        );
      }

      return;
    }

    if (
      category &&
      budget !== null
    ) {
      setMessage(
        `I found ${recommended.length} ${category.toLowerCase()} recommendation${
          recommended.length === 1
            ? ""
            : "s"
        } within your ₹${formatPrice(
          budget
        )} budget.`
      );

      return;
    }

    if (category) {
      setMessage(
        `Here ${
          recommended.length === 1
            ? "is"
            : "are"
        } ${recommended.length} ${category.toLowerCase()} recommendation${
          recommended.length === 1
            ? ""
            : "s"
        } for you.`
      );

      return;
    }

    setMessage(
      `I found ${recommended.length} product recommendation${
        recommended.length === 1
          ? ""
          : "s"
      } for you.`
    );
  };

  // =====================================
  // BEST RESULT
  // =====================================

  const bestProduct =
    useMemo(() => {
      if (
        results.length === 0
      ) {
        return null;
      }

      return results[0];
    }, [results]);

  // =====================================
  // CLEAR SEARCH
  // =====================================

  const clearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    setResults([]);
    setMessage("");
  };

  // =====================================
  // UI
  // =====================================

  return (
    <section
      className="ai-assistant-section"
      id="ai-assistant"
    >
      <div className="ai-assistant-container">

        {/* HEADER */}

        <div className="ai-assistant-header">

          <div className="ai-assistant-badge">
            ✨ SHOPMIND AI
          </div>

          <h2>
            Your AI Shopping Assistant
          </h2>

          <p>
            Tell me what you need,
            your budget and how you
            plan to use it.
          </p>

        </div>

        {/* SEARCH */}

        <form
          className="ai-assistant-search"
          onSubmit={handleSearch}
        >
          <div className="ai-assistant-input-wrap">

            <span>
              🤖
            </span>

            <input
              type="text"
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
              placeholder="Example: I need a gaming laptop under ₹1 lakh"
            />

          </div>

          <button
            type="submit"
            className="ai-assistant-search-btn"
          >
            ✨ Find for Me
          </button>

        </form>

        {/* EXAMPLES */}

        <div className="ai-example-queries">

          <span>
            Try:
          </span>

          <button
            type="button"
            onClick={() =>
              setQuery(
                "Laptop for AI/ML under ₹1 lakh"
              )
            }
          >
            AI/ML laptop
          </button>

          <button
            type="button"
            onClick={() =>
              setQuery(
                "Best smartphone under ₹2 lakh"
              )
            }
          >
            Best phone
          </button>

          <button
            type="button"
            onClick={() =>
              setQuery(
                "Gaming laptop under ₹1 lakh"
              )
            }
          >
            Gaming laptop
          </button>

          <button
            type="button"
            onClick={() =>
              setQuery(
                "Best rated headphones"
              )
            }
          >
            Headphones
          </button>

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="ai-assistant-message">

            <div className="ai-message-icon">
              🤖
            </div>

            <div>
              <strong>
                ShopMind AI
              </strong>

              <p>
                {message}
              </p>

              {submittedQuery && (
                <small>
                  Your request: "
                  {submittedQuery}"
                </small>
              )}
            </div>

          </div>
        )}

        {/* RESULTS */}

        {results.length > 0 && (
          <div className="ai-results">

            <div className="ai-results-heading">

              <div>
                <h3>
                  ✨ AI Recommendations
                </h3>

                <p>
                  Ranked using your
                  request, budget,
                  rating and
                  availability.
                </p>
              </div>

              <button
                type="button"
                className="ai-clear-btn"
                onClick={
                  clearSearch
                }
              >
                Clear
              </button>

            </div>

            <div className="ai-results-grid">

              {results.map(
                (product, index) => {
                  const reasons =
                    createReasons(
                      product,
                      detectCategory(
                        submittedQuery
                      ),
                      extractBudget(
                        submittedQuery
                      ),
                      detectIntent(
                        submittedQuery
                      )
                    );

                  const stock =
                    Number(
                      product.stock ||
                        0
                    );

                  return (
                    <article
                      className={`ai-result-card ${
                        index === 0
                          ? "ai-best-result"
                          : ""
                      }`}
                      key={
                        product._id
                      }
                    >

                      {/* BEST BADGE */}

                      {index === 0 && (
                        <div className="ai-best-badge">
                          🏆 Best Match
                        </div>
                      )}

                      {/* ICON */}

                      <div className="ai-result-icon">
                        {product.icon ||
                          "🛍️"}
                      </div>

                      {/* CATEGORY */}

                      <span className="ai-result-category">
                        {
                          product.category
                        }
                      </span>

                      {/* NAME */}

                      <h3>
                        {product.name}
                      </h3>

                      {/* RATING */}

                      <div className="ai-result-rating">
                        ⭐{" "}
                        {Number(
                          product.rating ||
                            0
                        ).toFixed(
                          1
                        )}
                      </div>

                      {/* PRICE */}

                      <div className="ai-result-price">
                        ₹
                        {formatPrice(
                          product.price
                        )}
                      </div>

                      {/* STOCK */}

                      <div
                        className={
                          stock <= 5
                            ? "ai-stock ai-stock-low"
                            : "ai-stock"
                        }
                      >
                        {stock <= 5
                          ? `🟠 Only ${stock} left`
                          : `🟢 In Stock (${stock})`}
                      </div>

                      {/* DESCRIPTION */}

                      <p className="ai-result-description">
                        {
                          product.description
                        }
                      </p>

                      {/* WHY */}

                      <div className="ai-reasons">

                        <strong>
                          Why this
                          matches:
                        </strong>

                        {reasons.map(
                          (
                            reason,
                            reasonIndex
                          ) => (
                            <div
                              key={
                                reasonIndex
                              }
                            >
                              ✓ {reason}
                            </div>
                          )
                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="ai-result-actions">

                        <button
                          type="button"
                          className="ai-view-btn"
                          onClick={() =>
                            onViewProduct?.(
                              product
                            )
                          }
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          className="ai-cart-btn"
                          onClick={() =>
                            onAddToCart?.(
                              product
                            )
                          }
                        >
                          🛒 Add to Cart
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

            {bestProduct && (
              <div className="ai-best-summary">
                <span>
                  🤖
                </span>

                <p>
                  <strong>
                    ShopMind's top
                    recommendation:
                  </strong>{" "}
                  {bestProduct.name} at
                  ₹
                  {formatPrice(
                    bestProduct.price
                  )}
                  .
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}

export default AIShoppingAssistant;