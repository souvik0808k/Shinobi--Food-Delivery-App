import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, ArrowLeft, Clock } from "lucide-react"
import axios from "axios"
import { serverUrl } from "../App"

function ForgotPassword() {
  const primaryColor = "#ff4d2d"
  const hoverColor = "#e64323"
  const bgColor = "#fff9f6"
  const borderColor = "#ddd"

  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  // Step 1: Email
  const [email, setEmail] = useState("")

  // Step 2: OTP
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(300) // 5 minutes = 300 seconds
  const [isExpired, setIsExpired] = useState(false)

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Timer countdown for OTP
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsExpired(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step, timer])

  // Format timer as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }
    
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      )
      console.log(result.data)
      alert("OTP sent to your email!")
      setStep(2)
      setTimer(300) // Reset timer
      setIsExpired(false)
    } catch (error) {
      console.log(error.response?.data || error.message)
      const errorMsg = error.response?.data?.message || "Failed to send OTP. Please try again."
      alert(errorMsg)
    }
  }

  const handleVerifyOtp = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      )
      console.log(result.data)
      alert("OTP verified successfully!")
      setStep(3)
    } catch (error) {
      console.log(error.response?.data || error.message)
      const errorMsg = error.response?.data?.message || "Invalid or expired OTP"
      alert(errorMsg)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      )
      console.log(result.data)
      alert("Password reset successful!")
      navigate("/signin")
    } catch (error) {
      console.log(error.response?.data || error.message)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      )
      console.log(result.data)
      setTimer(300)
      setIsExpired(false)
    } catch (error) {
      console.log(error.response?.data || error.message)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border relative"
        style={{ borderColor }}
      >
        {/* Back Button */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="absolute top-6 left-6 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        )}

        {/* Brand */}
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: primaryColor }}
        >
          Shinobi 🥷
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          {step === 1 && "Enter your email address to reset your password"}
          {step === 2 && "Enter the OTP sent to your email"}
          {step === 3 && "Create a new password for your account"}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="flex items-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step >= num ? "text-white" : "text-gray-400"
                }`}
                style={{
                  backgroundColor: step >= num ? primaryColor : "#e0e0e0"
                }}
              >
                {num}
              </div>
              {num < 3 && (
                <div
                  className="w-12 h-1 mx-1"
                  style={{
                    backgroundColor: step > num ? primaryColor : "#e0e0e0"
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <form className="space-y-4">
          
          {/* STEP 1: Email */}
          {step === 1 && (
            <>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ border: `1px solid ${borderColor}` }}
                  onFocus={(e) => e.target.style.borderColor = primaryColor}
                  onBlur={(e) => e.target.style.borderColor = borderColor}
                />
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 mt-6 hover:shadow-lg"
                style={{ backgroundColor: primaryColor }}
                onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
                onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
              >
                Send OTP
              </button>
            </>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <>
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-lg bg-gray-50">
                <Clock size={18} className="text-gray-600" />
                <span className={`font-semibold ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                  {isExpired ? "OTP Expired!" : `Time remaining: ${formatTime(timer)}`}
                </span>
              </div>

              <div className="mb-4">
                <label htmlFor="otp" className="block text-gray-700 font-medium mb-1">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-center text-2xl tracking-widest"
                  style={{ border: `1px solid ${borderColor}` }}
                  onFocus={(e) => e.target.style.borderColor = primaryColor}
                  onBlur={(e) => e.target.style.borderColor = borderColor}
                  disabled={isExpired}
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isExpired || otp.length !== 4}
                className="w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 mt-6 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: (isExpired || otp.length !== 4) ? '#ccc' : primaryColor 
                }}
                onMouseOver={(e) => {
                  if (!isExpired && otp.length === 4) {
                    e.target.style.backgroundColor = hoverColor
                  }
                }}
                onMouseOut={(e) => {
                  if (!isExpired && otp.length === 4) {
                    e.target.style.backgroundColor = primaryColor
                  }
                }}
              >
                Verify OTP {otp.length > 0 && `(${otp.length}/4)`}
              </button>

              {/* Resend OTP */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm font-medium hover:underline cursor-pointer"
                  style={{ color: primaryColor }}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none pr-10"
                    style={{ border: `1px solid ${borderColor}` }}
                    onFocus={(e) => e.target.style.borderColor = primaryColor}
                    onBlur={(e) => e.target.style.borderColor = borderColor}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 cursor-pointer top-[10px] text-gray-500 hover:text-gray-700"
                  >
                    {!showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <p className={`text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 mt-6 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
                onMouseOver={(e) => newPassword === confirmPassword && (e.target.style.backgroundColor = hoverColor)}
                onMouseOut={(e) => (e.target.style.backgroundColor = primaryColor)}
              >
                Reset Password
              </button>
            </>
          )}

          {/* Back to Sign In */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{" "}
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

export default ForgotPassword