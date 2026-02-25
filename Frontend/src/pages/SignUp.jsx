import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import axios from "axios"
import { serverUrl } from "../App"
import { auth, googleProvider } from "../../firebase"
import { signInWithPopup } from "firebase/auth"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"

function SignUp() {
  const primaryColor = "#ff4d2d"
  const hoverColor = "#e64323"
  const bgColor = "#fff9f6"
  const borderColor = "#ddd"

  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("user")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")

  const handleSignUp = async () => {
    // Validation
    if (!fullName || !email || !password || !mobile) {
      alert("Please fill in all fields");
      return;
    }
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    
    if (mobile.length < 10) {
      alert("Mobile number must be at least 10 digits");
      return;
    }

    try {
      const result = await axios.post(`${serverUrl}/api/auth/signup`, {
        fullName, email, password, mobile, role
      }, { withCredentials: true })
      console.log(result.data)
      
      // Store user data in Redux
      dispatch(setUserData(result.data.user))
      
      alert("Account created successfully!")
      
      // Navigate to role-based dashboard
      if (role === 'user') {
        navigate('/dashboard/user')
      } else if (role === 'owner') {
        navigate('/add-shop')
      } else if (role === 'deliveryBoy') {
        navigate('/dashboard/deliveryBoy')
      } else {
        navigate('/')
      }
    } catch (error) {
      console.log(error)
      const errorMsg = error.response?.data?.message || "Signup failed. Please try again."
      alert(errorMsg)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      console.log("Google User:", user)
      
      // Navigate to BasicDetails page with Google user data
      navigate("/basic-details", {
        state: {
          googleUser: {
            displayName: user.displayName,
            email: user.email,
            uid: user.uid,
            photoURL: user.photoURL
          }
        }
      })
    } catch (error) {
      console.log(error)
      alert("Google sign-in failed. Please try again.")
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border"
        style={{ borderColor }}
      >
        {/* Brand */}
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: primaryColor }}
        >
          Shinobi 🥷
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          Create your account to get started with delicious food deliveries
        </p>

        <form className="space-y-4">

          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ border: `1px solid ${borderColor}` }}
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = borderColor}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ border: `1px solid ${borderColor}` }}
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = borderColor}
            />
          </div>

          {/* Mobile */}
          <div className="mb-4">
            <label htmlFor="mobile" className="block text-gray-700 font-medium mb-1">
              Mobile
            </label>
            <input
              id="mobile"
              type="text"
              placeholder="Enter your Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ border: `1px solid ${borderColor}` }}
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = borderColor}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none pr-10"
                style={{ border: `1px solid ${borderColor}` }}
                onFocus={(e) => e.target.style.borderColor = primaryColor}
                onBlur={(e) => e.target.style.borderColor = borderColor}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 cursor-pointer top-[10px] text-gray-500 hover:text-gray-700"
              >
                {!showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 font-medium mb-1">
              Role
            </label>
            <div className="flex gap-3 mt-2">
              {[
                { value: "user", label: "User" },
                { value: "owner", label: "Restaurant Owner" },
                { value: "deliveryBoy", label: "Delivery Partner" }
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setRole(item.value)}
                  className="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: role === item.value ? primaryColor : "white",
                    color: role === item.value ? "white" : "#555",
                    borderColor: role === item.value ? primaryColor : borderColor
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="button"
            onClick={handleSignUp}
            className="w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 mt-6 hover:shadow-lg"
            style={{ backgroundColor: primaryColor }}
            onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
            onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
          >
            Create Account
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
            style={{ borderColor }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
            Sign up with Google
          </button>

          {/* Already have account */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <span
              className="font-semibold cursor-pointer hover:underline"
              style={{ color: primaryColor }}
              onClick={() => navigate("/signin")}
            >
              Sign In
            </span>
          </p>

        </form>
      </div>
    </div>
  )
}

export default SignUp