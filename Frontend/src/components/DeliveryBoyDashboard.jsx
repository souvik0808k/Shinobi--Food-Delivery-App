import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUserData } from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../App";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import useGetCity from "../hooks/useGetCity";
import Nav from "./Nav";
import { 
  FiGrid, 
  FiPackage, 
  FiDollarSign,
  FiClock,
  FiLogOut,
  FiCheck,
  FiX,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiUser,
  FiCheckCircle,
  FiNavigation
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";

function DeliveryBoyDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  useGetCity();

  const [activeTab, setActiveTab] = useState("overview");
  const [availableOrders, setAvailableOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [acceptingOrder, setAcceptingOrder] = useState(null);
  const [pickupOtp, setPickupOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Fetch delivery orders on mount and every 10 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get(`${serverUrl}/api/order/delivery/my-orders`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setAvailableOrders(response.data.availableOrders || []);
        setAssignedOrders(response.data.assignedOrders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setAvailableOrders([]);
      setAssignedOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setAcceptingOrder(orderId);
      const response = await axios.put(
        `${serverUrl}/api/order/${orderId}/assign-delivery`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("Order accepted! Proceed to restaurant for pickup.");
        await fetchOrders();
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      alert(error.response?.data?.message || "Failed to accept order");
    } finally {
      setAcceptingOrder(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!confirm("Are you sure you want to reject this delivery?")) return;
    
    try {
      // For now, just refresh. Backend can handle rejection logic
      await fetchOrders();
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const handleVerifyOtp = async () => {
    if (!pickupOtp || pickupOtp.length !== 4) {
      alert("Please enter 4-digit OTP");
      return;
    }

    try {
      setVerifyingOtp(true);
      const response = await axios.put(
        `${serverUrl}/api/order/${selectedOrder._id}/verify-pickup`,
        { otp: pickupOtp },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("✅ Order picked up successfully!");
        setShowOtpModal(false);
        setPickupOtp("");
        setSelectedOrder(null);
        await fetchOrders();
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (!confirm("Confirm delivery completion?")) return;

    try {
      const response = await axios.put(
        `${serverUrl}/api/order/${orderId}/mark-delivered`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("✅ Order delivered successfully!");
        await fetchOrders();
      }
    } catch (error) {
      console.error("Error marking delivered:", error);
      alert(error.response?.data?.message || "Failed to mark as delivered");
    }
  };

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

  // Calculate statistics
  const allOrders = [...assignedOrders];
  
  const todayOrders = assignedOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const activeOrders = assignedOrders.filter(order => 
    order.status === "Picked" || order.status === "Ready"
  );

  const completedOrders = assignedOrders.filter(order => order.status === "Delivered");
  const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.deliveryFee || 40), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Nav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-2xl p-6 shadow-lg h-fit sticky top-24">
            <div className="text-center mb-6 pb-6 border-b">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                {currentUser?.fullName?.charAt(0) || "D"}
              </div>
              <h3 className="font-bold text-lg">{currentUser?.fullName}</h3>
              <p className="text-sm text-gray-500">Delivery Partner</p>
              <p className="text-xs text-gray-400 mt-1">{currentUser?.mobile}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <FiGrid className="text-xl" />
                <span className="font-medium">Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "orders"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <FiPackage className="text-xl" />
                <span className="font-medium">Orders</span>
                {activeOrders.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {activeOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("earnings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "earnings"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <FiDollarSign className="text-xl" />
                <span className="font-medium">Earnings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-all mt-8"
              >
                <FiLogOut className="text-xl" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {currentUser?.fullName?.split(' ')[0]}! 🚴</h1>
                  <p className="text-gray-500">Track your deliveries and earnings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-500 text-sm">Today's Deliveries</p>
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FiClock className="text-blue-500" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{todayOrders.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Orders today</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-500 text-sm">Active Orders</p>
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <FiTruck className="text-orange-500" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{activeOrders.length}</p>
                    <p className="text-xs text-gray-400 mt-1">In progress</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-500 text-sm">Today's Earnings</p>
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <FiDollarSign className="text-green-500" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">₹{todayOrders.filter(o => o.status === "Delivered").length * 40}</p>
                    <p className="text-xs text-gray-400 mt-1">Delivery fees</p>
                  </div>
                </div>

                {/* Available Orders Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FiPackage className="text-green-500" />
                      Available Orders ({availableOrders.length})
                    </h2>
                    <button
                      onClick={fetchOrders}
                      disabled={loadingOrders}
                      className="text-orange-500 font-medium text-sm hover:text-orange-600 flex items-center gap-1"
                    >
                      <FiClock className={loadingOrders ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>

                  {loadingOrders ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-500"></div>
                    </div>
                  ) : availableOrders.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <FiPackage className="text-6xl mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No available orders</p>
                      <p className="text-sm mt-2">New orders will appear here when ready for pickup</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableOrders.map((order) => (
                        <div key={order._id} className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-lg">Order #{order._id.slice(-6)}</p>
                              <p className="text-sm text-gray-600">{order.shop?.name}</p>
                            </div>
                            <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-green-100 text-green-700">
                              Ready for Pickup
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-lg mb-3">
                            <div className="flex items-start gap-2 mb-2">
                              <FiMapPin className="text-green-500 mt-1" />
                              <div>
                                <p className="text-xs text-gray-500">Delivery Address</p>
                                <p className="text-sm font-medium">{order.deliveryDetails?.address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiPhone className="text-green-500" />
                              <div>
                                <p className="text-xs text-gray-500">Customer</p>
                                <p className="text-sm font-medium">{order.deliveryDetails?.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <FiDollarSign className="text-green-500" />
                              <div>
                                <p className="text-xs text-gray-500">Delivery Fee</p>
                                <p className="text-sm font-medium">₹{order.deliveryFee || 40}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptOrder(order._id)}
                              disabled={acceptingOrder === order._id}
                              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {acceptingOrder === order._id ? "Accepting..." : (
                                <>
                                  <FiCheckCircle /> Accept Order
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Orders Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FiTruck className="text-orange-500" />
                      My Active Deliveries
                    </h2>
                  </div>

                  {loadingOrders ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-orange-500"></div>
                    </div>
                  ) : activeOrders.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <FiTruck className="text-6xl mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No active deliveries</p>
                      <p className="text-sm mt-2">Accept an order above to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeOrders.map((order) => (
                        <div key={order._id} className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-xl border-2 border-orange-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-lg">Order #{order._id.slice(-6)}</p>
                              <p className="text-sm text-gray-600">{order.shop?.name}</p>
                            </div>
                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                              order.status === "Ready" ? "bg-green-100 text-green-700" :
                              order.status === "Picked" ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-lg mb-3">
                            <div className="flex items-start gap-2 mb-2">
                              <FiMapPin className="text-orange-500 mt-1" />
                              <div>
                                <p className="text-xs text-gray-500">Delivery Address</p>
                                <p className="text-sm font-medium">{order.deliveryDetails?.address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiPhone className="text-orange-500" />
                              <div>
                                <p className="text-xs text-gray-500">Customer</p>
                                <p className="text-sm font-medium">{order.deliveryDetails?.phone}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {order.status === "Ready" && (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOtpModal(true);
                                }}
                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
                              >
                                Enter Pickup OTP
                              </button>
                            )}

                            {order.status === "Picked" && (
                              <button
                                onClick={() => handleMarkDelivered(order._id)}
                                className="flex-1 bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 transition flex items-center justify-center gap-2"
                              >
                                <FiCheckCircle /> Mark as Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold">All Orders</h2>
                
                {/* Similar to overview active orders but showing all */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  {allOrders.length === 0 ? (
                    <div className="text-center py-20">
                      <FiPackage className="text-6xl mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allOrders.map((order) => (
                        <div key={order._id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-bold">Order #{order._id.slice(-6)}</p>
                              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-orange-500">₹{order.deliveryFee || 40}</p>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{order.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === "earnings" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold">Earnings</h2>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl shadow-lg">
                    <p className="text-sm opacity-90 mb-2">Total Earnings</p>
                    <p className="text-4xl font-bold mb-4">₹{totalEarnings}</p>
                    <p className="text-xs opacity-80">From {completedOrders.length} deliveries</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-2xl shadow-lg">
                    <p className="text-sm opacity-90 mb-2">Today's Earnings</p>
                    <p className="text-4xl font-bold mb-4">₹{todayOrders.filter(o => o.status === "Delivered").length * 40}</p>
                    <p className="text-xs opacity-80">From {todayOrders.filter(o => o.status === "Delivered").length} deliveries</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold mb-4">Withdrawal Options</h3>
                  <p className="text-gray-500 text-sm">Withdrawal features coming soon...</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Enter Pickup OTP</h2>
            <p className="text-gray-600 mb-6 text-center text-sm">
              Get the 4-digit OTP from the restaurant owner
            </p>

            {selectedOrder && (
              <div className="bg-orange-50 p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-600 mb-1">Restaurant</p>
                <p className="font-bold text-lg">{selectedOrder.shop?.name}</p>
                <p className="text-sm text-gray-500 mt-2">Order #{selectedOrder._id.slice(-6)}</p>
              </div>
            )}

            <input
              type="text"
              maxLength="4"
              value={pickupOtp}
              onChange={(e) => setPickupOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4-digit OTP"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center text-2xl font-bold tracking-widest mb-6 focus:border-orange-500 focus:outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setPickupOtp("");
                  setSelectedOrder(null);
                }}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || pickupOtp.length !== 4}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
              >
                {verifyingOtp ? "Verifying..." : "Verify & Pickup"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryBoyDashboard;
