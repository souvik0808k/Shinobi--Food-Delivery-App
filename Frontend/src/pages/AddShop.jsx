import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setShopData as setShopDataRedux } from "../redux/shopSlice";
import { 
  FiMapPin, 
  FiImage, 
  FiShoppingBag, 
  FiPhone, 
  FiClock,
  FiCheck,
  FiX
} from "react-icons/fi";
import { IoLocationSharp } from "react-icons/io5";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

function AddShop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();

  const [shopData, setShopData] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    latitude: null,
    longitude: null,
    openTime: "09:00",
    closeTime: "22:00",
    images: []
  });

  const [locationStatus, setLocationStatus] = useState("idle"); // idle, loading, success, error
  const [imagePreview, setImagePreview] = useState([]);

  // Get live location
  const getLocation = () => {
    setLocationStatus("loading");
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocationStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setShopData({
          ...shopData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationStatus("success");
      },
      (error) => {
        console.error("Location Error:", error);
        alert("Unable to get location. Please enable location services.");
        setLocationStatus("error");
      }
    );
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreview.length > 5) {
      alert("You can upload maximum 5 images");
      return;
    }

    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagePreview([...imagePreview, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setShopData({ ...shopData, images: [...shopData.images, ...files] });
  };

  const removeImage = (index) => {
    setImagePreview(imagePreview.filter((_, i) => i !== index));
    setShopData({ 
      ...shopData, 
      images: shopData.images.filter((_, i) => i !== index) 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!shopData.name || !shopData.phone || !shopData.address || !shopData.city) {
      alert("Please fill in all required fields");
      return;
    }

    if (!shopData.latitude || !shopData.longitude) {
      alert("Please enable location to proceed");
      return;
    }

    if (imagePreview.length === 0) {
      alert("Please upload at least one shop image");
      return;
    }

    try {
      // For now, we'll send image URLs as base64 strings
      // In production, you should upload to cloud storage like Cloudinary
      const response = await axios.post(
        `${serverUrl}/api/shop/create`,
        {
          name: shopData.name,
          description: shopData.description,
          phone: shopData.phone,
          address: shopData.address,
          city: shopData.city,
          zipCode: shopData.zipCode,
          latitude: shopData.latitude,
          longitude: shopData.longitude,
          openTime: shopData.openTime,
          closeTime: shopData.closeTime,
          images: imagePreview, // Using base64 strings for now
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Store shop data in Redux
        dispatch(setShopDataRedux(response.data.shop));
        
        alert("Shop added successfully!");
        navigate("/add-item");
      }
    } catch (error) {
      console.error("Error creating shop:", error);
      const errorMsg = error.response?.data?.message || "Failed to create shop. Please try again.";
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard/owner")}
            className="text-gray-600 hover:text-orange-500 flex items-center gap-2 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Add Your Shop
          </h1>
          <p className="text-gray-600 mt-2">Fill in the details to register your shop on our platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Details */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FiShoppingBag className="text-orange-500 text-xl" />
              </div>
              <h2 className="text-2xl font-bold">Shop Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shop Name *
                </label>
                <input
                  type="text"
                  value={shopData.name}
                  onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="e.g., Souvik's Delicious Food Corner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={shopData.description}
                  onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                  rows="3"
                  placeholder="Brief description of your shop and specialties..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={shopData.phone}
                    onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="+91 1234567890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shopData.city}
                    onChange={(e) => setShopData({ ...shopData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="e.g., Phagwara"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  value={shopData.address}
                  onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="Street, Landmark, Area"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={shopData.zipCode}
                    onChange={(e) => setShopData({ ...shopData, zipCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="144401"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiClock className="inline mr-2" />
                    Opening Time *
                  </label>
                  <input
                    type="time"
                    value={shopData.openTime}
                    onChange={(e) => setShopData({ ...shopData, openTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiClock className="inline mr-2" />
                    Closing Time *
                  </label>
                  <input
                    type="time"
                    value={shopData.closeTime}
                    onChange={(e) => setShopData({ ...shopData, closeTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Location */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <IoLocationSharp className="text-orange-500 text-xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Shop Location *</h2>
                <p className="text-sm text-gray-500">Enable location so users can find your shop nearby</p>
              </div>
            </div>

            <div className="space-y-4">
              {locationStatus === "idle" && (
                <button
                  type="button"
                  onClick={getLocation}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <FiMapPin className="text-xl" />
                  Get Current Location
                </button>
              )}

              {locationStatus === "loading" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-700 font-medium">Getting your location...</p>
                </div>
              )}

              {locationStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FiCheck className="text-green-500 text-2xl" />
                    <p className="text-green-700 font-bold">Location Captured Successfully!</p>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📍 Latitude: {shopData.latitude?.toFixed(6)}</p>
                    <p>📍 Longitude: {shopData.longitude?.toFixed(6)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={getLocation}
                    className="mt-3 text-orange-500 font-medium text-sm hover:text-orange-600"
                  >
                    Update Location
                  </button>
                </div>
              )}

              {locationStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FiX className="text-red-500 text-2xl" />
                    <p className="text-red-700 font-bold">Failed to get location</p>
                  </div>
                  <button
                    type="button"
                    onClick={getLocation}
                    className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Shop Images */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FiImage className="text-orange-500 text-xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Shop Images *</h2>
                <p className="text-sm text-gray-500">Upload up to 5 images (First image will be the cover)</p>
              </div>
            </div>

            <div className="space-y-4">
              {imagePreview.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all">
                  <FiImage className="text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload images</p>
                  <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}

              {imagePreview.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {imagePreview.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Shop ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-bold">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-600"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Register Shop & Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddShop;
