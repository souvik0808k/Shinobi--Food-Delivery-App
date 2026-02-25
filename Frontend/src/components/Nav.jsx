import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiShoppingCart } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

function Nav({ cartCount = 0 }) {
  const navigate = useNavigate();
  const currentUser = useGetCurrentUser();
  const city = useSelector((state) => state.user.city);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  };

  return (
    <header className="flex justify-between items-center mb-8 bg-white rounded-2xl p-6 shadow-sm">
      {/* Left: Welcome Message */}
      <div>
        <p className="text-gray-400 text-sm">
          {getGreeting()} {currentUser?.fullName?.split(" ")[0] || "Guest"}
        </p>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Welcome Back!
        </h1>
      </div>

      {/* Middle: Location + Search */}
      <div className="flex items-center gap-3">
        {/* Location Box */}
        {city && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 hover:shadow-md transition-all cursor-pointer group">
            <IoLocationOutline className="text-orange-500 text-lg group-hover:scale-110 transition-transform" />
            <span className="font-medium text-gray-700 text-sm">{city.name}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search food, restaurants..."
            className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 w-96 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right: Cart, Notification, Profile */}
      <div className="flex items-center gap-3">
        {/* Cart Icon */}
        <button 
          onClick={() => {}} 
          className="relative w-11 h-11 bg-gray-50 hover:bg-orange-50 rounded-xl text-gray-600 hover:text-orange-500 transition-all flex items-center justify-center group"
        >
          <FiShoppingCart className="text-xl group-hover:scale-110 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {cartCount}
            </span>
          )}
        </button>

        {/* Notification Icon */}
        <button className="relative w-11 h-11 bg-gray-50 hover:bg-orange-50 rounded-xl text-gray-600 hover:text-orange-500 transition-all flex items-center justify-center group">
          <FiBell className="text-xl group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        {currentUser?.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt="Profile"
            className="w-11 h-11 rounded-xl border-2 border-orange-400 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/profile")}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-xl border-2 border-orange-400 bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center font-bold text-white cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/profile")}
          >
            {currentUser?.fullName?.charAt(0) || "U"}
          </div>
        )}
      </div>
    </header>
  );
}

export default Nav;