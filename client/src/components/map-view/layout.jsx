import { useState } from "react";
import { Outlet } from "react-router-dom";
import { MappingHeader } from "./header";
import ClientSideBar from "../client-sidebar/ClientSideBar";
import MapContainerWrapper from "./MapContainerWrapper";

function MappingLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);
  // Lifted state for start and end
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [route, setRoute] = useState([]);

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
      />{" "}
      {/* 👈 sidebar */}
      <div className="flex-1 flex flex-col">
        <MappingHeader setOpen={setOpenSidebar} /> {/* 👈 pass setter */}
        <main className="flex flex-col w-full">
          {/* Pass route as prop to MapContainerWrapper if needed */}
          <MapContainerWrapper route={route} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MappingLayout;
