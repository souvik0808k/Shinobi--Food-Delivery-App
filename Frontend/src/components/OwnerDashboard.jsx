import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUserData } from "../redux/userSlice";
import { setShopData as setShopDataRedux, setItems, updateItem as updateItemRedux, removeItem } from "../redux/shopSlice";
import axios from "axios";
import { serverUrl } from "../App";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import useGetCity from "../hooks/useGetCity";
import Nav from "./Nav";
import { 
  FiGrid, 
  FiPackage, 
  FiShoppingBag, 
  FiDollarSign,
  FiClock,
  FiHelpCircle,
  FiLogOut,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiTruck,
  FiPercent,
  FiArchive,
  FiEye,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { IoFastFoodOutline, IoWalletOutline } from "react-icons/io5";

function OwnerDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  useGetCity();

  // Get shop data from Redux
  const shopState = useSelector((state) => state.shop);
  const { shopData, items: reduxItems, hasShop } = shopState;

  const [activeTab, setActiveTab] = useState("overview");
  const [items, setItemsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [orderOtp, setOrderOtp] = useState("");
  const [selectedOrderForOtp, setSelectedOrderForOtp] = useState(null);

  // Fetch shop and items data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch shop data
        const shopResponse = await axios.get(`${serverUrl}/api/shop/my-shop`, {
          withCredentials: true,
        });

        if (shopResponse.data.success && shopResponse.data.hasShop) {
          dispatch(setShopDataRedux(shopResponse.data.shop));
          
          // Fetch items
          const itemsResponse = await axios.get(`${serverUrl}/api/item/my-items`, {
            withCredentials: true,
          });

          if (itemsResponse.data.success) {
            dispatch(setItems(itemsResponse.data.items));
            setItemsState(itemsResponse.data.items);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchOrders(); // Fetch orders on mount
  }, [dispatch]);

  // Fetch orders periodically (every 10 seconds for overview, 5 seconds for orders tab)
  useEffect(() => {
    const intervalTime = activeTab === "orders" ? 5000 : 10000;
    const interval = setInterval(() => {
      fetchOrders();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get(`${serverUrl}/api/order/shop/orders`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Filter only active orders (not delivered or cancelled)
        const activeOrders = response.data.orders.filter(order => 
          !['Delivered', 'Cancelled'].includes(order.status)
        );
        setLiveOrders(activeOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Update local items when Redux items change
  useEffect(() => {
    if (reduxItems && reduxItems.length > 0) {
      setItemsState(reduxItems);
    }
  }, [reduxItems]);

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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      
      // If assigning delivery, generate OTP
      if (newStatus === "Ready") {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const response = await axios.put(
          `${serverUrl}/api/order/${orderId}/status`,
          { status: newStatus, pickupOtp: otp },
          { withCredentials: true }
        );

        if (response.data.success) {
          setOrderOtp(otp);
          setSelectedOrderForOtp(response.data.order);
          setShowOtpModal(true);
          await fetchOrders();
        }
      } else {
        // Regular status update
        const response = await axios.put(
          `${serverUrl}/api/order/${orderId}/status`,
          { status: newStatus },
          { withCredentials: true }
        );

        if (response.data.success) {
          await fetchOrders();
          alert(`Order status updated to ${newStatus}`);
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const toggleItemStock = async (itemId) => {
    try {
      const response = await axios.patch(
        `${serverUrl}/api/item/${itemId}/toggle-stock`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update local state
        setItemsState(items.map(item => 
          item._id === itemId ? response.data.item : item
        ));
        // Update Redux
        dispatch(updateItemRedux(response.data.item));
      }
    } catch (error) {
      console.error("Error toggling item stock:", error);
      alert("Failed to update item stock");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${serverUrl}/api/item/${itemId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove from local state
        setItemsState(items.filter(item => item._id !== itemId));
        // Remove from Redux
        dispatch(removeItem(itemId));
        alert("Item deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to add shop if no shop exists
  if (!hasShop || !shopData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="text-orange-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome, {currentUser?.fullName}!</h2>
          <p className="text-gray-600 mb-6">
            You haven't set up your shop yet. Add your shop details to start receiving orders.
          </p>
          <button
            onClick={() => navigate("/add-shop")}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <FiPlus className="inline mr-2" />
            Add Your Shop
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => setActiveTab("items")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === "items"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiPackage className="w-5 h-5" />
            <span className="font-medium">Food Items</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all relative ${
              activeTab === "orders"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiShoppingBag className="w-5 h-5" />
            <span className="font-medium">Orders</span>
            {liveOrders.filter(o => o.status === "pending").length > 0 && (
              <span className="absolute right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === "coupons"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiPercent className="w-5 h-5" />
            <span className="font-medium">Coupons</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === "payments"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiDollarSign className="w-5 h-5" />
            <span className="font-medium">Payments</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeTab === "history"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <FiArchive className="w-5 h-5" />
            <span className="font-medium">Order History</span>
          </button>
        </nav>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 text-white mb-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute -left-2 -bottom-2 w-16 h-16 bg-white/10 rounded-full"></div>
          <p className="text-xs opacity-90 mb-3 relative z-10">
            {shopData.name}
          </p>
          <button 
            onClick={() => navigate("/add-shop")}
            className="bg-white text-orange-500 text-xs font-bold py-2 px-4 rounded-xl w-full hover:bg-orange-50 transition-all relative z-10">
            <FiEdit className="inline mr-1" /> Edit Shop
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
        <Nav cartCount={0} />

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-sm">Total Orders</p>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiShoppingBag className="text-blue-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{shopData?.totalOrders || 0}</p>
                <p className="text-xs text-gray-400 mt-1">All time orders</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiDollarSign className="text-green-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">₹{shopData?.totalRevenue || 0}</p>
                <p className="text-xs text-gray-400 mt-1">All time revenue</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-sm">Active Orders</p>
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FiClock className="text-orange-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{liveOrders.length}</p>
                <p className="text-xs text-gray-400 mt-1">Live orders in progress</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-sm">Total Items</p>
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <IoFastFoodOutline className="text-purple-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{items.length}</p>
                <p className="text-xs text-gray-400 mt-1">Menu items</p>
              </div>
            </div>

            {/* Live Orders Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FiClock className="text-orange-500" />
                  Live Orders
                  <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full ml-2">
                    {liveOrders.length} Active
                  </span>
                </h2>
              </div>

              {liveOrders.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <FiClock className="text-6xl mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No active orders</p>
                  <p className="text-sm mt-2">Live orders will appear here when customers place orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liveOrders.map((order) => (
                    <div key={order._id} className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-orange-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-800">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">
                            {order.deliveryDetails?.name} • {order.deliveryDetails?.phone}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-orange-500">₹{order.totalAmount}</p>
                          <p className="text-xs text-gray-500">{order.items.length} items</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-white p-3 rounded-lg mb-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Items:</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-700 py-1">
                            <span>{item.quantity}x {item.item?.name || 'Item'}</span>
                            <span className="font-medium">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Details */}
                      <div className="bg-white p-3 rounded-lg mb-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Delivery Address:</p>
                        <p className="text-sm text-gray-700">{order.deliveryDetails?.address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Payment: <span className="font-semibold">{order.paymentMethod}</span>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                          order.status === "Placed" ? "bg-yellow-100 text-yellow-700" :
                          order.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                          order.status === "Preparing" ? "bg-purple-100 text-purple-700" :
                          order.status === "Ready" ? "bg-green-100 text-green-700" :
                          order.status === "Picked" ? "bg-indigo-100 text-indigo-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {order.status === "Placed" && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order._id, "Cancelled")}
                              disabled={updatingOrder === order._id}
                              className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-medium hover:bg-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <FiX /> Reject
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order._id, "Confirmed")}
                              disabled={updatingOrder === order._id}
                              className="flex-1 bg-green-100 text-green-600 py-2 rounded-lg font-medium hover:bg-green-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <FiCheck /> Accept Order
                            </button>
                          </>
                        )}
                        {order.status === "Confirmed" && (
                          <button
                            onClick={() => updateOrderStatus(order._id, "Preparing")}
                            disabled={updatingOrder === order._id}
                            className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <FiClock /> Start Preparing
                          </button>
                        )}
                        {order.status === "Preparing" && (
                          <button
                            onClick={() => updateOrderStatus(order._id, "Ready")}
                            disabled={updatingOrder === order._id}
                            className="flex-1 bg-orange-100 text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <FiCheckCircle /> Mark as Ready
                          </button>
                        )}
                        {order.status === "Ready" && (
                          <button
                            onClick={() => updateOrderStatus(order._id, "Picked")}
                            disabled={updatingOrder === order._id}
                            className="flex-1 bg-purple-100 text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <FiCheckCircle /> Order Ready (Generate OTP)
                          </button>
                        )}
                        {order.status === "Picked" && (
                          <div className="flex-1 bg-indigo-100 text-indigo-600 py-2 rounded-lg font-medium text-center">
                            <span className="font-bold">Out for Delivery</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab - Dedicated View */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">All Orders</h2>
              <button
                onClick={fetchOrders}
                className="bg-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition-all flex items-center gap-2"
              >
                <FiClock className="animate-spin" /> Refresh
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
              </div>
            ) : liveOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-center text-gray-400 py-12">
                  <FiShoppingBag className="text-6xl mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No active orders</p>
                  <p className="text-sm mt-2">New orders will appear here automatically</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {liveOrders.map((order) => (
                  <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-100 hover:border-orange-200 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-gray-800">Order #{order._id.slice(-6)}</h3>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                            order.status === "Placed" ? "bg-yellow-100 text-yellow-700" :
                            order.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                            order.status === "Preparing" ? "bg-purple-100 text-purple-700" :
                            order.status === "Ready" ? "bg-green-100 text-green-700" :
                            order.status === "Picked" ? "bg-indigo-100 text-indigo-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">₹{order.totalAmount}</p>
                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Customer Details */}
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Customer Details</p>
                        <p className="font-bold text-gray-800">{order.deliveryDetails?.name}</p>
                        <p className="text-sm text-gray-600">{order.deliveryDetails?.phone}</p>
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Delivery Address</p>
                        <p className="text-sm text-gray-700">{order.deliveryDetails?.address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Payment: <span className="font-semibold">{order.paymentMethod}</span>
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-orange-50 p-4 rounded-xl mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-3">Order Items</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                {item.quantity}
                              </span>
                              <span className="text-sm font-medium text-gray-800">{item.item?.name || 'Item'}</span>
                            </div>
                            <span className="font-bold text-gray-700">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {order.status === "Placed" && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order._id, "Cancelled")}
                            disabled={updatingOrder === order._id}
                            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <FiX /> Reject Order
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order._id, "Confirmed")}
                            disabled={updatingOrder === order._id}
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <FiCheck /> Accept Order
                          </button>
                        </>
                      )}
                      {order.status === "Confirmed" && (
                        <button
                          onClick={() => updateOrderStatus(order._id, "Preparing")}
                          disabled={updatingOrder === order._id}
                          className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <FiClock /> Start Preparing
                        </button>
                      )}
                      {order.status === "Preparing" && (
                        <button
                          onClick={() => updateOrderStatus(order._id, "Ready")}
                          disabled={updatingOrder === order._id}
                          className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <FiCheckCircle /> Mark as Ready
                        </button>
                      )}
                      {order.status === "Ready" && (
                        <button
                          onClick={() => updateOrderStatus(order._id, "Picked")}
                          disabled={updatingOrder === order._id}
                          className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <FiTruck /> Assign Delivery Boy
                        </button>
                      )}
                      {order.status === "Picked" && (
                        <div className="w-full bg-indigo-100 text-indigo-700 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                          <FiTruck />
                          <span>Out for Delivery</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Items Tab */}
        {activeTab === "items" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Food Items</h2>
              <button
                onClick={() => navigate("/add-item")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <FiPlus /> Add New Item
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {items.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-400">
                  <IoFastFoodOutline className="text-6xl mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No items added yet</p>
                  <p className="text-sm mt-2">Start adding your menu items</p>
                  <button
                    onClick={() => navigate("/add-item")}
                    className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    <FiPlus /> Add Your First Item
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <img 
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <p className="text-orange-500 font-bold text-xl mt-1">₹{item.price}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.soldCount} sold</p>
                      </div>
                      <div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          item.inStock 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button 
                        onClick={() => toggleItemStock(item._id)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                      >
                        {item.inStock ? <FiX /> : <FiCheck />}
                        {item.inStock ? "Mark Out of Stock" : "Mark In Stock"}
                      </button>
                      <button 
                        onClick={() => navigate("/add-item")}
                        className="bg-blue-100 text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-200 transition-all"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="bg-red-100 text-red-600 py-2 px-4 rounded-lg font-medium hover:bg-red-200 transition-all"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === "coupons" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Coupons & Offers</h2>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-center text-gray-400 py-12">
                <FiPercent className="text-6xl mx-auto mb-4 opacity-50" />
                <p className="text-lg">Coupon management coming soon</p>
                <p className="text-sm mt-2">Create and manage discount coupons for your customers</p>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold">Payments & Withdrawals</h2>

            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
                <p className="text-sm opacity-90 mb-2 relative z-10">Total Earnings</p>
                <p className="text-4xl font-bold mb-4 relative z-10">₹{(shopData?.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs opacity-80 relative z-10">From {shopData?.totalOrders || 0} orders</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
                <p className="text-sm opacity-90 mb-2 relative z-10">Available to Withdraw</p>
                <p className="text-4xl font-bold mb-4 relative z-10">₹{(shopData?.availableBalance || 0).toLocaleString()}</p>
                <button className="bg-white text-orange-600 px-6 py-2 rounded-xl font-bold hover:bg-orange-50 transition-all relative z-10 mt-2">
                  Withdraw Now
                </button>
              </div>
            </div>

            {/* Withdrawal Options */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Withdrawal Methods</h3>
              <div className="space-y-3">
                <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 cursor-pointer transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        🏦
                      </div>
                      <div>
                        <p className="font-bold">Bank Transfer</p>
                        <p className="text-sm text-gray-500">2-3 business days</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 cursor-pointer transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <p className="font-bold">UPI / PayTM</p>
                        <p className="text-sm text-gray-500">Instant transfer</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 cursor-pointer transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        📱
                      </div>
                      <div>
                        <p className="font-bold">PhonePe / Google Pay</p>
                        <p className="text-sm text-gray-500">Instant transfer</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold">Order History</h2>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-center text-gray-400 py-12">
                <FiArchive className="text-6xl mx-auto mb-4 opacity-50" />
                <p className="text-lg">Order history will appear here</p>
                <p className="text-sm mt-2">All completed and cancelled orders from past days</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FiCheckCircle className="text-green-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Ready!</h2>
            <p className="text-gray-600 text-sm">
              Share this OTP with the delivery partner when they arrive
            </p>
          </div>

          {selectedOrderForOtp && (
            <div className="bg-orange-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="font-bold text-lg">#{selectedOrderForOtp._id?.slice(-6)}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2 text-center">Pickup OTP</p>
            <p className="text-5xl font-bold text-orange-600 text-center tracking-wider">{orderOtp}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> The delivery partner will need to enter this OTP to confirm pickup. Keep this visible until pickup is confirmed.
            </p>
          </div>

          <button
            onClick={() => {
              setShowOtpModal(false);
              setOrderOtp("");
              setSelectedOrderForOtp(null);
            }}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    )}
  </div>
  );
}

export default OwnerDashboard;