import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCity } from "../redux/userSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log("Lat:", latitude);
          console.log("Lng:", longitude);

          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );

          console.log(result.data);

          const city =
            result.data.results[0]?.city ||
            result.data.results[0]?.state ||
            "Unknown";

          const address = result.data.results[0]?.formatted || "Unknown location";

          console.log("City:", city);

          // Store city and coordinates in Redux
          dispatch(setCity({ 
            name: city, 
            lat: latitude, 
            lon: longitude,
            address: address 
          }));

        } catch (error) {
          console.log("Geo API Error:", error.message);
        }
      },
      (error) => {
        console.log("Location Error:", error.message);
      }
    );
  }, [apiKey, dispatch]);
}

export default useGetCity;