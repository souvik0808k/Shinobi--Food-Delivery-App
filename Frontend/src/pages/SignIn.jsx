import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import axios from "axios"
import { serverUrl } from "../App"
import { auth, googleProvider } from "../../firebase"
import { signInWithPopup } from "firebase/auth"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"

function SignIn() {
  const primaryColor = "#ff4d2d"
  const hoverColor = "#e64323"
  const bgColor = "#fff9f6"
  const borderColor = "#ddd"

  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [emailOrMobile, setEmailOrMobile] = useState("")
  const [password, setPassword] = useState("")

  const handleSignIn = async () => {
    // Validation
    if (!emailOrMobile || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const result = await axios.post(`${serverUrl}/api/auth/signin`, {
        emailOrMobile,
        password
      }, { withCredentials: true })
      console.log(result.data)
      
      // Store user data in Redux
      dispatch(setUserData(result.data.user))
      
      alert(`Welcome back, ${result.data.user.fullName}!`)
      
      // Navigate to role-based dashboard
      const role = result.data.user.role
      if (role === 'user') {
        navigate('/dashboard/user')
      } else if (role === 'owner') {
        navigate('/dashboard/owner')
      } else if (role === 'deliveryBoy') {
        navigate('/dashboard/deliveryBoy')
      } else {
        navigate('/')
      }
    } catch (error) {
      console.log(error)
      const errorMsg = error.response?.data?.message || "Sign in failed. Please try again."
      alert(errorMsg)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      console.log("Google User:", user)
      
      // Check if user exists in backend
      try {
        const response = await axios.post(
          `${serverUrl}/api/auth/google-signin`,
          {
            email: user.email,
            googleId: user.uid,
            fullName: user.displayName,
            photoURL: user.photoURL
          },
          { withCredentials: true }
        )
        
        console.log(response.data)
        
        // Store user data in Redux
        dispatch(setUserData(response.data.user))
        
        alert(`Welcome back, ${response.data.user.fullName}!`)
        
        // Navigate to role-based dashboard
        const role = response.data.user.role
        if (role === 'user') {
          navigate('/dashboard/user')
        } else if (role === 'owner') {
          navigate('/dashboard/owner')
        } else if (role === 'deliveryBoy') {
          navigate('/dashboard/deliveryBoy')
        } else {
          navigate('/')
        }
      } catch (error) {
        // If user doesn't exist, redirect to basic details
        if (error.response?.status === 404) {
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
        } else {
          const errorMsg = error.response?.data?.message || "Google sign-in failed."
          alert(errorMsg)
        }
      }
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
          Welcome back! Sign in to continue ordering delicious food
        </p>

        <form className="space-y-4">

          {/* Email or Mobile */}
          <div className="mb-4">
            <label htmlFor="emailOrMobile" className="block text-gray-700 font-medium mb-1">
              Email or Mobile
            </label>
            <input
              id="emailOrMobile"
              type="text"
              placeholder="Enter your Email or Mobile Number"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
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

          {/* Forgot Password */}
          <div className="flex justify-end mb-4">
            <span
              className="text-sm cursor-pointer hover:underline"
              style={{ color: primaryColor }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          {/* Sign In Button */}
          <button
            type="button"
            onClick={handleSignIn}
            className="w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 mt-6 hover:shadow-lg"
            style={{ backgroundColor: primaryColor }}
            onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
            onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
            style={{ borderColor }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>

          {/* Create Account Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <span
              className="font-semibold cursor-pointer hover:underline"
              style={{ color: primaryColor }}
              onClick={() => navigate("/signup")}
            >
              Create New Account
            </span>
          </p>

        </form>
      </div>
    </div>
  )
}

export default SignIn