import { createSlice } from "@reduxjs/toolkit";

const loadShopState = () => {
  try {
    const serializedState = localStorage.getItem("shop");
    if (serializedState === null) {
      return {
        shopData: null,
        items: [],
        hasShop: false,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading shop state from localStorage:", err);
    return {
      shopData: null,
      items: [],
      hasShop: false,
    };
  }
};

const initialState = loadShopState();

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShopData: (state, action) => {
      state.shopData = action.payload;
      state.hasShop = true;
      try {
        localStorage.setItem("shop", JSON.stringify(state));
      } catch (err) {
        console.error("Error saving shop state to localStorage:", err);
      }
    },
    setItems: (state, action) => {
      state.items = action.payload;
      try {
        localStorage.setItem("shop", JSON.stringify(state));
      } catch (err) {
        console.error("Error saving shop state to localStorage:", err);
      }
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
      try {
        localStorage.setItem("shop", JSON.stringify(state));
      } catch (err) {
        console.error("Error saving shop state to localStorage:", err);
      }
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      try {
        localStorage.setItem("shop", JSON.stringify(state));
      } catch (err) {
        console.error("Error saving shop state to localStorage:", err);
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      try {
        localStorage.setItem("shop", JSON.stringify(state));
      } catch (err) {
        console.error("Error saving shop state to localStorage:", err);
      }
    },
    clearShopData: (state) => {
      state.shopData = null;
      state.items = [];
      state.hasShop = false;
      try {
        localStorage.removeItem("shop");
      } catch (err) {
        console.error("Error removing shop state from localStorage:", err);
      }
    },
  },
});

export const {
  setShopData,
  setItems,
  addItem,
  updateItem,
  removeItem,
  clearShopData,
} = shopSlice.actions;

export default shopSlice.reducer;
