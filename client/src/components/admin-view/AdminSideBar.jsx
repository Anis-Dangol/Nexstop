import {
  LayoutDashboard,
  Users,
  MapPin,
  Route,
  ArrowLeftRight,
  Bus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Map,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/map/auth-slice/AuthSlice";

function AdminSideBar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Users", icon: Users, path: "/admin/users" },
    { label: "Bus Stops", icon: MapPin, path: "/admin/bus-stops" },
    { label: "Bus Routes", icon: Route, path: "/admin/bus-routes" },
    { label: "Transfers", icon: ArrowLeftRight, path: "/admin/transfers" },
    { label: "Bus Names", icon: Bus, path: "/admin/bus-names" },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Show "User View" if admin and not already in /map
  const showUserView =
    location.pathname &&
    !location.pathname.startsWith("/map") &&
    (JSON.parse(localStorage.getItem("persist:root") || "{}")?.auth
      ? JSON.parse(
          JSON.parse(localStorage.getItem("persist:root")).auth
        )?.user?.role === "admin"
      : true);

  return (
    <div
      className={clsx(
        "h-screen bg-[#070f18] text-[#E6E0D3] shadow-lg flex flex-col justify-between transition-all duration-300 ease-in-out fixed left-0 top-0 z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Top Part */}
      <div>
        {/* Logo & Collapse Button */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1f1f1f]">
          {!collapsed && (
            <span className="flex items-center gap-2 w-full justify-center">
              <MapPin size={28} className="text-[#E6E0D3]" />
              <h1 className="text-2xl font-bold">Nexstop</h1>
            </span>
          )}
          <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? (
              <ChevronRight size={20} className="text-white" />
            ) : (
              <ChevronLeft size={20} className="text-white" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-2">
          {menuItems.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={clsx(
                  "flex items-center py-2 text-left transition-colors",
                  collapsed ? "justify-center px-2" : "gap-3 px-4",
                  isActive
                    ? "bg-gray-800 text-white shadow-lg"
                    : "hover:bg-[#1f1f1f] text-[#E6E0D3]"
                )}
              >
                <Icon size={20} />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User View Button & Logout */}
      <div className="mb-4 flex flex-col items-center gap-2">
        {showUserView && (
          <button
            onClick={() => navigate("/map/home")}
            className={clsx(
              "flex items-center rounded-md px-4 py-2 text-sm font-medium shadow bg-blue-600 text-white hover:bg-blue-700 transition",
              collapsed ? "justify-center px-2" : "gap-2"
            )}
            title="Switch to User View"
          >
            <Map />
            {!collapsed && <span>User View</span>}
          </button>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center text-left py-2 hover:bg-[#1f1f1f] transition-colors ${
            collapsed ? "justify-center px-2" : "gap-3 px-4"
          }`}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default AdminSideBar;
