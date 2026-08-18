import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRestaurantById } from "../api/restaurant.api";
import { getCategoriesByRestaurant } from "../api/category.api";
import { getMenuByRestaurant, getMenuByCategory } from "../api/menuItem.api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CategoryTabs from "../components/restaurant/CategoryTabs";
import MenuItemCard from "../components/restaurant/MenuItemCard";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function RestaurantDetail() {
  const { id } = useParams(); //so you get the restaurant id that will be used to send to the backend and retrieve information about that restaurant 
  const { user } = useAuth();
  const { cart, addItem, updateItem, removeItem, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingItemId, setPendingItemId] = useState(null);
  const [switchPrompt, setSwitchPrompt] = useState(null); // menu item waiting on cart-switch confirmation

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getRestaurantById(id),
      getCategoriesByRestaurant(id),
      getMenuByRestaurant(id),
    ])
      .then(([restaurantRes, categoriesRes, menuRes]) => {
        setRestaurant(restaurantRes.restaurant);
        setCategories(categoriesRes.categories || []);
        setMenuItems(menuRes.menuItems || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load this restaurant."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCategoryChange = async (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId === null) {
      const data = await getMenuByRestaurant(id);
      setMenuItems(data.menuItems || []);
    } else {
      const data = await getMenuByCategory(categoryId);
      setMenuItems(data.menuItems || []);
    }
  };

  const cartLineFor = (menuItemId) =>
    cart?.items?.find((line) => line.menuItem === menuItemId || line.menuItem?._id === menuItemId);

  const handleAdd = async (item) => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/restaurants/${id}` } } });
      return;
    }
    setNotice("");
    setPendingItemId(item._id);
    try {
      await addItem(item._id, 1);
    } catch (err) {
      const message = err.response?.data?.message || "Couldn't add that item.";
      if (message.includes("another restaurant")) {
        setSwitchPrompt(item);
      } else {
        setNotice(message);
      }
    } finally {
      setPendingItemId(null);
    }
  };

  const confirmSwitchRestaurant = async () => {
    const item = switchPrompt;
    setSwitchPrompt(null);
    await clearCart();
    await addItem(item._id, 1);
  };

  const handleInc = (line) => updateItem(line._id, line.quantity + 1);
  const handleDec = (line) => {
    if (line.quantity <= 1) return removeItem(line._id);
    return updateItem(line._id, line.quantity - 1);
  };

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const groupedByCategory = useMemo(() => {
    if (activeCategory !== null) return { all: menuItems };
    const groups = {};
    menuItems.forEach((item) => {
      const key = item.category?.name || item.category || "Menu";
      groups[key] = groups[key] || [];
      groups[key].push(item);
    });
    return groups;
  }, [menuItems, activeCategory]);

  if (loading) return <Spinner label="Loading menu" />;
  if (error) return <p className="mx-auto max-w-3xl px-4 py-16 text-chili">{error}</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">{restaurant.name}</h1>
      {restaurant.cuisineTypes?.length > 0 && (
        <p className="mt-1 text-ink/60">{restaurant.cuisineTypes.join(" · ")}</p>
      )}
      <p className="mt-1 text-sm text-ink/40">
        {restaurant.address?.street}, {restaurant.address?.city}
      </p>

      {categories.length > 0 && (
        <div className="mt-6">
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onChange={handleCategoryChange} //if the user switches categories you have to filter the menu based on that
          />
        </div>
      )}

      {notice && <p className="mt-4 text-sm text-chili">{notice}</p>}

      {menuItems.length === 0 ? (
        <EmptyState title="No menu items in this section" />
      ) : (
        <div className="mt-6">
          {Object.entries(groupedByCategory).map(([groupName, items]) => (
            <div key={groupName} className="mb-8">
              {activeCategory === null && (
                <h2 className="mb-2 text-sm uppercase tracking-wide text-ink/40">
                  {groupName}
                </h2>
              )}
              <div>
                {items.map((item) => (
                  <MenuItemCard
                    key={item._id} //give each its key as id
                    item={item}
                    cartLine={cartLineFor(item._id)}
                    onAdd={handleAdd}
                    onInc={handleInc}
                    onDec={handleDec}
                    disabled={pendingItemId === item._id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {switchPrompt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4">
          <div className="max-w-sm rounded-xl bg-paper p-6">
            <h3 className="text-lg">Start a new cart?</h3>
            <p className="mt-2 text-sm text-ink/60">
              Your cart has items from another restaurant. Adding "{switchPrompt.name}" will
              clear it and start a new order from {restaurant.name}.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setSwitchPrompt(null)}
                className="rounded-full px-4 py-2 text-sm text-ink/60 hover:bg-ink/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitchRestaurant}
                className="rounded-full bg-chili px-4 py-2 text-sm text-paper hover:bg-chili/90"
              >
                Clear cart & add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
