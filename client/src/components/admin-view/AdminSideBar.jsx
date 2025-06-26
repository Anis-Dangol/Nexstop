import {
  LayoutDashboard,
  Users,
  MapPin,
  Route,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/map/auth-slice/AuthSlice";

function AdminSideBar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Users", icon: Users, path: "/admin/users" },
    { label: "Bus Stops", icon: MapPin, path: "/admin/bus-stops" },
    { label: "Bus Routes", icon: Route, path: "/admin/bus-routes" },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div
      className={clsx(
        "h-screen bg-[#070f18] text-[#E6E0D3] shadow-lg flex flex-col justify-between transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Top Part */}
      <div>
        {/* Logo & Collapse Button */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1f1f1f]">
          {!collapsed && <h1 className="text-2xl font-bold">Nexstop</h1>}
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
          {menuItems.map(({ label, icon: Icon, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`flex items-center py-2 text-left hover:bg-[#1f1f1f] transition-colors ${
                collapsed ? "justify-center px-2" : "gap-3 px-4"
              }`}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
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
