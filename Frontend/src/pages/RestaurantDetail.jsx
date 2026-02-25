import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FiMapPin, FiClock, FiStar, FiShoppingCart, FiArrowLeft, FiPlus, FiMinus } from "react-icons/fi";
import { addToCart, updateQuantity } from "../redux/cartSlice";

const RestaurantDetail = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cart = useSelector((state) => state.cart);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchRestaurantDetails();
    fetchMenuItems();
  }, [shopId]);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/shop/${shopId}`);
      if (response.data.success) {
        setRestaurant(response.data.shop);
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/item/shop/${shopId}`);
      if (response.data.success) {
        // Only show items that are in stock and active
        const availableItems = response.data.items.filter(item => item.inStock && item.isActive);
        setMenuItems(availableItems);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(menuItems.map(item => item.category))];

  const filteredItems = selectedCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cart.items.find(item => item.itemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item) => {
    if (cart.shopId && cart.shopId !== shopId) {
      if (window.confirm(`Your cart contains items from ${cart.shopName}. Do you want to clear the cart and add items from this restaurant?`)) {
        dispatch(addToCart({
          itemId: item._id,
          name: item.name,
          price: item.price,
          category: item.category,
          shopId: shopId,
          shopName: restaurant.name,
        }));
      }
    } else {
      dispatch(addToCart({
        itemId: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
        shopId: shopId,
        shopName: restaurant.name,
      }));
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
  };

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/restaurants")}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition"
            >
              <FiArrowLeft className="text-xl" />
              <span className="font-medium">Back</span>
            </button>
            
            {cart.totalItems > 0 && (
              <button
                onClick={() => navigate("/checkout")}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105"
              >
                <FiShoppingCart className="text-xl" />
                <span className="font-semibold">Cart ({cart.totalItems})</span>
                <span className="font-bold">₹{cart.totalAmount}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant Banner */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Restaurant Image */}
            <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
              {restaurant.images && restaurant.images.length > 0 ? (
                <img
                  src={restaurant.images[0]}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center text-6xl">
                  🍽️
                </div>
              )}
            </div>

            {/* Restaurant Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">{restaurant.name}</h1>
                  <p className="text-gray-600 text-lg">{restaurant.description}</p>
                </div>
                {restaurant.isActive ? (
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Open Now
                  </span>
                ) : (
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Closed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <FiMapPin className="text-orange-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold">{restaurant.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <FiClock className="text-orange-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Timings</p>
                    <p className="font-semibold">{restaurant.openTime} - {restaurant.closeTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <FiStar className="text-yellow-500 text-xl fill-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-semibold">{restaurant.rating.toFixed(1)} ⭐ ({restaurant.totalOrders} orders)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8 sticky top-20 z-10 bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No items available</h3>
            <p className="text-gray-500">This restaurant hasn't added any menu items yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const quantityInCart = getItemQuantityInCart(item._id);
              
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition hover:shadow-2xl"
                >
                  {/* Item Image */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-200 to-red-200">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🍴
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                        item.category === "Veg" ? "bg-green-500 text-white" :
                        item.category === "Non-Veg" ? "bg-red-500 text-white" :
                        "bg-purple-500 text-white"
                      }`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800 flex-1">
                        {item.name}
                      </h3>
                      <span className="text-2xl font-bold text-orange-500 ml-2">
                        ₹{item.price}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-1">
                        <FiStar className="text-yellow-500 fill-yellow-500" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                      <span>{item.soldCount} sold</span>
                      <span>⏱️ {item.preparationTime} min</span>
                    </div>

                    {/* Add to Cart Button */}
                    {quantityInCart === 0 ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition transform hover:scale-105"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-2">
                        <button
                          onClick={() => handleUpdateQuantity(item._id, quantityInCart - 1)}
                          className="w-10 h-10 bg-white text-orange-500 rounded-lg font-bold hover:bg-gray-100 transition"
                        >
                          <FiMinus className="mx-auto" />
                        </button>
                        <span className="text-xl font-bold">{quantityInCart}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item._id, quantityInCart + 1)}
                          className="w-10 h-10 bg-white text-orange-500 rounded-lg font-bold hover:bg-gray-100 transition"
                        >
                          <FiPlus className="mx-auto" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button for Mobile */}
      {cart.totalItems > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => navigate("/checkout")}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <FiShoppingCart className="text-2xl" />
              <span className="font-semibold">{cart.totalItems} items</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl">₹{cart.totalAmount}</span>
              <span className="font-medium">→</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
