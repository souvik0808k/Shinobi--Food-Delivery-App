import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUserData } from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../App";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import useGetCity from "../hooks/useGetCity";
import Nav from "./Nav";
import { 
  FiGrid, 
  FiShoppingBag, 
  FiHeart, 
  FiMessageSquare, 
  FiClock, 
  FiHelpCircle, 
  FiLogOut,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiChevronRight,
  FiStar
} from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";

function UserDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  const [searchParams] = useSearchParams();
  useGetCity(); // Automatically fetches and stores current location

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 31.2254, lng: 75.7728 });

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders" || activeTab === "history") {
      fetchOrders();
      
      // Auto-refresh every 10 seconds for real-time updates
      const interval = setInterval(() => {
        fetchOrders();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Fetch nearby restaurants on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch restaurants when location is updated (only once)
  useEffect(() => {
    if (userLocation.lat && userLocation.lng && userLocation.lat !== 31.2254) {
      fetchRestaurants();
    } else if (userLocation.lat === 31.2254 && userLocation.lng === 75.7728) {
      // If still on default location after a short delay, fetch anyway
      const timer = setTimeout(() => {
        fetchRestaurants();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userLocation.lat, userLocation.lng]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Using default location");
        }
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const fetchRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      const response = await axios.get(`${serverUrl}/api/shop/all`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Filter shops with valid location data first
        const validShops = response.data.shops.filter(shop => 
          shop.location && 
          shop.location.coordinates && 
          Array.isArray(shop.location.coordinates) &&
          shop.location.coordinates.length >= 2
        );

        // Calculate distance for each restaurant
        const restaurantsWithDistance = validShops.map(shop => ({
          ...shop,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            shop.location.coordinates[1],
            shop.location.coordinates[0]
          )
        }));

        // Filter restaurants within 100km and sort by distance
        const nearbyRestaurants = restaurantsWithDistance
          .filter(shop => shop.distance <= 100)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 6); // Show only first 6

        setRestaurants(nearbyRestaurants);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      // Set empty array on error to prevent crashes
      setRestaurants([]);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get(`${serverUrl}/api/order/user/my-orders`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Manual refresh function
  const handleRefreshOrders = () => {
    fetchOrders();
  };

  const categories = [
    { emoji: "🍔", name: "Burger" },
    { emoji: "🥤", name: "Beverage" },
    { emoji: "🍱", name: "Seafood" },
    { emoji: "🍕", name: "Pizza" },
    { emoji: "🍗", name: "Chicken" },
    { emoji: "🍝", name: "Pasta" },
    { emoji: "🥗", name: "Salad" },
    { emoji: "🍰", name: "Dessert" }
  ];

  const popularDishes = [
    { id: 1, name: "Classic Burger", emoji: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80", price: 5.99, discount: 20, rating: 5 },
    { id: 2, name: "Margherita Pizza", emoji: "🍕", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80", price: 8.99, discount: 15, rating: 5 },
    { id: 3, name: "Caesar Salad", emoji: "🥗", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=300&q=80", price: 4.99, discount: 0, rating: 4 },
    { id: 4, name: "Fried Chicken", emoji: "🍗", image: "https://images.unsplash.com/photo-1562003389-902a48a3d6c0?auto=format&fit=crop&w=300&q=80", price: 6.99, discount: 10, rating: 5 },
    { id: 5, name: "Spaghetti Carbonara", emoji: "🍝", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=300&q=80", price: 7.49, discount: 0, rating: 4 },
    { id: 6, name: "Grilled Salmon", emoji: "🍱", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=300&q=80", price: 12.99, discount: 25, rating: 5 }
  ];

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(clearUserData());
      navigate("/signin");
    } catch (error) {
      console.log(error);
      dispatch(clearUserData());
      navigate("/signin");
    }
  };

  const addToCart = (dish) => {
    const existing = cart.find(item => item.id === dish.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...dish, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 4.0 : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <IoFastFoodOutline className="text-xl" />
          </div>
          <span className="text-xl font-bold tracking-tight">Shinobi</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === "overview"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiGrid className="w-5 h-5" />
            <span className="font-semibold">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === "orders"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiShoppingBag className="w-5 h-5" />
            <span className="font-medium">Food Order</span>
          </button>
          <button
            onClick={() => setActiveTab("favorite")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === "favorite"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiHeart className="w-5 h-5" />
            <span className="font-medium">Favorite</span>
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === "messages"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiMessageSquare className="w-5 h-5" />
            <span className="font-medium">Messages</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === "history"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiClock className="w-5 h-5" />
            <span className="font-medium">Order History</span>
          </button>
        </nav>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 text-white mb-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute -left-2 -bottom-2 w-16 h-16 bg-white/10 rounded-full"></div>
          <p className="text-xs opacity-90 mb-3 relative z-10">
            Upgrade Your Account To Get Free Coupon
          </p>
          <button className="bg-white text-orange-500 text-xs font-bold py-2 px-4 rounded-xl w-full hover:bg-orange-50 transition-all relative z-10">
            Upgrade Now
          </button>
        </div>

        <div className="space-y-4 border-t pt-6">
          <button className="flex items-center gap-4 text-gray-400 hover:text-orange-500 transition-all text-sm w-full">
            <FiHelpCircle className="w-5 h-5" /> Help
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-red-400 hover:text-red-600 transition-all text-sm w-full"
          >
            <FiLogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#FCFCFC]">
        <Nav cartCount={cart.length} />

        {/* Overview Tab - Hero Banner + Categories + Popular Dishes */}
        {activeTab === "overview" && (
          <>
            {/* Hero Banner */}
            <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[40px] p-10 flex justify-between items-center text-white mb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="max-w-md z-10">
                <h2 className="text-3xl font-bold leading-tight mb-4">
                  Get Up To 20% Discount On Your First Order
                </h2>
                <p className="text-sm opacity-90 leading-relaxed mb-4">
                  Get the absolute best out of the main dishes that are prepared by the top 1% chefs around the world.
                </p>
                <button 
                  onClick={() => navigate("/restaurants")}
                  className="bg-white text-orange-500 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-lg hover:scale-105 transform duration-200"
                >
                  Browse Restaurants Near You
                </button>
              </div>
              <div className="text-8xl z-10 animate-bounce">👨‍🍳</div>
            </section>

        {/* Categories */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Explore by Category</h3>
          </div>
          <div className="grid grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-[24px] border border-gray-50 shadow-sm text-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {category.emoji}
                </div>
                <span className="text-sm font-semibold text-gray-700">{category.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Dishes */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Popular Dishes</h3>
            <a href="#" className="text-orange-500 font-bold text-sm hover:text-orange-600 flex items-center gap-1">
              View all <FiChevronRight />
            </a>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {popularDishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white p-5 rounded-[32px] border border-gray-50 shadow-sm relative group hover:shadow-xl transition-all"
              >
                {dish.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-10">
                    {dish.discount}% Off
                  </span>
                )}
                <button className="absolute top-4 right-4 text-gray-200 group-hover:text-red-400 transition-colors z-10 hover:scale-110 transform">
                  <FiHeart className="text-xl" />
                </button>
                <img
                  src={dish.image}
                  className="w-full h-40 object-cover rounded-2xl my-4"
                  alt={dish.name}
                />
                <div className="flex gap-0.5 text-orange-400 text-xs mb-1">
                  {[...Array(dish.rating)].map((_, i) => (
                    <FiStar key={i} className="fill-current" />
                  ))}
                </div>
                <h4 className="font-bold text-gray-800 mb-1">{dish.name}</h4>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-lg">${dish.price}</span>
                  <button
                    onClick={() => addToCart(dish)}
                    className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all hover:scale-110 transform"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shinobi Restaurants */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Shinobi Restaurants</h3>
            <button
              onClick={() => navigate("/restaurants")}
              className="text-orange-500 font-bold text-sm hover:text-orange-600 flex items-center gap-1"
            >
              View all <FiChevronRight />
            </button>
          </div>

          {loadingRestaurants ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-orange-500"></div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No restaurants found nearby
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                  className="bg-white p-5 rounded-[32px] border border-gray-50 shadow-sm relative group hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
                    {restaurant.distance.toFixed(1)} km
                  </div>
                  <img
                    src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80"}
                    className="w-full h-40 object-cover rounded-2xl my-4"
                    alt={restaurant.name}
                  />
                  <div className="flex gap-0.5 text-orange-400 text-xs mb-1">
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">{restaurant.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{restaurant.address}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                      {restaurant.isOpen ? "Open" : "Closed"}
                    </span>
                    <button className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all hover:scale-110 transform">
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
          </>
        )}

        {/* Orders Tab - My Orders */}
        {(activeTab === "orders" || activeTab === "history") && (
          <section>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h2>
                <p className="text-gray-500">Track and manage your food orders</p>
              </div>
              <button
                onClick={handleRefreshOrders}
                disabled={loadingOrders}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition disabled:opacity-50"
              >
                <FiClock className={loadingOrders ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-7xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Start ordering delicious food from nearby restaurants!</p>
                <button
                  onClick={() => navigate("/restaurants")}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition"
                >
                  Browse Restaurants
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition border border-gray-100"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {order.shop?.name || "Restaurant"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Order ID: #{order._id.slice(-6)} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-600"
                              : order.status === "Cancelled"
                              ? "bg-red-100 text-red-600"
                              : order.status === "Placed"
                              ? "bg-yellow-100 text-yellow-600"
                              : order.status === "Confirmed"
                              ? "bg-blue-100 text-blue-600"
                              : order.status === "Preparing"
                              ? "bg-purple-100 text-purple-600"
                              : order.status === "Ready"
                              ? "bg-green-100 text-green-600"
                              : order.status === "Picked"
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Progress Tracker */}
                    {order.status !== "Cancelled" && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between">
                          {["Placed", "Confirmed", "Preparing", "Ready", "Picked", "Delivered"].map((status, idx) => {
                            const statusIndex = ["Placed", "Confirmed", "Preparing", "Ready", "Picked", "Delivered"].indexOf(order.status);
                            const currentIndex = idx;
                            const isCompleted = currentIndex <= statusIndex;
                            const isCurrent = currentIndex === statusIndex;

                            return (
                              <div key={status} className="flex-1 flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                                    isCompleted
                                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                      : "bg-gray-200 text-gray-400"
                                  } ${isCurrent ? "ring-4 ring-orange-200 scale-110" : ""}`}
                                >
                                  {isCompleted ? "✓" : idx + 1}
                                </div>
                                <p className={`text-xs font-medium text-center ${isCompleted ? "text-orange-600" : "text-gray-400"}`}>
                                  {status}
                                </p>
                                {idx < 5 && (
                                  <div
                                    className={`h-1 w-full mt-2 transition-all ${
                                      currentIndex < statusIndex ? "bg-orange-500" : "bg-gray-200"
                                    }`}
                                    style={{ position: "absolute", top: "20px", left: idx !== 5 ? "50%" : "auto", width: idx !== 5 ? "100%" : "0" }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Delivery Boy Info */}
                    {order.deliveryBoy && order.status === "Picked" && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {order.deliveryBoy.fullName?.charAt(0) || "D"}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Delivery Partner</p>
                            <p className="font-bold text-gray-800">{order.deliveryBoy.fullName || "Rider"}</p>
                            <p className="text-xs text-gray-500">{order.deliveryBoy.mobile || "Phone"}</p>
                          </div>
                          <div className="ml-auto">
                            <span className="text-xs px-3 py-1.5 bg-indigo-500 text-white rounded-full font-bold">
                              🚴 On the way
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600 mb-3">Items ({order.items?.length || 0})</p>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg text-xs font-bold">
                                {item.quantity}x
                              </span>
                              <span className="text-gray-700 font-medium">{item.item?.name || "Item"}</span>
                            </div>
                            <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-semibold text-gray-800">{order.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-orange-500">₹{order.totalAmount}</p>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex items-center gap-3 mt-4">
                      {order.status !== "Delivered" && order.status !== "Cancelled" && (
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to cancel this order?")) {
                              axios.put(`${serverUrl}/api/order/${order._id}/cancel`, {}, { withCredentials: true })
                                .then(() => {
                                  alert("Order cancelled successfully");
                                  fetchOrders();
                                })
                                .catch(err => alert(err.response?.data?.message || "Failed to cancel order"));
                            }
                          }}
                          className="flex-1 px-4 py-3 border-2 border-red-500 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition"
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.status === "Delivered" && (
                        <button
                          onClick={() => navigate("/restaurants")}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition"
                        >
                          Order Again
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Cart Sidebar - Only show when cart has items */}
      {cart.length > 0 && (
        <aside className="w-80 bg-white border-l border-gray-100 p-6 overflow-y-auto animate-slideIn">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Your Balance</h3>
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                className="w-10 h-10 rounded-full border-2 border-orange-400"
                alt="avatar"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-orange-400 bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center font-bold text-white">
                {currentUser?.fullName?.charAt(0) || "U"}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[32px] p-6 text-white mb-8 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
            <p className="text-sm opacity-80 mb-1 relative z-10">Balance</p>
            <div className="flex justify-between items-center relative z-10">
              <h2 className="text-3xl font-bold">$20.04</h2>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                <FiChevronRight className="text-sm" />
              </div>
            </div>
            <div className="flex justify-between mt-6 text-[10px] font-medium uppercase tracking-wider relative z-10">
              <div className="text-center cursor-pointer hover:opacity-80">
                <div className="text-lg mb-1">📤</div> Transfer
              </div>
              <div className="text-center cursor-pointer hover:opacity-80">
                <div className="text-lg mb-1">➕</div> Add
              </div>
              <div className="text-center cursor-pointer hover:opacity-80">
                <div className="text-lg mb-1">₿</div> Crypto
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold mb-4">Order Menu ({cart.length})</h3>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-xl group hover:bg-orange-50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                        {item.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-gray-400">${item.price} each</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-lg flex items-center justify-center transition-all"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-lg flex items-center justify-center transition-all"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-orange-500">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed pt-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span> <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Delivery</span> <span>+${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-orange-500">${(cartTotal + deliveryFee).toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-[20px] shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all"
          >
            Checkout
          </button>
        </aside>
      )}
    </div>
  );
}

export default UserDashboard;
