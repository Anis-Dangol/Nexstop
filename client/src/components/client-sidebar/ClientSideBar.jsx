import { useState, useEffect, Fragment } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Bookmark, ChartNoAxesCombined, Search } from "lucide-react";
import routesData from "../../assets/routes.json";
import ClientMenuItems from "./ClientMenuItems";
import FavouriteMenu from "./FavouriteMenu";

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

    // Functions for nearest stop marker
    window.addNearestStopMarker = (stop) => {
      // This will be handled by MapContainerWrapper
      window.nearestStopData = stop;
      window.showNearestMarker = true;
      if (window.updateNearestMarker) {
        window.updateNearestMarker(stop);
      }
    };

    window.removeNearestStopMarker = () => {
      window.nearestStopData = null;
      window.showNearestMarker = false;
      if (window.updateNearestMarker) {
        window.updateNearestMarker(null);
      }
    };

    return () => {
      window.setStartInput = undefined;
      window.setEndInput = undefined;
      window.addNearestStopMarker = undefined;
      window.removeNearestStopMarker = undefined;
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
    </Fragment>
  );
}
