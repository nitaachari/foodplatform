import { useEffect, useState } from "react";
import { getAllRestaurants } from "../api/restaurant.api";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllRestaurants()
      .then((data) => setRestaurants(data.restaurants))
      .catch((err) => setError(err.response?.data?.message || "Couldn't load restaurants."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl">Hungry?</h1>
      <p className="mt-1 text-ink/60">Pick a restaurant and build your order.</p>

      {loading && <Spinner label="Loading restaurants" />}

      {!loading && error && <p className="mt-8 text-chili">{error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <EmptyState
          title="No restaurants yet"
          hint="Check back soon — new restaurants are added regularly."
        />
      )}

      {!loading && restaurants.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
