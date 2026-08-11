import { Link } from "react-router-dom";

export default function RestaurantCard({ restaurant }) {
  const cover = restaurant.images?.[0];

  return (
    <Link
      to={`/restaurants/${restaurant._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/40 transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-ink/5">
        {cover ? (
          <img
            src={cover}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-ink/20">
            {restaurant.name?.[0]}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg leading-snug">{restaurant.name}</h3>
          <span className="shrink-0 rounded-full bg-curry/10 px-2 py-0.5 font-mono text-xs text-curry">
            ★ {restaurant.rating?.average?.toFixed(1) || "New"}
          </span>
        </div>

        {restaurant.cuisineTypes?.length > 0 && (
          <p className="text-sm text-ink/60">
            {restaurant.cuisineTypes.join(" · ")}
          </p>
        )}

        <p className="mt-1 text-xs uppercase tracking-wide text-ink/40">
          {restaurant.address?.city}
        </p>
      </div>
    </Link>
  );
}
