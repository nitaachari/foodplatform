import { useState, useEffect } from "react";
import axios from "../api/axios"; // adjust path to your API helper
import Button from "../components/ui/Button";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'categories' | 'menu'
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Categories & Menu Items state
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    foodType: "veg",
    categoryId: "",
    images: "",
    preparationTime: "15-20 mins",
  });

  // Restaurant Form State matching schema
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    cuisineTypes: "",
    images: "",
    status: "open",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
    location: {
      longitude: 78.4867,
      latitude: 17.385,
    },
    operatingHours: DAYS_OF_WEEK.map((day) => ({
      day,
      open: "09:00 AM",
      close: "10:00 PM",
      isClosed: false,
    })),
  });

  // Fetch initial profile, categories, and menu items
  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/restaurants/my-restaurant");
      const rest = res.data?.restaurant || res.data;

      if (rest) {
        setRestaurant(rest);
        setFormData({
          name: rest.name || "",
          description: rest.description || "",
          phone: rest.phone || "",
          email: rest.email || "",
          cuisineTypes: rest.cuisineTypes ? rest.cuisineTypes.join(", ") : "",
          images: rest.images ? rest.images.join(", ") : "",
          status: rest.status || "open",
          address: {
            street: rest.address?.street || "",
            city: rest.address?.city || "",
            state: rest.address?.state || "",
            country: rest.address?.country || "India",
            pincode: rest.address?.pincode || "",
          },
          location: {
            longitude: rest.location?.coordinates?.[0] ?? 78.4867,
            latitude: rest.location?.coordinates?.[1] ?? 17.385,
          },
          operatingHours:
            rest.operatingHours?.length > 0
              ? rest.operatingHours
              : DAYS_OF_WEEK.map((day) => ({
                  day,
                  open: "09:00 AM",
                  close: "10:00 PM",
                  isClosed: false,
                })),
        });

        if (rest._id) {
          fetchCategoriesAndMenu(rest._id);
        }
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || "Failed to load restaurant profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndMenu = async (restaurantId) => {
    try {
      const [catRes, menuRes] = await Promise.all([
        axios.get(`/categories/restaurant/${restaurantId}`),
        axios.get(`/menu/restaurant/${restaurantId}`),
      ]);

      const fetchedCategories = catRes.data?.categories || catRes.data || [];
      const fetchedMenuItems = menuRes.data?.menuItems || menuRes.data || [];

      setCategories(fetchedCategories);
      setMenuItems(fetchedMenuItems);

      if (fetchedCategories.length > 0) {
        setNewItem((prev) => ({ ...prev, categoryId: fetchedCategories[0]._id }));
      }
    } catch (err) {
      console.error("Error loading categories or menu items:", err);
    }
  };

  // Form field handlers
  const handleBasicChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddressChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [e.target.name]: e.target.value },
    }));

  const handleLocationChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [e.target.name]: e.target.value },
    }));

  const handleOperatingHoursChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.operatingHours];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, operatingHours: updated };
    });
  };

  // Save / Update Restaurant Profile
  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      name: formData.name,
      description: formData.description,
      phone: formData.phone,
      email: formData.email,
      cuisineTypes: formData.cuisineTypes
        ? formData.cuisineTypes.split(",").map((c) => c.trim())
        : [],
      images: formData.images
        ? formData.images.split(",").map((i) => i.trim())
        : [],
      status: formData.status,
      address: formData.address,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(formData.location.longitude),
          parseFloat(formData.location.latitude),
        ],
      },
      operatingHours: formData.operatingHours,
    };

    try {
      let res;
      if (restaurant?._id) {
        res = await axios.patch(`/restaurants/${restaurant._id}`, payload);
      } else {
        res = await axios.post("/restaurants", payload);
      }

      const updatedRestaurant = res.data?.restaurant || res.data;
      setRestaurant(updatedRestaurant);
      setSuccess("Restaurant profile saved successfully!");
      
      // Load categories/menu if created for the first time
      if (updatedRestaurant?._id) {
        fetchCategoriesAndMenu(updatedRestaurant._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save restaurant details.");
    } finally {
      setSubmitting(false);
    }
  };

  // Add Category Handler (aligned with category.service.js)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const restId = restaurant?._id || restaurant?.id;

    if (!restId) {
      return setError("Restaurant ID is missing. Please save your restaurant profile first.");
    }

    try {
      setError("");
      const res = await axios.post("/categories", {
        name: newCategory.name,
        description: newCategory.description,
        restaurantId: restId, // Matches category.service.js destructuring
      });

      const addedCategory = res.data?.category || res.data;
      setCategories((prev) => [...prev, addedCategory]);

      if (categories.length === 0 && addedCategory?._id) {
        setNewItem((prev) => ({ ...prev, categoryId: addedCategory._id }));
      }

      setNewCategory({ name: "", description: "" });
      setSuccess("Category created successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add category.");
    }
  };

  // Add Menu Item Handler (aligned with menu.service.js)
  const handleAddMenuItem = async (e) => {
  e.preventDefault();
  const restId = restaurant?._id || restaurant?.id;

  if (!restId) {
    return setError("Restaurant ID is missing. Please save your restaurant profile first.");
  }

  if (!newItem.categoryId) {
    return setError("Please select or create a category first.");
  }

  try {
    setError("");

    const payload = {
      restaurantId: restId,
      categoryId: newItem.categoryId,
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      foodType: newItem.foodType,
      preparationTime: parseInt(newItem.preparationTime, 10) || 15, // Converts to Number
      images: newItem.images ? newItem.images.split(",").map((img) => img.trim()) : [],
    };

    const res = await axios.post("/menu", payload);

    const addedMenuItem = res.data?.menuItem || res.data;
    setMenuItems((prev) => [...prev, addedMenuItem]);

    // Reset state with a numeric preparation time
    setNewItem({
      name: "",
      description: "",
      price: "",
      foodType: "veg",
      categoryId: categories[0]?._id || "",
      images: "",
      preparationTime: 20,
    });
    setSuccess("Menu item created successfully!");
  } catch (err) {
    setError(err.response?.data?.message || "Failed to add menu item.");
  }
};

  if (loading) {
    return <div className="p-8 text-center text-ink/60">Loading restaurant profile…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
      <p className="mt-1 text-sm text-ink/60">
        Manage your business profile, operating schedule, and food menu.
      </p>

      {/* Navigation Tabs */}
      <div className="mt-6 flex border-b border-ink/10 space-x-6">
        <button
          onClick={() => {
            setActiveTab("profile");
            setError("");
            setSuccess("");
          }}
          className={`pb-3 font-medium text-sm border-b-2 ${
            activeTab === "profile"
              ? "border-chili text-chili"
              : "border-transparent text-ink/60 hover:text-ink"
          }`}
        >
          Restaurant Details
        </button>
        <button
          disabled={!restaurant}
          onClick={() => {
            setActiveTab("categories");
            setError("");
            setSuccess("");
          }}
          className={`pb-3 font-medium text-sm border-b-2 ${
            activeTab === "categories"
              ? "border-chili text-chili"
              : "border-transparent text-ink/60 hover:text-ink disabled:opacity-40"
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          disabled={!restaurant}
          onClick={() => {
            setActiveTab("menu");
            setError("");
            setSuccess("");
          }}
          className={`pb-3 font-medium text-sm border-b-2 ${
            activeTab === "menu"
              ? "border-chili text-chili"
              : "border-transparent text-ink/60 hover:text-ink disabled:opacity-40"
          }`}
        >
          Menu Items ({menuItems.length})
        </button>
      </div>

      {/* Notifications */}
      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded">{success}</p>}

      {/* TAB 1: RESTAURANT PROFILE FORM */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveRestaurant} className="mt-6 space-y-6">
          <div className="space-y-4 rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-ink/70">Restaurant Name *</label>
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={formData.name}
                  onChange={handleBasicChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleBasicChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-ink/70">Description</label>
              <textarea
                name="description"
                maxLength={500}
                rows={3}
                value={formData.description}
                onChange={handleBasicChange}
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-ink/70">Phone *</label>
                <input
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleBasicChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">Contact Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleBasicChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-ink/70">Cuisines (comma separated)</label>
              <input
                name="cuisineTypes"
                placeholder="e.g. Italian, Fast Food, Mexican"
                value={formData.cuisineTypes}
                onChange={handleBasicChange}
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
              />
            </div>

            <div>
              <label className="text-sm text-ink/70">Image URLs (comma separated)</label>
              <input
                name="images"
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                value={formData.images}
                onChange={handleBasicChange}
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="text-lg font-semibold">Address</h2>
            <div>
              <label className="text-sm text-ink/70">Street Address *</label>
              <input
                name="street"
                required
                value={formData.address.street}
                onChange={handleAddressChange}
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm text-ink/70">City *</label>
                <input
                  name="city"
                  required
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">State *</label>
                <input
                  name="state"
                  required
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">Pincode *</label>
                <input
                  name="pincode"
                  required
                  value={formData.address.pincode}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">Country</label>
                <input
                  name="country"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="text-lg font-semibold">Geo Coordinates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-ink/70">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  required
                  value={formData.location.longitude}
                  onChange={handleLocationChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  required
                  value={formData.location.latitude}
                  onChange={handleLocationChange}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="text-lg font-semibold">Operating Hours</h2>
            {formData.operatingHours.map((item, idx) => (
              <div key={item.day} className="flex flex-wrap items-center gap-3 border-b pb-3">
                <span className="w-24 font-medium text-sm">{item.day}</span>
                <input
                  type="text"
                  placeholder="09:00 AM"
                  disabled={item.isClosed}
                  value={item.open}
                  onChange={(e) => handleOperatingHoursChange(idx, "open", e.target.value)}
                  className="w-28 rounded-lg border border-ink/15 px-2 py-1 text-sm outline-none focus:border-chili disabled:bg-gray-100"
                />
                <span className="text-xs text-ink/40">to</span>
                <input
                  type="text"
                  placeholder="10:00 PM"
                  disabled={item.isClosed}
                  value={item.close}
                  onChange={(e) => handleOperatingHoursChange(idx, "close", e.target.value)}
                  className="w-28 rounded-lg border border-ink/15 px-2 py-1 text-sm outline-none focus:border-chili disabled:bg-gray-100"
                />
                <label className="ml-auto flex items-center space-x-1 text-xs text-ink/70">
                  <input
                    type="checkbox"
                    checked={item.isClosed}
                    onChange={(e) => handleOperatingHoursChange(idx, "isClosed", e.target.checked)}
                  />
                  <span>Closed</span>
                </label>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving..." : "Save Restaurant Profile"}
          </Button>
        </form>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === "categories" && (
        <div className="mt-6 space-y-6">
          <form onSubmit={handleAddCategory} className="rounded-xl border border-ink/10 bg-white p-5 space-y-4">
            <h2 className="text-lg font-semibold">Add Menu Category</h2>
            <div>
              <label className="text-sm text-ink/70">Category Name *</label>
              <input
                required
                value={newCategory.name}
                onChange={(e) => setNewCategory((c) => ({ ...c, name: e.target.value }))}
                placeholder="e.g. Starters, Desserts, Beverages"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
              />
            </div>
            <div>
              <label className="text-sm text-ink/70">Description</label>
              <input
                value={newCategory.description}
                onChange={(e) => setNewCategory((c) => ({ ...c, description: e.target.value }))}
                placeholder="Optional description"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
              />
            </div>
            <Button type="submit">Add Category</Button>
          </form>

          <div className="rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="text-lg font-semibold mb-3">Existing Categories</h2>
            {categories.length === 0 ? (
              <p className="text-sm text-ink/50">No categories created yet.</p>
            ) : (
              <ul className="divide-y">
                {categories.map((cat) => (
                  <li key={cat._id} className="py-2">
                    <p className="font-medium text-sm capitalize">{cat.name}</p>
                    {cat.description && <p className="text-xs text-ink/60">{cat.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MENU ITEMS */}
      {activeTab === "menu" && (
        <div className="mt-6 space-y-6">
          <form onSubmit={handleAddMenuItem} className="rounded-xl border border-ink/10 bg-white p-5 space-y-4">
            <h2 className="text-lg font-semibold">Add Menu Item</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-ink/70">Item Name *</label>
                <input
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem((i) => ({ ...i, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newItem.price}
                  onChange={(e) => setNewItem((i) => ({ ...i, price: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-ink/70">Category *</label>
                <select
                  required
                  value={newItem.categoryId}
                  onChange={(e) => setNewItem((i) => ({ ...i, categoryId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-ink/70">Food Type *</label>
                <select
                  value={newItem.foodType}
                  onChange={(e) => setNewItem((i) => ({ ...i, foodType: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                >
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="egg">Egg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-ink/70">Description</label>
              <textarea
                rows={2}
                value={newItem.description}
                onChange={(e) => setNewItem((i) => ({ ...i, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-ink/70">Image URLs (comma separated)</label>
                <input
                  value={newItem.images}
                  onChange={(e) => setNewItem((i) => ({ ...i, images: e.target.value }))}
                  placeholder="https://example.com/item.jpg"
                  className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
                />
              </div>
              <div>
  <label className="text-sm text-ink/70">Prep Time (in minutes)</label>
  <input
    type="number"
    min="1"
    value={newItem.preparationTime}
    onChange={(e) => setNewItem((i) => ({ ...i, preparationTime: e.target.value }))}
    placeholder="e.g. 20"
    className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
  />
</div>
            </div>

            <Button type="submit">Add Item to Menu</Button>
          </form>

          {/* List Existing Menu Items */}
          <div className="rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="text-lg font-semibold mb-3">Menu Items</h2>
            {menuItems.length === 0 ? (
              <p className="text-sm text-ink/50">No items added to the menu yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div key={item._id} className="flex border rounded-lg p-3 space-x-3">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm capitalize">{item.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 uppercase">
                          {item.foodType}
                        </span>
                      </div>
                      <p className="text-xs text-ink/60 mt-1">{item.description}</p>
                      <p className="text-sm font-semibold mt-1">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}