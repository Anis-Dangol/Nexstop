// components/layout/ClientSideBar.jsx
import { Fragment } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { ChartNoAxesCombined } from "lucide-react";

function ClientMenuItems({
  setOpen,
  onRouteSubmit,
  start,
  setStart,
  end,
  setEnd,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onRouteSubmit(start, end); // Call the parent handler
    setOpen(false);
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
    </nav>
  );
}

export default function ClientSideBar({
  open,
  setOpen,
  onRouteSubmit,
  start,
  setStart,
  end,
  setEnd,
}) {
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
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}
