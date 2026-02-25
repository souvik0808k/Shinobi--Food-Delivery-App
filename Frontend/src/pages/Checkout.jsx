import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FiCheck, 
  FiChevronLeft, 
  FiMapPin, 
  FiPhone, 
  FiUser,
  FiCreditCard,
  FiTag,
  FiNavigation
} from "react-icons/fi";
import { IoWalletOutline, IoLocationSharp } from "react-icons/io5";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

// Fix default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icon for current location
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGOTczMTYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEyIiBmaWxsPSIjRjk3MzE2Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Component to handle map clicks and location updates
function LocationMarker({ position, setPosition, setDeliveryDetails, deliveryDetails }) {
  const map = useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      map.flyTo(newPos, map.getZoom());
      
      // Reverse geocoding would go here in production
      // For now, just update coordinates
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
        <div className="text-center">
          <p className="font-bold text-orange-600">📍 Delivery Location</p>
          <p className="text-xs text-gray-600">
            {position[0].toFixed(4)}, {position[1].toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

// Component to update map view when position changes
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
  const currentUser = useGetCurrentUser();
  const [step, setStep] = useState(1);
  const [mapPosition, setMapPosition] = useState([28.6139, 77.2090]); // Default: New Delhi
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Step 1: Delivery Details
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
          alert("Could not get your location. Please select on map or enter manually.");
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  // Step 2: Coupons & Offers
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const coupons = [
    { id: 1, code: "FIRST20", discount: 20, description: "20% off on first order", minOrder: 15 },
    { id: 2, code: "SAVE10", discount: 10, description: "Flat $10 off", minOrder: 30 },
    { id: 3, code: "FREESHIP", discount: 0, description: "Free delivery", minOrder: 20, isFreeDelivery: true }
  ];

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const orderTotal = 24.20; // This should come from props/context
  const discount = selectedCoupon ? (selectedCoupon.isFreeDelivery ? 4 : (orderTotal * selectedCoupon.discount) / 100) : 0;
  const finalTotal = orderTotal - discount;

  const handleNextStep = () => {
    if (step === 1) {
      // Validate delivery details
      if (!deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.address || !deliveryDetails.city) {
        alert("Please fill in all required fields");
        return;
      }
      if (!deliveryDetails.latitude || !deliveryDetails.longitude) {
        alert("Please select your delivery location on the map");
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePlaceOrder = () => {
    alert("Order placed successfully!");
    navigate("/dashboard/user");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard/user")}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-orange-50 transition-all shadow-md"
          >
            <FiChevronLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-gray-500 text-sm">Complete your order</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                      step >= num
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step > num ? <FiCheck className="text-xl" /> : num}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${step >= num ? "text-orange-500" : "text-gray-400"}`}>
                    {num === 1 ? "Details" : num === 2 ? "Offers" : "Payment"}
                  </p>
                </div>
                {num < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                      step > num ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Step 1: Delivery Details */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FiMapPin className="text-orange-500 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Delivery Details</h2>
                    <p className="text-gray-500 text-sm">Where should we deliver?</p>
                  </div>
                </div>
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={isLoadingLocation}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoadingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <FiNavigation className="text-lg" />
                      Get Current Location
                    </>
                  )}
                </button>
              </div>

              {/* Interactive Map */}
              <div className="relative">
                <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-3 rounded-t-xl border border-gray-200 border-b-0">
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <IoLocationSharp className="text-orange-500 text-lg" />
                    Click on the map to select your delivery location
                  </p>
                </div>
                <div className="h-[400px] rounded-b-xl overflow-hidden border border-gray-200 shadow-inner">
                  <MapContainer
                    center={mapPosition}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                {deliveryDetails.latitude && deliveryDetails.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-2">
                    <p className="text-xs text-green-700 font-medium">
                      📍 Location selected: {deliveryDetails.latitude.toFixed(4)}, {deliveryDetails.longitude.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiUser className="inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={deliveryDetails.name}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={deliveryDetails.phone}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              {/* Address Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  value={deliveryDetails.address}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="123 Main Street, Apartment 4B"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={deliveryDetails.city}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={deliveryDetails.zipCode}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, zipCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="10001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={deliveryDetails.instructions}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, instructions: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                  rows="3"
                  placeholder="e.g., Ring the doorbell twice, Leave at the door"
                />
              </div>
            </div>
          )}

          {/* Step 2: Coupons & Offers */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiTag className="text-orange-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Coupons & Offers</h2>
                  <p className="text-gray-500 text-sm">Save more on your order</p>
                </div>
              </div>

              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    onClick={() => setSelectedCoupon(selectedCoupon?.id === coupon.id ? null : coupon)}
                    className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      selectedCoupon?.id === coupon.id
                        ? "border-orange-500 bg-orange-50 shadow-lg"
                        : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {coupon.isFreeDelivery ? "🚚" : `${coupon.discount}%`}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{coupon.code}</p>
                          <p className="text-sm text-gray-600">{coupon.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Min. order: ${coupon.minOrder}</p>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedCoupon?.id === coupon.id
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedCoupon?.id === coupon.id && (
                          <FiCheck className="text-white text-sm" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
                <p className="text-sm text-gray-600 mb-2">Have a coupon code?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all">
                    Apply
                  </button>
                </div>
              </div>

              {selectedCoupon && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <FiCheck className="text-green-500 text-xl" />
                  <div>
                    <p className="font-bold text-green-700">Coupon Applied!</p>
                    <p className="text-sm text-green-600">
                      You saved ${discount.toFixed(2)} on this order
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiCreditCard className="text-orange-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Payment Method</h2>
                  <p className="text-gray-500 text-sm">Choose your payment option</p>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === "wallet"
                      ? "border-orange-500 bg-orange-50 shadow-lg"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <IoWalletOutline className="text-2xl" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Wallet Balance</p>
                        <p className="text-sm text-gray-600">Available: $20.04</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "wallet"
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "wallet" && <FiCheck className="text-white text-sm" />}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-orange-500 bg-orange-50 shadow-lg"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <FiCreditCard className="text-2xl" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Credit / Debit Card</p>
                        <p className="text-sm text-gray-600">Pay securely with your card</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "card"
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "card" && <FiCheck className="text-white text-sm" />}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-50 shadow-lg"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                        💵
                      </div>
                      <div>
                        <p className="font-bold text-lg">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "cod"
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "cod" && <FiCheck className="text-white text-sm" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                  {selectedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({selectedCoupon.code})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed pt-2 mt-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-orange-500">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={handlePreviousStep}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all"
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all"
              >
                Place Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
