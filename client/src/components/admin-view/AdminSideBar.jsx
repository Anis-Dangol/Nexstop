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
          {!collapsed && <h1 className="text-2xl font-bold">Admin Panel</h1>}
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

      {/* Logout */}
      <div className="mb-4">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full text-left py-2 hover:bg-[#1f1f1f] transition-colors ${
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
