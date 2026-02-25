import { useSelector } from "react-redux";

// Custom hook to get current user from Redux store
const useGetCurrentUser = () => {
  const userData = useSelector((state) => state.user.userData);
  return userData;
};

export default useGetCurrentUser;