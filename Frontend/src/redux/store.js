import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import shopReducer from "./shopSlice";
import cartReducer from "./cartSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    shop: shopReducer,
    cart: cartReducer,
  }
});

export default store;