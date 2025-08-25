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
  busRouteStats: [],
  busStopStats: [],
  transferStats: [],
  busNameStats: [],
  fareConfigStats: [],
  dashboardStats: {
    users: 0,
    busStops: 0,
    busRoutes: 0,
    transfers: 0,
    busNames: 0,
    fareConfigs: 0,
  },
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

export const fetchDashboardStats = createAsyncThunk(
  "/admin/fetchDashboardStats",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/statistics/dashboard",
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const fetchBusRouteStats = createAsyncThunk(
  "/admin/fetchBusRouteStats",
  async ({ year, month = null }) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    if (month) params.append("month", month);

    const response = await axios.get(
      `http://localhost:5000/api/statistics/bus-routes?${params.toString()}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const fetchBusStopStats = createAsyncThunk(
  "/admin/fetchBusStopStats",
  async ({ year, month = null }) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    if (month) params.append("month", month);

    const response = await axios.get(
      `http://localhost:5000/api/statistics/bus-stops?${params.toString()}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const fetchTransferStats = createAsyncThunk(
  "/admin/fetchTransferStats",
  async ({ year, month = null }) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    if (month) params.append("month", month);

    const response = await axios.get(
      `http://localhost:5000/api/statistics/transfers?${params.toString()}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const fetchBusNameStats = createAsyncThunk(
  "/admin/fetchBusNameStats",
  async ({ year, month = null }) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    if (month) params.append("month", month);

    const response = await axios.get(
      `http://localhost:5000/api/statistics/bus-names?${params.toString()}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const fetchFareConfigStats = createAsyncThunk(
  "/admin/fetchFareConfigStats",
  async ({ year, month = null }) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    if (month) params.append("month", month);

    const response = await axios.get(
      `http://localhost:5000/api/statistics/fare-configs?${params.toString()}`,
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
      })
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.dashboardStats = action.payload.data;
        }
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchBusRouteStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusRouteStats.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.busRouteStats = action.payload.data;
        }
      })
      .addCase(fetchBusRouteStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchBusStopStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusStopStats.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.busStopStats = action.payload.data;
        }
      })
      .addCase(fetchBusStopStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTransferStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransferStats.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.transferStats = action.payload.data;
        }
      })
      .addCase(fetchTransferStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchBusNameStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusNameStats.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.busNameStats = action.payload.data;
        }
      })
      .addCase(fetchBusNameStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchFareConfigStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFareConfigStats.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.fareConfigStats = action.payload.data;
        }
      })
      .addCase(fetchFareConfigStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
