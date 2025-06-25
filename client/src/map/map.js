import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/AuthSlice";

const map = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default map;
