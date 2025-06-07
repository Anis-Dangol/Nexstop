// components/layout/ClientSideBar.jsx
import { Fragment, useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { MapPin } from "lucide-react"; // Replace ChartNoAxesCombined with MapPin
import { Button } from "../ui/button"; // Import the Button component
import BottomSheet from "./BottomSheet"; // Import BottomSheet component

export default function ClientSideBar({
  open,
  setOpen,
  onRouteSubmit,
  start,
  setStart,
  end,
  setEnd,
}) {
  const [history, setHistory] = useState([]);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false); // State for bottom sheet visibility
  const [routeData, setRouteData] = useState(null); // State for route data

  // On mount, load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("routeHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // When history changes, save to localStorage
  useEffect(() => {
    localStorage.setItem("routeHistory", JSON.stringify(history));
  }, [history]);

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-2 mb-5">
                <MapPin size={30} /> {/* Updated icon */}
                <h1 className="text-2xl font-extrabold text-[#070f18]">
                  Nexstop
                </h1>{" "}
                {/* Updated design */}
              </SheetTitle>
            </SheetHeader>
            <ClientMenuItems
              setOpen={setOpen}
              onRouteSubmit={onRouteSubmit} // Use updated handler
              start={start}
              setStart={setStart}
              end={end}
              setEnd={setEnd}
              history={history}
              setHistory={setHistory}
            />
          </div>
        </SheetContent>
      </Sheet>
      {/* Bottom Sheet */}
      {routeData && (
        <BottomSheet
          isOpen={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
        >
          <div>
            <h2 className="text-lg font-bold">Route Details</h2>
            <p>Start: {routeData.start}</p>
            <p>End: {routeData.end}</p>
          </div>
        </BottomSheet>
      )}
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
}) {
  const [busStops, setBusStops] = useState([]);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);

  // Fetch bus stops data on mount
  useEffect(() => {
    fetch("/busstops.json")
      .then((response) => response.json())
      .then((data) => setBusStops(data))
      .catch((error) => console.error("Failed to fetch bus stops:", error));
  }, []);

  const handleStartChange = (e) => {
    const value = e.target.value;
    setStart(value);
    setStartSuggestions(
      busStops.filter((stop) =>
        stop.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleEndChange = (e) => {
    const value = e.target.value;
    setEnd(value);
    setEndSuggestions(
      busStops.filter((stop) =>
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
    onRouteSubmit(trimmedStart, trimmedEnd);
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
