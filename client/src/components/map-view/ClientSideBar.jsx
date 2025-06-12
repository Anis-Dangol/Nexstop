// components/layout/ClientSideBar.jsx
import { Fragment, useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { ChartNoAxesCombined } from "lucide-react";
import { Button } from "../ui/button"; // Import the Button component
import routesData from "../../assets/routes.json";

export default function ClientSideBar({
  open,
  setOpen,
  onRouteSubmit,
  start,
  setStart,
  end,
  setEnd,
  setRoute, // Accept setRoute
}) {
  // Add history state here
  const [history, setHistory] = useState([]);

  // On mount, load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("routeHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // When history changes, save to localStorage
  useEffect(() => {
    localStorage.setItem("routeHistory", JSON.stringify(history));
  }, [history]);

  // Extract all unique stops from routes.json
  const allStops = (() => {
    const stopSet = new Set();
    const stops = [];
    routesData.forEach((route) => {
      route.stops.forEach((stop) => {
        const key = `${stop.lat},${stop.lon}`;
        if (!stopSet.has(key)) {
          stopSet.add(key);
          stops.push(stop);
        }
      });
    });
    return stops;
  })();

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle as="h1" className="flex gap-2 mt-2 mb-5">
                <ChartNoAxesCombined size={30} />
                Nexstop
              </SheetTitle>
              <p
                id="sidebar-description"
                className="text-xs text-muted-foreground mt-1"
              >
                Enter your start and destination bus stop names to get a route.
              </p>
            </SheetHeader>
            <ClientMenuItems
              setOpen={setOpen}
              onRouteSubmit={onRouteSubmit}
              start={start}
              setStart={setStart}
              end={end}
              setEnd={setEnd}
              history={history}
              setHistory={setHistory}
              setRoute={setRoute}
              allStops={allStops}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

function ClientMenuItems({
  setOpen,
  onRouteSubmit,
  start,
  setStart,
  end,
  setEnd,
  history,
  setHistory,
  setRoute,
  allStops,
}) {
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);

  // Suggestion logic using allStops
  const handleStartChange = (e) => {
    const value = e.target.value;
    setStart(value);
    setStartSuggestions(
      allStops.filter((stop) =>
        stop.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleEndChange = (e) => {
    const value = e.target.value;
    setEnd(value);
    setEndSuggestions(
      allStops.filter((stop) =>
        stop.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleSuggestionClick = (type, suggestion) => {
    if (type === "start") {
      setStart(suggestion);
      setStartSuggestions([]); // Clear suggestions
    }
    if (type === "end") {
      setEnd(suggestion);
      setEndSuggestions([]); // Clear suggestions
    }
  };

  const handleSubmit = (e, customStart, customEnd) => {
    if (e) e.preventDefault();
    // Use custom values if provided (for history click), else use current state
    const s = customStart !== undefined ? customStart : start;
    const d = customEnd !== undefined ? customEnd : end;
    const trimmedStart = s.trim();
    const trimmedEnd = d.trim();
    if (!trimmedStart || !trimmedEnd) return;
    // Find the route between the two stops using routes.json
    let foundRoute = null;
    for (const route of routesData) {
      const stops = route.stops;
      const startIndex = stops.findIndex(
        (stop) => stop.name.toLowerCase() === trimmedStart.toLowerCase()
      );
      const endIndex = stops.findIndex(
        (stop) => stop.name.toLowerCase() === trimmedEnd.toLowerCase()
      );
      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
        foundRoute = stops.slice(startIndex, endIndex + 1);
        break;
      }
    }
    // fallback: just find the stops by name if not on same route
    if (!foundRoute) {
      const all = allStops;
      const startStop = all.find(
        (stop) => stop.name.toLowerCase() === trimmedStart.toLowerCase()
      );
      const endStop = all.find(
        (stop) => stop.name.toLowerCase() === trimmedEnd.toLowerCase()
      );
      if (startStop && endStop) foundRoute = [startStop, endStop];
    }
    if (typeof setRoute === "function") setRoute(foundRoute || []);
    // Do NOT call onRouteSubmit(trimmedStart, trimmedEnd) if it triggers a server call
    const newEntry = `${trimmedStart} → ${trimmedEnd}`;
    if (!history.some((h) => h.toLowerCase() === newEntry.toLowerCase())) {
      setHistory([newEntry, ...history]);
    }
    setOpen(false);
  };

  const handleHistoryClick = (item) => {
    const [s, d] = item.split(" → ");
    setStart(s);
    setEnd(d);
    // Automatically search
    handleSubmit(null, s, d);
  };

  const handleDeleteHistory = (idx) => {
    const newHistory = history.filter((_, i) => i !== idx);
    setHistory(newHistory);
  };

  return (
    <nav className="mt-8 flex-col flex gap-4">
      {/* Route Search Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Start location"
            value={start}
            onChange={handleStartChange}
            onBlur={() => setTimeout(() => setStartSuggestions([]), 200)} // Delay clearing suggestions
            className="p-2 border rounded"
          />
          {startSuggestions.length > 0 && (
            <ul
              className="absolute bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto z-10"
              style={{ top: "100%" }} // Ensure it appears below the input field
            >
              {startSuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() =>
                    handleSuggestionClick("start", suggestion.name)
                  }
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Destination"
            value={end}
            onChange={handleEndChange}
            onBlur={() => setTimeout(() => setEndSuggestions([]), 200)} // Delay clearing suggestions
            className="p-2 border rounded"
          />
          {endSuggestions.length > 0 && (
            <ul className="absolute bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto">
              {endSuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSuggestionClick("end", suggestion.name)}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button type="submit" variant="default" className="w-full">
          Get Route
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2"
          onClick={() => {
            setStart("");
            setEnd("");
            if (typeof setRoute === "function") setRoute([]);
            setOpen(false); // Close the sidebar when clearing
          }}
          disabled={!start && !end}
        >
          Clear
        </Button>
      </form>
      {/* History List */}
      {history.length > 0 && (
        <div className="mt-4">
          <div className="font-bold mb-2">History</div>
          <ul className="space-y-1">
            {history.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center text-sm bg-gray-100 rounded px-2 py-1 cursor-pointer hover:bg-blue-200"
              >
                <span
                  className="flex-1"
                  onClick={() => handleHistoryClick(item)}
                >
                  {item}
                </span>
                <button
                  className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistory(idx);
                  }}
                  title="Delete"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
