import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  userCount: 0,
  busStatistics: {
    totalRoutes: 0,
    totalBusStops: 0,
  },
  userRegistrationStats: [],
  error: null,
};

export const fetchUserCount = createAsyncThunk(
  "/admin/fetchUserCount",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/auth/user-count",
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const fetchBusStatistics = createAsyncThunk(
  "/admin/fetchBusStatistics",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/bus/statistics",
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const fetchUserRegistrationStats = createAsyncThunk(
  "/admin/fetchUserRegistrationStats",
  async ({ year, month = null }) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    if (month) params.append("month", month);

    const response = await axios.get(
      `http://localhost:5000/api/auth/user-registration-stats?${params.toString()}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userCount = action.payload.success ? action.payload.count : 0;
      })
      .addCase(fetchUserCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchBusStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.busStatistics = action.payload.statistics;
        }
      })
      .addCase(fetchBusStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserRegistrationStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRegistrationStats.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.userRegistrationStats = action.payload.data;
        }
      })
      .addCase(fetchUserRegistrationStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
