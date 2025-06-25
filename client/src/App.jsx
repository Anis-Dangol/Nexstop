import "./App.css";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/AdminLayout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/AdminLayout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminUsers from "./pages/admin-view/users"; // Add this line
import AdminBusStops from "./pages/admin-view/bus-stops";
import AdminBusRoutes from "./pages/admin-view/bus-routes";
import NotFound from "./pages/not-found";
import MappingHome from "./pages/map-view/home";
import CheckAuth from "./components/common/CheckAuth";
import UnauthPage from "./pages/unauth-page";
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
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} /> {/* Add this line */}
          <Route path="bus-stops" element={<AdminBusStops />} />
          <Route path="bus-routes" element={<AdminBusRoutes />} />
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
