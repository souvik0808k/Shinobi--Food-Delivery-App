import { createSlice } from "@reduxjs/toolkit";

const loadCartState = () => {
  try {
    const serializedState = localStorage.getItem("cart");
    if (serializedState === null) {
      return {
        items: [],
        shopId: null,
        shopName: null,
        totalAmount: 0,
        totalItems: 0,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading cart state from localStorage:", err);
    return {
      items: [],
      shopId: null,
      shopName: null,
      totalAmount: 0,
      totalItems: 0,
    };
  }
};

const saveCartState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("cart", serializedState);
  } catch (err) {
    console.error("Error saving cart state to localStorage:", err);
  }
};

const calculateTotals = (items) => {
  return {
    totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

const initialState = loadCartState();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { itemId, name, price, shopId, shopName, category } = action.payload;
      
      // If cart has items from different shop, clear cart first
      if (state.shopId && state.shopId !== shopId) {
        state.items = [];
        state.shopId = shopId;
        state.shopName = shopName;
      }
      
      // Set shop info if first item
      if (!state.shopId) {
        state.shopId = shopId;
        state.shopName = shopName;
      }
      
      // Check if item already exists
      const existingItem = state.items.find(item => item.itemId === itemId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          itemId,
          name,
          price,
          category,
          quantity: 1,
        });
      }
      
      // Calculate totals
      const totals = calculateTotals(state.items);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      
      saveCartState(state);
    },
    
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.itemId !== itemId);
      
      // Clear shop info if cart is empty
      if (state.items.length === 0) {
        state.shopId = null;
        state.shopName = null;
        state.totalAmount = 0;
        state.totalItems = 0;
      } else {
        const totals = calculateTotals(state.items);
        state.totalAmount = totals.totalAmount;
        state.totalItems = totals.totalItems;
      }
      
      saveCartState(state);
    },
    
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.itemId === itemId);
      
      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter(item => item.itemId !== itemId);
          
          if (state.items.length === 0) {
            state.shopId = null;
            state.shopName = null;
            state.totalAmount = 0;
            state.totalItems = 0;
          }
        } else {
          item.quantity = quantity;
        }
        
        if (state.items.length > 0) {
          const totals = calculateTotals(state.items);
          state.totalAmount = totals.totalAmount;
          state.totalItems = totals.totalItems;
        }
      }
      
      saveCartState(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.shopId = null;
      state.shopName = null;
      state.totalAmount = 0;
      state.totalItems = 0;
      saveCartState(state);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
