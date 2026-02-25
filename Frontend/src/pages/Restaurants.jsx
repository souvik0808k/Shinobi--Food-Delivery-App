import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiMapPin, FiClock, FiStar, FiNavigation } from "react-icons/fi";

// Haversine formula to calculate distance between two coordinates in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

const Restaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchRestaurants();
    }
  }, [userLocation]);

  useEffect(() => {
    if (searchCity.trim() === "") {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((shop) =>
        shop.city.toLowerCase().includes(searchCity.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchCity, restaurants]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Phagwara, Punjab if location not available
          setUserLocation({
            latitude: 31.2254,
            longitude: 75.7728
          });
        }
      );
    } else {
      // Default location
      setUserLocation({
        latitude: 31.2254,
        longitude: 75.7728
      });
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/shop/all?isActive=true");
      
      if (response.data.success) {
        // Calculate distance for each restaurant
        const restaurantsWithDistance = response.data.shops.map(shop => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            shop.location.latitude,
            shop.location.longitude
          );
          return { ...shop, distance };
        });

        // Filter restaurants within 10km and sort by distance
        const nearbyRestaurants = restaurantsWithDistance
          .filter(shop => shop.distance <= 10)
          .sort((a, b) => a.distance - b.distance);

        setRestaurants(nearbyRestaurants);
        setFilteredRestaurants(nearbyRestaurants);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantClick = (shopId) => {
    navigate(`/restaurant/${shopId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Shinobi Restaurants
            </h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Location Display */}
        {userLocation && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-3xl" />
                <div>
                  <h2 className="text-xl font-bold">Restaurants Near You</h2>
                  <p className="text-orange-100 text-sm">
                    Within 10km radius • {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              <button
                onClick={getUserLocation}
                className="flex items-center gap-2 px-4 py-2 bg-white text-orange-500 rounded-lg hover:bg-orange-50 transition font-semibold"
              >
                <FiNavigation className="text-lg" />
                Refresh
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <FiSearch className="text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search by city..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="flex-1 outline-none text-lg"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            Found <span className="font-bold text-orange-500">{filteredRestaurants.length}</span> restaurants nearby
            {searchCity && ` in "${searchCity}"`}
          </p>
        </div>

        {/* Restaurants Grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No restaurants found nearby</h3>
            <p className="text-gray-500">No restaurants within 10km of your location</p>
            <button
              onClick={getUserLocation}
              className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2 mx-auto"
            >
              <FiNavigation />
              Refresh Location
            </button>
          </div>
        ) : (
          <div>
            {/* Horizontal Scrollable Cards */}
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide">
              {filteredRestaurants.map((shop) => (
                <div
                  key={shop._id}
                  onClick={() => handleRestaurantClick(shop._id)}
                  className="flex-shrink-0 w-80 bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer transform transition hover:scale-105 hover:shadow-2xl snap-start"
                >
                  {/* Restaurant Image */}
                  <div className="relative h-56 bg-gradient-to-br from-orange-200 to-red-200">
                    {shop.images && shop.images.length > 0 ? (
                      <img
                        src={shop.images[0]}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-7xl">
                        🍽️
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {shop.isActive ? (
                        <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          ● Open
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          ● Closed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {shop.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {shop.description || "Delicious food awaits you!"}
                    </p>

                    {/* Distance - Prominent */}
                    <div className="mb-4">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-base font-bold inline-flex items-center gap-2">
                        📍 {shop.distance.toFixed(1)} km away
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FiMapPin className="text-orange-500 text-lg" />
                      <span className="text-sm font-medium">{shop.city}</span>
                    </div>

                    {/* Timing */}
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <FiClock className="text-orange-500 text-lg" />
                      <span className="text-sm font-medium">
                        {shop.openTime} - {shop.closeTime}
                      </span>
                    </div>

                    {/* Rating & Orders */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                      <div className="flex items-center gap-2">
                        <FiStar className="text-yellow-500 fill-yellow-500 text-xl" />
                        <span className="font-bold text-gray-800 text-lg">
                          {shop.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 font-semibold">
                        {shop.totalOrders}+ orders
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll Hint */}
            <p className="text-center text-gray-400 text-sm mt-4">
              ← Swipe to see more restaurants →
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
