import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { serverUrl } from "../App"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"

function BasicDetails() {
  const primaryColor = "#ff4d2d"
  const hoverColor = "#e64323"
  const bgColor = "#fff9f6"
  const borderColor = "#ddd"

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  // Get Google user data from navigation state
  const googleUser = location.state?.googleUser

  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")

  // Redirect if no Google user data
  if (!googleUser) {
    navigate("/signup")
    return null
  }

  const handleSubmit = async () => {
    // Validation
    if (!mobile) {
      alert("Mobile number is required")
      return
    }
    
    if (mobile.length < 10) {
      alert("Mobile number must be at least 10 digits")
      return
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/google-signup`,
        {
          fullName: googleUser.displayName,
          email: googleUser.email,
          mobile,
          password: password || undefined, // Optional
          role,
          googleId: googleUser.uid,
          photoURL: googleUser.photoURL
        },
        { withCredentials: true }
      )
      console.log(result.data)
      
      // Store user data in Redux
      dispatch(setUserData(result.data.user))
      
      alert("Account created successfully!")
      
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
      const errorMsg = error.response?.data?.message || "Failed to complete signup. Please try again."
      alert(errorMsg)
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
          Complete your profile to get started
        </p>

        {/* Google User Info */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
          {googleUser.photoURL && (
            <img
              src={googleUser.photoURL}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-gray-800">{googleUser.displayName}</p>
            <p className="text-sm text-gray-500">{googleUser.email}</p>
          </div>
        </div>

        <form className="space-y-4">
          {/* Mobile (Required) */}
          <div className="mb-4">
            <label htmlFor="mobile" className="block text-gray-700 font-medium mb-1">
              Mobile Number <span style={{ color: primaryColor }}>*</span>
            </label>
            <input
              id="mobile"
              type="text"
              placeholder="Enter your Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ border: `1px solid ${borderColor}` }}
              onFocus={(e) => (e.target.style.borderColor = primaryColor)}
              onBlur={(e) => (e.target.style.borderColor = borderColor)}
            />
          </div>

          {/* Password (Optional) */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password <span className="text-sm text-gray-500">(Optional)</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="Set a password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ border: `1px solid ${borderColor}` }}
              onFocus={(e) => (e.target.style.borderColor = primaryColor)}
              onBlur={(e) => (e.target.style.borderColor = borderColor)}
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use Google Sign-In without a password
            </p>
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

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 mt-6 hover:shadow-lg"
            style={{ backgroundColor: primaryColor }}
            onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
            onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
          >
            Complete Sign Up
          </button>

          {/* Back to Sign Up */}
          <p className="text-center text-sm text-gray-600 mt-6">
            <span
              className="font-semibold cursor-pointer hover:underline"
              style={{ color: primaryColor }}
              onClick={() => navigate("/signup")}
            >
              ← Back to Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default BasicDetails
