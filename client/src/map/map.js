import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/AuthSlice";
import adminReducer from "./admin-slice/AdminSlice";
import { fareApi } from "./admin-slice/fareSlice";

const map = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    [fareApi.reducerPath]: fareApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(fareApi.middleware),
});

export default map;
