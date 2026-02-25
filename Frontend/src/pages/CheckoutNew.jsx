import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from "axios";
import { 
  FiCheck, 
  FiChevronLeft, 
  FiMapPin, 
  FiPhone, 
  FiUser,
  FiCreditCard,
  FiNavigation,
  FiTrash2,
  FiPlus,
  FiMinus
} from "react-icons/fi";
import { clearCart, updateQuantity } from "../redux/cartSlice";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGOTczMTYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEyIiBmaWxsPSIjRjk3MzE2Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Location marker component
function LocationMarker({ position, setPosition, setDeliveryDetails, deliveryDetails }) {
  const map = useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      map.flyTo(newPos, map.getZoom());
      
      setDeliveryDetails({
        ...deliveryDetails,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    },
  });

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>
        📍 Delivery Location<br />
        {position[0].toFixed(6)}, {position[1].toFixed(6)}
      </Popup>
    </Marker>
  );
}

// Map updater component
function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.flyTo(center, 13, {
        duration: 1.5
      });
    }
  }, [center, map]);
  
  return null;
}

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  const cart = useSelector((state) => state.cart);
  
  const [step, setStep] = useState(1);
  const [mapPosition, setMapPosition] = useState([28.6139, 77.2090]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [countdown, setCountdown] = useState(5);
  
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: currentUser?.fullName || "",
    phone: currentUser?.mobile || "",
    address: "",
    city: "",
    zipCode: "",
    instructions: "",
    latitude: null,
    longitude: null
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Redirect if cart is empty (but not when showing success modal or when just placed order)
  useEffect(() => {
    // Don't redirect if modal is showing or if we just placed an order
    if (cart.items.length === 0 && !showSuccessModal && !orderId) {
      const timer = setTimeout(() => {
        navigate("/restaurants");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cart.items, navigate, showSuccessModal, orderId]);

  // Auto-redirect to orders page after showing success modal
  useEffect(() => {
    if (showSuccessModal) {
      setCountdown(5); // Reset countdown to 5 seconds
      
      // Countdown timer
      const countInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Redirect timer
      const redirectTimer = setTimeout(() => {
        navigate("/dashboard/user?tab=orders");
      }, 5000); // 5 seconds delay

      return () => {
        clearInterval(countInterval);
        clearTimeout(redirectTimer);
      };
    }
  }, [showSuccessModal, navigate]);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = [position.coords.latitude, position.coords.longitude];
          setMapPosition(newPos);
          setDeliveryDetails(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    }
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = [position.coords.latitude, position.coords.longitude];
          setMapPosition(newPos);
          setDeliveryDetails(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please select on map.");
          setIsLoadingLocation(false);
        }
      );
    }
  };

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round((cart.totalAmount * 0.05) * 100) / 100;
  const finalTotal = cart.totalAmount + deliveryFee + platformFee + gst;

  const handleNextStep = () => {
    if (step === 1) {
      if (!deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.address || !deliveryDetails.city) {
        alert("Please fill in all required fields");
        return;
      }
      if (!deliveryDetails.latitude || !deliveryDetails.longitude) {
        alert("Please select your delivery location on the map");
        return;
      }
    }
    if (step < 2) setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      
      const orderData = {
        shop: cart.shopId,
        items: cart.items.map(item => ({
          item: item.itemId,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryDetails: {
          name: deliveryDetails.name,
          phone: deliveryDetails.phone,
          address: deliveryDetails.address,
          city: deliveryDetails.city,
          zipCode: deliveryDetails.zipCode,
          instructions: deliveryDetails.instructions,
          latitude: deliveryDetails.latitude,
          longitude: deliveryDetails.longitude
        },
        paymentMethod,
        itemsTotal: cart.totalAmount,
        deliveryFee,
        platformFee,
        gst,
        totalAmount: finalTotal
      };

      const response = await axios.post("http://localhost:8000/api/order/create", orderData, {
        withCredentials: true
      });

      if (response.data.success) {
        const newOrderId = response.data.order._id || response.data.order.id || "";
        console.log("Order placed successfully, ID:", newOrderId);
        setOrderId(newOrderId);
        
        // Show success modal first, THEN clear cart
        console.log("Setting modal to show");
        setShowSuccessModal(true);
        
        // Clear cart after a small delay to prevent immediate redirect
        setTimeout(() => {
          dispatch(clearCart());
        }, 100);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiChevronLeft className="text-2xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
              <p className="text-sm text-gray-500">{cart.shopName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                {[
                  { num: 1, label: "Delivery" },
                  { num: 2, label: "Payment" }
                ].map((item, index) => (
                  <div key={item.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${
                          step >= item.num
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {step > item.num ? <FiCheck /> : item.num}
                      </div>
                      <p className={`text-sm mt-2 font-medium ${step >= item.num ? "text-orange-500" : "text-gray-400"}`}>
                        {item.label}
                      </p>
                    </div>
                    {index < 1 && (
                      <div className={`h-1 flex-1 mx-2 ${step > item.num ? "bg-orange-500" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Delivery Details */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Delivery Form */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiUser className="inline mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={deliveryDetails.name}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiPhone className="inline mr-2" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={deliveryDetails.phone}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+91 1234567890"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiMapPin className="inline mr-2" />
                        Address *
                      </label>
                      <textarea
                        value={deliveryDetails.address}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        rows="2"
                        placeholder="House/Flat No., Street, Area"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={deliveryDetails.city}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                      <input
                        type="text"
                        value={deliveryDetails.zipCode}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, zipCode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="000000"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryDetails.instructions}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, instructions: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Ring the bell twice"
                      />
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Select Delivery Location</h2>
                    <button
                      onClick={handleGetCurrentLocation}
                      disabled={isLoadingLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                    >
                      <FiNavigation className={isLoadingLocation ? "animate-spin" : ""} />
                      {isLoadingLocation ? "Getting..." : "Current Location"}
                    </button>
                  </div>

                  <div className="h-80 rounded-xl overflow-hidden">
                    <MapContainer
                      center={mapPosition}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapUpdater center={mapPosition} />
                      <LocationMarker 
                        position={mapPosition} 
                        setPosition={setMapPosition}
                        setDeliveryDetails={setDeliveryDetails}
                        deliveryDetails={deliveryDetails}
                      />
                    </MapContainer>
                  </div>

                  {deliveryDetails.latitude && (
                    <p className="mt-4 text-sm text-gray-600">
                      📍 Selected: {deliveryDetails.latitude.toFixed(6)}, {deliveryDetails.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                
                <div className="space-y-3">
                  {[
                    { id: "COD", label: "Cash on Delivery", icon: "💵" },
                    { id: "UPI", label: "UPI Payment", icon: "📱" },
                    { id: "Card", label: "Credit/Debit Card", icon: "💳" },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                        paymentMethod === method.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-semibold">{method.label}</span>
                        {paymentMethod === method.id && (
                          <FiCheck className="ml-auto text-orange-500 text-xl" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4">
              {step > 1 && (
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Previous
                </button>
              )}
              
              {step < 2 ? (
                <button
                  onClick={handleNextStep}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50"
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.itemId} className="flex gap-3 pb-3 border-b">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        🍴
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.category}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-orange-500">₹{item.price}</span>
                        <span className="text-xs text-gray-600">x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Total</span>
                  <span className="font-semibold">₹{cart.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-semibold">₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="font-semibold">₹{gst}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-gray-300">
                  <span>Total</span>
                  <span className="text-orange-500">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <FiCheck className="text-white text-7xl font-bold" strokeWidth={4} />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-gray-800 mb-3">🎉 Order Placed!</h2>
              <p className="text-gray-600 mb-4 text-lg">
                Your order has been successfully placed
              </p>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-5 mb-3 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-2xl font-bold text-orange-600">#{orderId ? orderId.slice(-6) : "N/A"}</p>
              </div>
              <p className="text-sm text-gray-500">
                🚀 Track your order status in real-time
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/dashboard/user?tab=orders");
              }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all transform hover:scale-105 shadow-lg"
            >
              {countdown > 0 ? `Go to My Orders (${countdown}s)` : "Go to My Orders"}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Redirecting automatically...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
