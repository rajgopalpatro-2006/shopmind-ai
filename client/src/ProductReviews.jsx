import { useEffect, useState } from "react";

import API_URL from "./api";

function ProductReviews({
  product,
  user,
  onRatingUpdated,
  onLoginRequired,
}) {
  const [reviews, setReviews] = useState([]);

  const [averageRating, setAverageRating] =
    useState(Number(product?.rating || 0));

  const [reviewCount, setReviewCount] =
    useState(0);

  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [editingReviewId, setEditingReviewId] =
    useState(null);

  const [editRating, setEditRating] =
    useState(5);

  const [editComment, setEditComment] =
    useState("");

  // =====================================
  // GET TOKEN
  // =====================================

  const getToken = () => {
    return localStorage.getItem(
      "shopmindToken"
    );
  };

  // =====================================
  // GET USER ID
  // =====================================

  const getUserId = () => {
    return (
      user?._id ||
      user?.id ||
      null
    );
  };

  // =====================================
  // CHECK IF REVIEW BELONGS TO USER
  // =====================================

  const isMyReview = (review) => {
    const currentUserId =
      getUserId();

    if (!currentUserId) {
      return false;
    }

    const reviewUserId =
      typeof review.user === "object"
        ? review.user?._id
        : review.user;

    return (
      String(reviewUserId) ===
      String(currentUserId)
    );
  };

  // =====================================
  // LOAD REVIEWS
  // =====================================

  const loadReviews = async () => {
    if (!product?._id) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_URL}/api/reviews/product/${product._id}`
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not load reviews."
        );
      }

      setReviews(
        data.reviews || []
      );

      setAverageRating(
        Number(
          data.averageRating || 0
        )
      );

      setReviewCount(
        Number(
          data.reviewCount || 0
        )
      );
    } catch (err) {
      console.error(
        "Load reviews error:",
        err
      );

      setError(
        err.message ||
          "Could not load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [product?._id]);

  // =====================================
  // UPDATE PRODUCT RATING IN APP
  // =====================================

  const updateParentRating = (
    newAverageRating,
    newReviewCount
  ) => {
    setAverageRating(
      Number(
        newAverageRating || 0
      )
    );

    setReviewCount(
      Number(
        newReviewCount || 0
      )
    );

    if (onRatingUpdated) {
      onRatingUpdated({
        productId:
          product._id,

        rating:
          Number(
            newAverageRating || 0
          ),

        reviewCount:
          Number(
            newReviewCount || 0
          ),
      });
    }
  };

  // =====================================
  // SUBMIT REVIEW
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    setMessage("");

    const token =
      getToken();

    if (!user || !token) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        setError(
          "Please login to write a review."
        );
      }

      return;
    }

    if (
      !comment.trim()
    ) {
      setError(
        "Please write your review."
      );

      return;
    }

    if (
      comment.trim().length >
      1000
    ) {
      setError(
        "Review cannot exceed 1000 characters."
      );

      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/reviews/product/${product._id}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            rating:
              Number(rating),

            comment:
              comment.trim(),
          }),
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
            "Could not submit review."
        );
      }

      setComment("");

      setRating(5);

      setMessage(
        data.message ||
          "Review submitted successfully."
      );

      updateParentRating(
        data.averageRating,
        data.reviewCount
      );

      await loadReviews();
    } catch (err) {
      console.error(
        "Submit review error:",
        err
      );

      setError(
        err.message ||
          "Could not submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // START EDITING
  // =====================================

  const startEditing = (
    review
  ) => {
    setEditingReviewId(
      review._id
    );

    setEditRating(
      Number(
        review.rating || 5
      )
    );

    setEditComment(
      review.comment || ""
    );

    setError("");

    setMessage("");
  };

  // =====================================
  // CANCEL EDIT
  // =====================================

  const cancelEditing = () => {
    setEditingReviewId(
      null
    );

    setEditRating(5);

    setEditComment("");
  };

  // =====================================
  // UPDATE REVIEW
  // =====================================

  const handleUpdateReview =
    async (reviewId) => {
      setError("");

      setMessage("");

      const token =
        getToken();

      if (!token) {
        if (
          onLoginRequired
        ) {
          onLoginRequired();
        }

        return;
      }

      if (
        !editComment.trim()
      ) {
        setError(
          "Review cannot be empty."
        );

        return;
      }

      if (
        editComment.trim().length >
        1000
      ) {
        setError(
          "Review cannot exceed 1000 characters."
        );

        return;
      }

      try {
        setSubmitting(true);

        const response =
          await fetch(
            `${API_URL}/api/reviews/${reviewId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  rating:
                    Number(
                      editRating
                    ),

                  comment:
                    editComment.trim(),
                }),
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
              "Could not update review."
          );
        }

        setEditingReviewId(
          null
        );

        setEditComment("");

        setMessage(
          data.message ||
            "Review updated successfully."
        );

        updateParentRating(
          data.averageRating,
          data.reviewCount
        );

        await loadReviews();
      } catch (err) {
        console.error(
          "Update review error:",
          err
        );

        setError(
          err.message ||
            "Could not update review."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================
  // DELETE REVIEW
  // =====================================

  const handleDeleteReview =
    async (reviewId) => {
      const token =
        getToken();

      if (!token) {
        if (
          onLoginRequired
        ) {
          onLoginRequired();
        }

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this review?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setSubmitting(true);

        setError("");

        setMessage("");

        const response =
          await fetch(
            `${API_URL}/api/reviews/${reviewId}`,
            {
              method:
                "DELETE",

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
              "Could not delete review."
          );
        }

        setMessage(
          data.message ||
            "Review deleted successfully."
        );

        updateParentRating(
          data.averageRating,
          data.reviewCount
        );

        await loadReviews();
      } catch (err) {
        console.error(
          "Delete review error:",
          err
        );

        setError(
          err.message ||
            "Could not delete review."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================
  // STAR INPUT
  // =====================================

  const StarSelector = ({
    value,
    onChange,
    disabled = false,
  }) => {
    return (
      <div className="review-star-selector">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <button
              key={star}
              type="button"
              disabled={
                disabled
              }
              className={
                star <= value
                  ? "review-star active"
                  : "review-star"
              }
              onClick={() =>
                onChange(star)
              }
              title={`${star} star${
                star === 1
                  ? ""
                  : "s"
              }`}
            >
              ★
            </button>
          )
        )}
      </div>
    );
  };

  // =====================================
  // DISPLAY STARS
  // =====================================

  const displayStars = (
    value
  ) => {
    const rounded =
      Math.round(
        Number(value || 0)
      );

    return [1, 2, 3, 4, 5]
      .map((star) =>
        star <= rounded
          ? "★"
          : "☆"
      )
      .join("");
  };

  // =====================================
  // DATE
  // =====================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================
  // CHECK EXISTING USER REVIEW
  // =====================================

  const myReview =
    reviews.find(
      (review) =>
        isMyReview(review)
    );

  // =====================================
  // UI
  // =====================================

  return (
    <div className="product-reviews">

      {/* =================================
          HEADING
      ================================= */}

      <div className="reviews-heading">
        <div>
          <h3>
            ⭐ Customer Reviews
          </h3>

          <p>
            See what customers
            think about this
            product.
          </p>
        </div>

        <div className="reviews-summary">
          <strong>
            {averageRating.toFixed(
              1
            )}
          </strong>

          <div>
            <span className="reviews-summary-stars">
              {displayStars(
                averageRating
              )}
            </span>

            <small>
              {reviewCount} review
              {reviewCount === 1
                ? ""
                : "s"}
            </small>
          </div>
        </div>
      </div>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div className="review-error">
          {error}
        </div>
      )}

      {/* =================================
          SUCCESS
      ================================= */}

      {message && (
        <div className="review-success">
          {message}
        </div>
      )}

      {/* =================================
          REVIEW FORM
      ================================= */}

      {!myReview && (
        <div className="review-form-card">

          <h4>
            Write a Review
          </h4>

          {!user ? (
            <div className="review-login-message">
              <p>
                Login to rate and
                review this product.
              </p>

              <button
                type="button"
                onClick={() =>
                  onLoginRequired?.()
                }
              >
                Login to Review
              </button>
            </div>
          ) : (
            <form
              onSubmit={
                handleSubmit
              }
            >
              <label>
                Your Rating
              </label>

              <StarSelector
                value={rating}
                onChange={
                  setRating
                }
                disabled={
                  submitting
                }
              />

              <label>
                Your Review
              </label>

              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
                placeholder="Tell other customers about this product..."
                maxLength={1000}
                disabled={
                  submitting
                }
              />

              <div className="review-character-count">
                {comment.length}
                /1000
              </div>

              <button
                type="submit"
                className="review-submit-btn"
                disabled={
                  submitting
                }
              >
                {submitting
                  ? "Submitting..."
                  : "⭐ Submit Review"}
              </button>
            </form>
          )}

        </div>
      )}

      {/* =================================
          USER ALREADY REVIEWED
      ================================= */}

      {myReview &&
        editingReviewId !==
          myReview._id && (
          <div className="already-reviewed">
            ✓ You have reviewed
            this product. You can
            edit or delete your
            review below.
          </div>
        )}

      {/* =================================
          LOADING
      ================================= */}

      {loading && (
        <div className="reviews-loading">
          Loading reviews...
        </div>
      )}

      {/* =================================
          NO REVIEWS
      ================================= */}

      {!loading &&
        reviews.length === 0 && (
          <div className="no-reviews">
            <div>
              💬
            </div>

            <h4>
              No reviews yet
            </h4>

            <p>
              Be the first customer
              to review this
              product.
            </p>
          </div>
        )}

      {/* =================================
          REVIEW LIST
      ================================= */}

      {!loading &&
        reviews.length > 0 && (
          <div className="reviews-list">

            {reviews.map(
              (review) => (
                <div
                  className={`review-card ${
                    isMyReview(
                      review
                    )
                      ? "my-review"
                      : ""
                  }`}
                  key={
                    review._id
                  }
                >

                  {/* EDIT MODE */}

                  {editingReviewId ===
                  review._id ? (
                    <div className="review-edit-form">

                      <h4>
                        Edit Your Review
                      </h4>

                      <label>
                        Rating
                      </label>

                      <StarSelector
                        value={
                          editRating
                        }
                        onChange={
                          setEditRating
                        }
                        disabled={
                          submitting
                        }
                      />

                      <label>
                        Review
                      </label>

                      <textarea
                        value={
                          editComment
                        }
                        onChange={(
                          e
                        ) =>
                          setEditComment(
                            e.target
                              .value
                          )
                        }
                        maxLength={
                          1000
                        }
                        disabled={
                          submitting
                        }
                      />

                      <div className="review-character-count">
                        {
                          editComment.length
                        }
                        /1000
                      </div>

                      <div className="review-edit-actions">

                        <button
                          type="button"
                          className="review-save-btn"
                          disabled={
                            submitting
                          }
                          onClick={() =>
                            handleUpdateReview(
                              review._id
                            )
                          }
                        >
                          {submitting
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          className="review-cancel-btn"
                          disabled={
                            submitting
                          }
                          onClick={
                            cancelEditing
                          }
                        >
                          Cancel
                        </button>

                      </div>

                    </div>
                  ) : (
                    <>

                      {/* NORMAL REVIEW */}

                      <div className="review-card-header">

                        <div className="review-user">

                          <div className="review-avatar">
                            {(
                              review.userName ||
                              "U"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {review.userName ||
                                "ShopMind User"}
                            </strong>

                            {isMyReview(
                              review
                            ) && (
                              <span className="your-review-badge">
                                Your Review
                              </span>
                            )}

                            <small>
                              {formatDate(
                                review.createdAt
                              )}
                            </small>
                          </div>

                        </div>

                        <div className="review-rating-display">
                          <span>
                            {displayStars(
                              review.rating
                            )}
                          </span>

                          <strong>
                            {Number(
                              review.rating
                            ).toFixed(
                              1
                            )}
                          </strong>
                        </div>

                      </div>

                      <p className="review-comment">
                        {
                          review.comment
                        }
                      </p>

                      {/* OWN REVIEW ACTIONS */}

                      {isMyReview(
                        review
                      ) && (
                        <div className="review-owner-actions">

                          <button
                            type="button"
                            className="review-edit-btn"
                            onClick={() =>
                              startEditing(
                                review
                              )
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="review-delete-btn"
                            disabled={
                              submitting
                            }
                            onClick={() =>
                              handleDeleteReview(
                                review._id
                              )
                            }
                          >
                            🗑️ Delete
                          </button>

                        </div>
                      )}

                    </>
                  )}

                </div>
              )
            )}

          </div>
        )}

    </div>
  );
}

export default ProductReviews;