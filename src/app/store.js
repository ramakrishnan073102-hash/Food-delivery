import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/cartSlice";
import menuReducer from "../features/menu/menuSlice";
import ordersReducer from "../features/orders/ordersSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    menu: menuReducer,
    orders: ordersReducer,
  },
});