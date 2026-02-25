import { createSlice } from "@reduxjs/toolkit";

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('userState');
    if (serializedState === null) {
      return {
        userData: null,
        city: null,
        isAuthenticated: false
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return {
      userData: null,
      city: null,
      isAuthenticated: false
    };
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: loadState(),
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.isAuthenticated = true;
      // Save to localStorage
      try {
        localStorage.setItem('userState', JSON.stringify(state));
      } catch (err) {
        console.error("Error saving state to localStorage:", err);
      }
    },

    clearUserData: (state) => {
      state.userData = null;
      state.isAuthenticated = false;
      state.city = null;
      // Clear localStorage
      try {
        localStorage.removeItem('userState');
      } catch (err) {
        console.error("Error clearing state from localStorage:", err);
      }
    },

    setCity: (state, action) => {
      state.city = action.payload;
      // Save to localStorage
      try {
        localStorage.setItem('userState', JSON.stringify(state));
      } catch (err) {
        console.error("Error saving state to localStorage:", err);
      }
    }
  }
});

export const { setUserData, clearUserData, setCity } = userSlice.actions;
export default userSlice.reducer;