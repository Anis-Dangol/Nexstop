import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/AuthSlice";
import adminReducer from "./admin-slice/AdminSlice";

const map = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
});

export default map;
