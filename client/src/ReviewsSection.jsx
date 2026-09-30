import { useEffect, useState } from "react";
import api from "./api";

function ReviewsSection({
  productId,
  user,
  token,
}) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadReviews = async () => {
    if (!productId) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        `/reviews/${productId}`
      );

      setReviews(
        Array.isArray(response.data)
          ? response.data
          : response.data?.reviews || []
      );
    } catch (error) {
      console.error(
        "Failed to load reviews:",
        error
      );

      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || !token) {
      setMessage(
        "Please login to write a review."
      );
      return;
    }

    if (!comment.trim()) {
      setMessage(
        "Please write your review."
      );
      return;
    }

    try {
      setMessage("");

      await api.post(
        `/reviews/${productId}`,
        {
          rating: Number(rating),
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComment("");
      setRating(5);

      setMessage(
        "Review submitted successfully."
      );

      await loadReviews();
    } catch (error) {
      console.error(
        "Failed to submit review:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to submit review."
      );
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) =>
            total +
            Number(review.rating || 0),
          0
        ) / reviews.length
      : 0;

  return (
    <div className="reviews-section">

      <div className="reviews-header">
        <div>
          <span className="reviews-badge">
            ⭐ CUSTOMER REVIEWS
          </span>

          <h3>
            Ratings & Reviews
          </h3>

          <p>
            See what customers think about
            this product.
          </p>
        </div>

        {reviews.length > 0 && (
          <div className="reviews-average">
            <strong>
              {averageRating.toFixed(1)}
            </strong>

            <span>
              ⭐
            </span>

            <small>
              {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </small>
          </div>
        )}
      </div>

      {user ? (
        <form
          className="review-form"
          onSubmit={handleSubmit}
        >
          <h4>
            Write a Review
          </h4>

          <div className="review-rating-field">
            <label>
              Your Rating
            </label>

            <select
              value={rating}
              onChange={(event) =>
                setRating(
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value={5}>
                ⭐⭐⭐⭐⭐ 5 - Excellent
              </option>

              <option value={4}>
                ⭐⭐⭐⭐ 4 - Very Good
              </option>

              <option value={3}>
                ⭐⭐⭐ 3 - Good
              </option>

              <option value={2}>
                ⭐⭐ 2 - Fair
              </option>

              <option value={1}>
                ⭐ 1 - Poor
              </option>
            </select>
          </div>

          <div className="review-comment-field">
            <label>
              Your Review
            </label>

            <textarea
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value
                )
              }
              placeholder="Share your experience with this product..."
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="submit-review-btn"
          >
            ⭐ Submit Review
          </button>

          {message && (
            <p className="review-message">
              {message}
            </p>
          )}
        </form>
      ) : (
        <div className="review-login-message">
          🔐 Login to write a product
          review.
        </div>
      )}

      <div className="reviews-list">

        {loading ? (
          <div className="reviews-empty">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            <span>💬</span>

            <h4>
              No reviews yet
            </h4>

            <p>
              Be the first customer to
              review this product.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <article
              className="review-card"
              key={
                review._id ||
                `${review.user?._id}-${review.createdAt}`
              }
            >
              <div className="review-user">

                <div className="review-avatar">
                  {(
                    review.user?.name ||
                    review.userName ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {review.user?.name ||
                      review.userName ||
                      "ShopMind Customer"}
                  </strong>

                  <div className="review-stars">
                    {"⭐".repeat(
                      Math.max(
                        1,
                        Math.min(
                          5,
                          Number(
                            review.rating ||
                              0
                          )
                        )
                      )
                    )}
                  </div>
                </div>

              </div>

              <p>
                {review.comment ||
                  review.review ||
                  "No comment provided."}
              </p>

              {review.createdAt && (
                <small>
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </small>
              )}
            </article>
          ))
        )}

      </div>

    </div>
  );
}

export default ReviewsSection;