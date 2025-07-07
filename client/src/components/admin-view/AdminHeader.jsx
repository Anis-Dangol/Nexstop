import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Show "Switch to User View" if not already in /map
  const showSwitchToUser = !location.pathname.startsWith("/map");

  return (
    <header className="bg-[#070f18] sticky top-0 z-40 w-full border-b border-[#070f18] pt-3 shadow-lg">
      <div className="relative flex h-1/6 text-xl items-center justify-center px-4 sm:px-6 pt-5">
        {/* Centered Title */}
        <div className="absolute left-0 flex items-center gap-2">
          {/* Empty div for spacing/alignment */}
        </div>
        <div className="flex items-center gap-2 mx-auto">
          <h1 className="font-bold text-[#E6E0D3] text-2xl">Admin Panel</h1>
        </div>
        <div className="absolute right-0 flex items-center gap-2 pr-4 sm:pr-6">
          {showSwitchToUser && user?.role === "admin" && (
            <Button
              onClick={() => navigate("/map/home")}
              className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow bg-blue-600 text-white hover:bg-blue-700"
              title="Switch to User View"
            >
              <Map />
              User View
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
