import { useEffect, useState } from "react";
import { getMyRestaurantRequest } from "../../api/restaurant.api";
import {
  getReviewsByRestaurantRequest,
  replyToReviewRequest,
} from "../../api/review.api";
import ReviewCard from "../../components/restaurant-owner/ReviewCard";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

export default function RestaurantReviews() {
  const [reviews, setReviews] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyingId, setReplyingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const restData = await getMyRestaurantRequest();
        const rest = restData.restaurant || restData;
        setRestaurant(rest);

        if (rest?._id) {
          const reviewData = await getReviewsByRestaurantRequest(rest._id);
          setReviews(reviewData.reviews || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load reviews.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleReply = async (review, comment) => {
    setReplyingId(review._id);
    setError("");
    try {
      const data = await replyToReviewRequest(review._id, comment);
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? data.review : r))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't post that reply.");
    } finally {
      setReplyingId(null);
    }
  };

  if (loading) return <Spinner label="Loading reviews" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-4xl">Reviews</h1>
      {restaurant?.rating && (
        <p className="mt-1 text-sm text-ink/60">
          {restaurant.rating.average?.toFixed(1) || "—"} average ·{" "}
          {restaurant.rating.count || 0} reviews
        </p>
      )}

      {error && <p className="mt-4 text-sm text-chili">{error}</p>}

      {reviews.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No reviews yet"
            hint="Once customers review their delivered orders, they'll show up here."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onReply={handleReply}
              submitting={replyingId === review._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
