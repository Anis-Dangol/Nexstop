// components/layout/ClientSideBar.jsx
import { useState, useEffect, Fragment, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Bookmark, ChartNoAxesCombined, Search } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import routesData from "../../assets/routes.json";

export default function ClientSideBar({
  open,
  setOpen,
  onRouteSubmit,
  start,
  setStart,
  end,
  setEnd,
  setRoute,
}) {
  const [tab, setTab] = useState("search");
  const [history, setHistory] = useState([]);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("routeHistory");
    if (saved) setHistory(JSON.parse(saved));
    const fav = localStorage.getItem("routeFavourites");
    if (fav) setFavourites(JSON.parse(fav));
  }, []);

  useEffect(() => {
    localStorage.setItem("routeHistory", JSON.stringify(history));
  }, [history]);
  useEffect(() => {
    localStorage.setItem("routeFavourites", JSON.stringify(favourites));
  }, [favourites]);

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

  useEffect(() => {
    window.setStartInput = (val) => {
      setStart(val);
      setTimeout(() => {
        const el = document.getElementById("start-input");
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 0);
    };
    window.setEndInput = (val) => {
      setEnd(val);
      setTimeout(() => {
        const el = document.getElementById("end-input");
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 0);
    };
    return () => {
      window.setStartInput = undefined;
      window.setEndInput = undefined;
    };
  }, [setStart, setEnd]);

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle
                as="h1"
                className="flex items-center gap-2 ml-5 mt-1 mb-3"
              >
                <ChartNoAxesCombined size={30} />
                Nexstop
              </SheetTitle>
            </SheetHeader>
            <div className="flex gap-2 mt-4 mb-4 ">
              <button
                className={`flex-1 py-2 rounded ${
                  tab === "search" ? "bg-gray-200" : "bg-white"
                }`}
                onClick={() => setTab("search")}
              >
                <span
                  role="img"
                  aria-label="search"
                  className="flex justify-center"
                >
                  <Search className="mx-auto" />
                </span>
              </button>
              <button
                className={`flex-1 py-2 rounded ${
                  tab === "favourite" ? "bg-gray-200" : "bg-white"
                }`}
                onClick={() => setTab("favourite")}
              >
                <span
                  role="img"
                  aria-label="bookmark"
                  className="flex justify-center"
                >
                  <Bookmark className="mx-auto" />
                </span>
              </button>
            </div>
            {tab === "search" ? (
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
                addToFavourites={(route) => {
                  if (
                    !favourites.some(
                      (f) => f.toLowerCase() === route.toLowerCase()
                    )
                  ) {
                    setFavourites([route, ...favourites]);
                  }
                }}
              />
            ) : (
              <FavouriteMenu
                favourites={favourites}
                setFavourites={setFavourites}
                setStart={setStart}
                setEnd={setEnd}
                setRoute={setRoute}
                setOpen={setOpen}
              />
            )}
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
  setRoute,
  allStops,
  addToFavourites,
}) {
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const startRef = useRef();
  const endRef = useRef();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (startRef.current && !startRef.current.contains(e.target)) {
        setStartSuggestions([]);
      }
      if (endRef.current && !endRef.current.contains(e.target)) {
        setEndSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setStartSuggestions([]);
    }
    if (type === "end") {
      setEnd(suggestion);
      setEndSuggestions([]);
    }
  };
  const handleSubmit = (e, customStart, customEnd) => {
    if (e) e.preventDefault();
    const s = customStart !== undefined ? customStart : start;
    const d = customEnd !== undefined ? customEnd : end;
    const trimmedStart = s.trim();
    const trimmedEnd = d.trim();
    if (!trimmedStart || !trimmedEnd) return;
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
    if (!foundRoute) {
      toast({
        title: "No route found",
        description: `No route found between '${trimmedStart}' and '${trimmedEnd}'. Please check your input or try different stops.`,
        variant: "destructive",
      });
      setStart("");
      setEnd("");
      if (typeof setRoute === "function") setRoute([]);
      if (window.clearMapSelectedStops) window.clearMapSelectedStops();
      return; // Do not proceed, do not close sidebar
    }
    if (typeof setRoute === "function") setRoute(foundRoute || []);
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
    handleSubmit(null, s, d);
  };
  const handleDeleteHistory = (idx) => {
    const newHistory = history.filter((_, i) => i !== idx);
    setHistory(newHistory);
  };
  return (
    <nav className="flex-col flex gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative" ref={startRef}>
          <input
            id="start-input"
            type="text"
            className="w-full border rounded px-2 py-1"
            placeholder="Starting location"
            value={start}
            onChange={handleStartChange}
            autoComplete="off"
          />
          {startSuggestions.length > 0 && (
            <ul
              className="absolute bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto z-10"
              style={{ top: "100%" }}
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
        <div className="relative" ref={endRef}>
          <input
            id="end-input"
            type="text"
            className="w-full border rounded px-2 py-1"
            placeholder="Destination"
            value={end}
            onChange={handleEndChange}
            autoComplete="off"
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
        <div className="flex gap-2">
          <Button type="submit" variant="default" className="w-full">
            Get Route
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full bg-[#0F172A] text-white hover:bg-[#1E293B] hover:text-white"
            onClick={() => {
              const trimmedStart = start.trim();
              const trimmedEnd = end.trim();
              if (!trimmedStart || !trimmedEnd) return;
              const newEntry = `${trimmedStart} → ${trimmedEnd}`;
              if (addToFavourites) {
                addToFavourites(newEntry);
                toast({ title: "Route Added" });
              }
            }}
            disabled={!start || !end}
          >
            Add Route
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2"
          onClick={() => {
            setStart("");
            setEnd("");
            if (typeof setRoute === "function") setRoute([]);
            // Do NOT close the sidebar on clear
            // setOpen(false); // <-- removed this line
          }}
          disabled={!start && !end}
        >
          Clear
        </Button>
      </form>
      {history.length > 0 && (
        <div className="mt-4">
          <div className="font-bold mb-2 flex items-center justify-between">
            <span>History</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-red-500 hover:text-red-700 px-2 py-0"
              onClick={() => setHistory([])}
              title="Clear History"
            >
              Clear All
            </Button>
          </div>
          <ul className="space-y-1 max-h-60 overflow-y-auto pr-1">
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

function FavouriteMenu({
  favourites,
  setFavourites,
  setStart,
  setEnd,
  setRoute,
  setOpen,
}) {
  const handleDeleteFavourite = (idx) => {
    setFavourites(favourites.filter((_, i) => i !== idx));
  };
  const handleFavouriteClick = (item) => {
    const [s, d] = item.split(" → ");
    if (setStart) setStart(s);
    if (setEnd) setEnd(d);
    if (setRoute) {
      // mimic handleSubmit logic from history
      const trimmedStart = s.trim();
      const trimmedEnd = d.trim();
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
      if (!foundRoute) {
        const all = (() => {
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
        const startStop = all.find(
          (stop) => stop.name.toLowerCase() === trimmedStart.toLowerCase()
        );
        const endStop = all.find(
          (stop) => stop.name.toLowerCase() === trimmedEnd.toLowerCase()
        );
        if (startStop && endStop) foundRoute = [startStop, endStop];
      }
      setRoute(foundRoute || []);
    }
    if (setOpen) setOpen(false);
  };

  return (
    <div className="flex-col flex gap-4">
      <div className="font-bold text-lg">Favourites</div>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
        {favourites.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No favourites yet. Add some routes to favourites.
          </div>
        ) : (
          favourites.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-100 rounded px-3 py-2 cursor-pointer hover:bg-blue-200"
              onClick={() => handleFavouriteClick(item)}
            >
              <div className="flex-1">{item}</div>
              <button
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFavourite(idx);
                }}
                title="Remove from favourites"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
