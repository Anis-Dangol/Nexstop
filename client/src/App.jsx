import "./App.css";
import { Route, Routes } from "react-router-dom";

import AuthLayout from "./components/auth/AuthLayout";
import AuthLogin from "./pages/auth-page/AuthLogin";
import AuthRegister from "./pages/auth-page/AuthRegister";

import AdminLayout from "./components/admin-view/AdminLayout";
import AdminDashboard from "./pages/admin-page/AdminDashboard";
import AdminUsers from "./pages/admin-page/AdminUsers";
import AdminBusStops from "./pages/admin-page/AdminBusStops";
import AdminBusRoutes from "./pages/admin-page/AdminBusRoutes";
import AdminTransfers from "./pages/admin-page/AdminTransfers";

import NotFound from "./pages/not-found/NotFound";
import MappingHome from "./pages/map-home/MappingHome";
import CheckAuth from "./components/common/CheckAuth";
import UnauthPage from "./pages/unauth-page/UnauthPage";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./map/auth-slice/AuthSlice";
import { Skeleton } from "@/components/ui/skeleton";
import MappingLayout from "./components/map-view/MappingLayout";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading)
    return <Skeleton className={"w=[800px] bg-black h-[1000px] "} />;

  console.log(isLoading, user);

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            ></CheckAuth>
          }
        />
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>

        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >        ping github.com
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} /> {/* Add this line */}
          <Route path="bus-stops" element={<AdminBusStops />} />
          <Route path="bus-routes" element={<AdminBusRoutes />} />
          <Route path="transfers" element={<AdminTransfers />} />
        </Route>

        <Route
          path="/map"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <MappingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<MappingHome />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="/unauth-page" element={<UnauthPage />} />
      </Routes>
    </div>
  );
}

export default App;
