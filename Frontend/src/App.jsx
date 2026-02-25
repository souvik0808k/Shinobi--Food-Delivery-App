import React, { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { setUserData, clearUserData } from "./redux/userSlice"
import axios from "axios"
import Home from "./pages/Home"
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import ForgotPassword from "./pages/ForgotPassword"
import BasicDetails from "./pages/BasicDetails"
import Restaurants from "./pages/Restaurants"
import RestaurantDetail from "./pages/RestaurantDetail"
import Checkout from "./pages/CheckoutNew"
import AddShop from "./pages/AddShop"
import AddItem from "./pages/AddItem"
import UserDashboard from "./components/UserDashboard"
import OwnerDashboard from "./components/OwnerDashboard"
import DeliveryBoyDashboard from "./components/DeliveryBoyDashboard"
import DashboardRedirect from "./components/DashboardRedirect"

export const serverUrl = "http://localhost:8000"

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { userData, isAuthenticated } = useSelector((state) => state.user);
  
  if (!isAuthenticated || !userData) {
    return <Navigate to="/signin" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  // Verify session on app mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/auth/me`, {
          withCredentials: true
        });
        
        if (response.data.user) {
          dispatch(setUserData(response.data.user));
        }
      } catch (error) {
        // If token is invalid or expired, clear the Redux state
        if (error.response?.status === 401) {
          dispatch(clearUserData());
        }
      }
    };

    // Only verify if we have data in localStorage (Redux persisted state)
    if (isAuthenticated) {
      verifySession();
    }
  }, [dispatch]); // Run only once on mount

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/basic-details" element={<BasicDetails />} />
      
      {/* Restaurant browsing and ordering */}
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/restaurant/:shopId" element={<RestaurantDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      
      {/* Dashboard auto-redirect based on role */}
      <Route path="/dashboard" element={<DashboardRedirect />} />
      
      <Route 
        path="/add-shop" 
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <AddShop />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/add-item" 
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <AddItem />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Routes by Role */}
      <Route 
        path="/dashboard/user" 
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/owner" 
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/deliveryBoy" 
        element={
          <ProtectedRoute allowedRoles={["deliveryBoy"]}>
            <DeliveryBoyDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App