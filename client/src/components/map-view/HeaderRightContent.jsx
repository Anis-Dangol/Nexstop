import { AlignJustify, LogOut, MapPin, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/map/auth-slice/AuthSlice";
import UserLocationInput from "./UserLocationInput";

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logoutUser());
  }

  function handleSwitchToAdmin() {
    // Check if user is admin before allowing switch
    if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      // You can show a toast or alert here if needed
      console.log("Access denied: Admin privileges required");
    }
  }

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-black cursor-pointer">
            {" "}
            {/* Added cursor-pointer */}
            <AvatarFallback className="bg-[#E6E0D3] text-[#070f18] font-extrabold">
              {user?.userName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          className="w-56 mt-2 border-[#070f18] bg-[#E6E0D3]"
        >
          <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#070f18]" />
          {user?.role === "admin" && (
            <>
              <DropdownMenuItem onClick={handleSwitchToAdmin}>
                <Settings className="mr-2 h-4 w-4" />
                Switch to Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#070f18]" />
            </>
          )}
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function MappingHeader({
  setOpen,
  customUserLocation,
  setCustomUserLocation,
  isMapPickMode,
  startMapPickMode,
}) {
  const { user } = useSelector((state) => state.auth);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [shouldReopenModal, setShouldReopenModal] = useState(false);

  const handleLocationSet = (location) => {
    console.log("HeaderRightContent: Location received:", location);
    setCustomUserLocation(location);

    // If we came from map picking, reopen the modal to show the coordinates
    if (shouldReopenModal) {
      setShouldReopenModal(false);
      setTimeout(() => {
        setShowLocationInput(true);
      }, 100);
    } else {
      setShowLocationInput(false);
    }
    console.log("HeaderRightContent: Location set and modal state updated");
  };

  // Enhanced startMapPickMode that tracks if we should reopen modal
  const enhancedStartMapPickMode = (callback) => {
    setShouldReopenModal(true);
    startMapPickMode((location) => {
      callback(location);
      // The modal will reopen automatically via handleLocationSet
    });
  };

  console.log(user, "useruseruser");

  return (
    <>
      {/* Map Pick Mode Indicator */}
      {isMapPickMode && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">
            Click anywhere on the map to set your location
          </span>
          <button
            onClick={() => {
              console.log("HeaderRightContent: Canceling map pick mode");
              setShouldReopenModal(false);
              setShowLocationInput(true);
            }}
            className="ml-auto bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      <header className="bg-[#070f18] sticky top-0 z-40 w-full border-b border-[#070f18] pt-3 shadow-lg">
        {" "}
        {/* Added shadow */}
        <div className="flex h-1/6 text-xl items-center justify-between px-4 sm:px-6 pt-5">
          <Button onClick={() => setOpen(true)} className="sm:block">
            <AlignJustify />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <Link to="/map/home" className="flex items-center gap-2">
            <MapPin size={30} color="#E6E0D3" /> {/* Updated icon color */}
            <h1 className="font-bold text-[#E6E0D3] text-2xl">Nexstop</h1>{" "}
            {/* Updated design */}
          </Link>

          {/* Desktop */}
          <div className="hidden sm:flex sm:items-center sm:gap-3">
            {/* User Location Button */}
            <button
              onClick={() => {
                console.log(
                  "HeaderRightContent: Opening location input modal with current location:",
                  customUserLocation
                );
                setShowLocationInput(true);
              }}
              className="bg-[#E6E0D3] hover:bg-gray-200 text-[#070f18] p-2 rounded-full shadow-lg border border-gray-200 transition-colors"
              title="Set User Location"
            >
              <MapPin size={18} />
            </button>
            <HeaderRightContent />
          </div>
          {/* Mobile */}
          <div className="flex sm:hidden items-center gap-2">
            {/* User Location Button */}
            <button
              onClick={() => {
                console.log(
                  "HeaderRightContent: Opening location input modal (mobile) with current location:",
                  customUserLocation
                );
                setShowLocationInput(true);
              }}
              className="bg-[#E6E0D3] hover:bg-gray-200 text-[#070f18] p-2 rounded-full shadow-lg border border-gray-200 transition-colors"
              title="Set User Location"
            >
              <MapPin size={16} />
            </button>
            <HeaderRightContent />
          </div>
        </div>
      </header>

      {/* User Location Input Modal */}
      <UserLocationInput
        isOpen={showLocationInput}
        onClose={() => setShowLocationInput(false)}
        onLocationSet={handleLocationSet}
        currentLocation={customUserLocation}
        startMapPickMode={enhancedStartMapPickMode}
      />
    </>
  );
}
