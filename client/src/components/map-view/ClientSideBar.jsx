// components/layout/ClientSideBar.jsx
import { Fragment, useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { ChartNoAxesCombined } from "lucide-react";

export default function ClientSideBar({
  open,
  setOpen,
  onRouteSubmit,
  start,
  setStart,
  end,
  setEnd,
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

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-2 mb-5">
                <ChartNoAxesCombined size={30} />
                <h1 className="text-2xl font-extrabold">Nexstop</h1>
              </SheetTitle>
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
}) {
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
        <input
          type="text"
          placeholder="Start location"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Destination"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Get Route
        </button>
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
