import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function DashboardRedirect() {
  const { userData, isAuthenticated } = useSelector((state) => state.user);
  
  if (!isAuthenticated || !userData) {
    return <Navigate to="/signin" replace />;
  }
  
  // Redirect based on user role
  const roleRedirects = {
    user: "/dashboard/user",
    owner: "/dashboard/owner",
    deliveryBoy: "/dashboard/deliveryBoy"
  };
  
  const redirectPath = roleRedirects[userData.role] || "/";
  return <Navigate to={redirectPath} replace />;
}

export default DashboardRedirect;
