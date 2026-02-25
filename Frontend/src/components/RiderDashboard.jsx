import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { clearUserData } from "../redux/userSlice"
import useGetCurrentUser from "../hooks/useGetCurrentUser"

const RiderDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useGetCurrentUser()

  const handleLogout = () => {
    dispatch(clearUserData())
    navigate("/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl w-full text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Delivery Rider Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            Welcome, {currentUser?.fullName}!
          </p>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-orange-800 mb-2">
            🚧 Coming Soon
          </h2>
          <p className="text-orange-700">
            The Rider Dashboard is currently under development. You'll be able to view assigned orders, navigate routes, and manage deliveries here.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <h3 className="font-semibold text-gray-700 mb-1">📋 Upcoming Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>View assigned delivery orders</li>
              <li>Real-time navigation and route optimization</li>
              <li>Update delivery status</li>
              <li>Track earnings and completed deliveries</li>
              <li>Customer contact and support</li>
            </ul>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default RiderDashboard