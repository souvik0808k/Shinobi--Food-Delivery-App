import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { clearUserData } from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../App";
import { 
  FiTruck, 
  FiHeart, 
  FiUsers, 
  FiShoppingBag,
  FiClock,
  FiStar,
  FiArrowRight,
  FiCheckCircle,
  FiMapPin
} from "react-icons/fi";
import { IoFastFoodOutline, IoRestaurantOutline } from "react-icons/io5";

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(clearUserData());
      alert("Logged out successfully!");
    } catch (error) {
      console.log(error);
      dispatch(clearUserData());
    }
  };

  // If user is logged in, show simple user info
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Shinobi 🥷
          </h1>
          <div className="mb-6 p-6 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
            {currentUser.photoURL && (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-20 h-20 rounded-full mx-auto mb-4"
              />
            )}
            <p className="text-2xl font-bold text-gray-800 mb-2">
              Welcome, {currentUser.fullName}!
            </p>
            <p className="text-gray-600 mb-1">{currentUser.email}</p>
            <p className="text-sm text-orange-500 font-semibold">
              Role: {currentUser.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold transition-all duration-200 hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Landing page for non-logged-in users
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <FiTruck className="text-white text-2xl" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Shinobi
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Home</a>
            <a href="#about" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">About</a>
            <a href="#features" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Features</a>
            <a href="#partners" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Partners</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/signin")}
              className="px-5 py-2 text-gray-700 font-semibold hover:text-orange-500 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate(currentUser ? "/restaurants" : "/signup")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:shadow-lg hover:shadow-orange-200 transition-all"
            >
              Order Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8 animate-fadeIn">
          <div className="inline-block bg-orange-100 px-4 py-2 rounded-full">
            <p className="text-orange-600 font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Welcome to Shinobi 🥷
            </p>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            We Are the <span className="text-orange-500">Fastest</span> In<br />
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Delivering
            </span> Your <span className="text-orange-500">Food</span>
            <span className="inline-block ml-2 animate-bounce">🍕</span>
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed">
            Order food from your favorite restaurants and get it delivered to your doorstep in minutes. 
            Fast, reliable, and delicious! 🚀
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(currentUser ? "/restaurants" : "/signup")}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg hover:shadow-xl hover:shadow-orange-200 transition-all flex items-center gap-3"
            >
              <FiShoppingBag className="text-xl" />
              ORDER FOOD NOW
              <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg"
                >
                  {i === 1 ? "😋" : i === 2 ? "🤤" : i === 3 ? "😍" : "🥳"}
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold text-gray-800">Our Happy Customers</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FiStar key={i} className="text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-sm text-gray-600 ml-1">5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Hero Image */}
        <div className="relative animate-fadeIn">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-orange-200 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-[3rem] p-8 shadow-2xl">
            <div className="text-center text-white mb-6">
              <div className="w-48 h-48 mx-auto bg-orange-400 rounded-full flex items-center justify-center mb-4 shadow-xl relative">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
                <span className="text-8xl z-10">🍕</span>
              </div>
              <div className="space-y-2">
                <div className="inline-block bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <p className="font-bold text-lg">Delicious Pizza 🔥</p>
                </div>
                <p className="text-sm opacity-90">Fresh ingredients, delivered hot!</p>
              </div>
            </div>
            
            {/* Floating food icons */}
            <div className="absolute top-10 -left-6 text-4xl animate-bounce delay-300">🍔</div>
            <div className="absolute top-20 -right-6 text-3xl animate-bounce delay-500">🍟</div>
            <div className="absolute bottom-20 -left-8 text-3xl animate-bounce delay-700">🥗</div>
            <div className="absolute -top-4 right-10 text-2xl animate-bounce">🌮</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why <span className="text-orange-500">Choose Us?</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Experience the best food delivery service in town
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all border border-orange-100 hover:border-orange-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-200">
                <FiTruck className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Fast delivery guaranteed, get it hot from oven. On time delivery is our priority!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all border border-orange-100 hover:border-orange-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-200">
                <FiHeart className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Friendly Courier</h3>
              <p className="text-gray-600 leading-relaxed">
                Our courier team is proven their friendliness and professionalism.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all border border-orange-100 hover:border-orange-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-200">
                <IoRestaurantOutline className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Best Resto Partner</h3>
              <p className="text-gray-600 leading-relaxed">
                Our restaurant partners have been carefully selected. Quality is our priority!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-orange-500 font-bold mb-2 uppercase tracking-wide">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Get your favorite food<br />
              <span className="text-orange-500">in an easy way</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-200">
                <span className="text-3xl">📱</span>
              </div>
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 mt-4">Browse Menu</h3>
              <p className="text-gray-600">
                Browse hundreds of restaurants and dishes. Find your favorites!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-200">
                <span className="text-3xl">🛒</span>
              </div>
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 mt-4">Place Order</h3>
              <p className="text-gray-600">
                Select your meal, customize it and checkout with secure payment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-200">
                <span className="text-3xl">🚴</span>
              </div>
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 mt-4">Fast Delivery</h3>
              <p className="text-gray-600">
                Track your order in real-time and get it delivered hot to your door!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner CTA Section */}
      <section id="partners" className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Restaurant Owners */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 hover:bg-white/20 transition-all border border-white/20">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <IoRestaurantOutline className="text-orange-500 text-3xl" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Restaurant Owners</h3>
              <p className="text-orange-50 mb-6 text-lg">
                Grow your business with Shinobi! Add your restaurant and reach thousands of hungry customers. 
                <strong className="block mt-2">Join for FREE! 🎉</strong>
              </p>
              <button
                onClick={() => navigate("/signup")}
                className="bg-white text-orange-500 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3 group"
              >
                Add Your Store
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Delivery Partners */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 hover:bg-white/20 transition-all border border-white/20">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <FiTruck className="text-orange-500 text-3xl" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Delivery Partners</h3>
              <p className="text-orange-50 mb-6 text-lg">
                Earn money on your schedule! Join our delivery team and become part of the fastest delivery service. 
                <strong className="block mt-2">Sign up for FREE! 🚀</strong>
              </p>
              <button
                onClick={() => navigate("/signup")}
                className="bg-white text-orange-500 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3 group"
              >
                Become a Partner
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiTruck className="text-white text-2xl" />
            </div>
            <span className="text-2xl font-bold">Shinobi</span>
          </div>
          <p className="text-gray-400 mb-4">
            The fastest food delivery platform in town 🥷
          </p>
          <p className="text-gray-500 text-sm">
            © 2026 Shinobi. All rights reserved. Made with ❤️ and 🍕
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
