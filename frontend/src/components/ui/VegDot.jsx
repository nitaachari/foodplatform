const colorFor = {
  veg: "border-curry text-curry",
  "non-veg": "border-chili text-chili",
  egg: "border-turmeric text-turmeric",
};

// Small square-with-centred-dot mark, matching the food-type symbol used on
// Indian restaurant menus. Reused throughout the app (menu cards, cart lines,
// order status stepper) as the one recurring signature device.
export default function VegDot({ type = "veg", size = "sm" }) {
  const dims = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span
      title={type}
      className={`inline-flex shrink-0 items-center justify-center rounded-[3px] border ${dims} ${colorFor[type] || colorFor.veg}`}
    >
      <span className={`rounded-full bg-current ${dot}`} />
    </span>
  );
}
