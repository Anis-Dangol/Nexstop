import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { MappingHeader } from "./HeaderRightContent";
import ClientSideBar from "../client-sidebar/ClientSideBar";
import MapContainerWrapper from "./MapContainerWrapper";

function MappingLayout() {
  const { user } = useSelector((state) => state.auth);
  const [openSidebar, setOpenSidebar] = useState(false);
  // Lifted state for start and end
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [route, setRoute] = useState([]);
  // Lifted state for user location
  const [customUserLocation, setCustomUserLocation] = useState(null);
  // Map pick mode state
  const [isMapPickMode, setIsMapPickMode] = useState(false);
  const [pendingLocationHandler, setPendingLocationHandler] = useState(null);

  // Handle map click location
  const handleMapLocationPick = (location) => {
    if (pendingLocationHandler) {
      pendingLocationHandler(location);
      setPendingLocationHandler(null);
    }
    setIsMapPickMode(false);
    setCustomUserLocation(location);
  };

  // Start map pick mode
  const startMapPickMode = (onLocationPicked) => {
    setIsMapPickMode(true);
    setPendingLocationHandler(() => onLocationPicked);
  };

  // Fetch route from backend and update state
  const fetchRoute = async (start, end) => {
    try {
      const res = await fetch("http://localhost:5000/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setRoute(data.route);
      } else {
        alert(data.message);
        setRoute([]);
      }
    } catch (err) {
      console.log(err);
      alert("Failed to fetch route");
      setRoute([]);
    }
  };

  return (
    <div className="flex bg-[#E6E0D3] min-h-screen">
      <ClientSideBar
        open={openSidebar}
        setOpen={setOpenSidebar}
        start={start}
        setStart={setStart}
        end={end}
        setEnd={setEnd}
        onRouteSubmit={fetchRoute}
        setRoute={setRoute} // Pass setRoute to sidebar
        customUserLocation={customUserLocation} // Pass custom user location
      />{" "}
      {/* 👈 sidebar */}
      <div className="flex-1 flex flex-col">
        <MappingHeader
          setOpen={setOpenSidebar}
          customUserLocation={customUserLocation}
          setCustomUserLocation={setCustomUserLocation}
          isMapPickMode={isMapPickMode}
          startMapPickMode={startMapPickMode}
        />{" "}
        {/* 👈 pass setter */}
        <main className="flex flex-col w-full">
          {/* Pass route as prop to MapContainerWrapper if needed */}
          <MapContainerWrapper
            route={route}
            customUserLocation={customUserLocation}
            setCustomUserLocation={setCustomUserLocation}
            isMapPickMode={isMapPickMode}
            onMapLocationPick={handleMapLocationPick}
            userRole={user?.role}
          />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MappingLayout;
