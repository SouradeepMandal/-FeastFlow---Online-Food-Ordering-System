import { createSlice } from '@reduxjs/toolkit';

const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

const initialState = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : { cartItems: [], shippingAddress: {}, paymentMethod: 'Card' };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      const existItem = state.cartItems.find((x) => x.foodItem === item.foodItem);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.foodItem === existItem.foodItem ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      // Calculate items price
      state.itemsPrice = addDecimals(
        state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
      );

      // Calculate delivery fee (if order > 50 then free, else 5)
      state.deliveryFee = addDecimals(state.itemsPrice > 50 ? 0 : 5);

      // Calculate tax price (15% tax)
      state.taxPrice = addDecimals(Number((0.15 * state.itemsPrice).toFixed(2)));

      // Calculate total price
      state.totalPrice = (
        Number(state.itemsPrice) +
        Number(state.deliveryFee) +
        Number(state.taxPrice)
      ).toFixed(2);

      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.foodItem !== action.payload);

      // Recalculate prices
      state.itemsPrice = addDecimals(
        state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
      );
      state.deliveryFee = addDecimals(state.itemsPrice > 50 || state.cartItems.length === 0 ? 0 : 5);
      state.taxPrice = addDecimals(Number((0.15 * state.itemsPrice).toFixed(2)));
      state.totalPrice = (
        Number(state.itemsPrice) +
        Number(state.deliveryFee) +
        Number(state.taxPrice)
      ).toFixed(2);

      localStorage.setItem('cart', JSON.stringify(state));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      state.itemsPrice = 0;
      state.deliveryFee = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;
      localStorage.setItem('cart', JSON.stringify(state));
    },
  },
});

export const { addToCart, removeFromCart, saveShippingAddress, savePaymentMethod, clearCartItems } = cartSlice.actions;
export default cartSlice.reducer;
