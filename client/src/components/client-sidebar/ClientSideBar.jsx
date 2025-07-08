import { useState, useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Bookmark, ChartNoAxesCombined, Search } from "lucide-react";
import { fetchBusRoutes } from "../../services/busRoutes";
import ClientMenuItems from "./ClientMenuItems";
import FavouriteMenu from "./FavouriteMenu";
import favouriteRoutesService from "../../services/favouriteRoutes";

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
  const [routesData, setRoutesData] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(false);

  // Get user from Redux store
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Load routes data from MongoDB
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setRoutesLoading(true);
        const routes = await fetchBusRoutes();
        setRoutesData(routes);
      } catch (error) {
        console.error("Failed to load routes:", error);
        setRoutesData([]);
      } finally {
        setRoutesLoading(false);
      }
    };
    loadRoutes();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("routeHistory");
    if (saved) setHistory(JSON.parse(saved));

    // Load favourites from API if user is authenticated
    if (isAuthenticated && user?.id) {
      loadFavourites();
    } else {
      // Fallback to localStorage for non-authenticated users
      const fav = localStorage.getItem("routeFavourites");
      if (fav) setFavourites(JSON.parse(fav));
    }
  }, [isAuthenticated, user]);

  // Function to load favourites from API
  const loadFavourites = async () => {
    if (!user?.id) return;

    setIsLoadingFavourites(true);
    try {
      const response = await favouriteRoutesService.getFavouriteRoutes(user.id);
      // Convert API format to display format for backward compatibility
      const formattedFavourites = response.favourites.map((fav) =>
        favouriteRoutesService.formatRouteFromAPI(fav)
      );
      setFavourites(formattedFavourites);
    } catch (error) {
      console.error("Failed to load favourites:", error);
      // Fallback to localStorage on error
      const fav = localStorage.getItem("routeFavourites");
      if (fav) setFavourites(JSON.parse(fav));
    } finally {
      setIsLoadingFavourites(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("routeHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    // Only save to localStorage if user is not authenticated
    if (!isAuthenticated) {
      localStorage.setItem("routeFavourites", JSON.stringify(favourites));
    }
  }, [favourites, isAuthenticated]);

  // Function to add a route to favourites
  const addToFavourites = async (routeString) => {
    // Check for duplicates
    if (favourites.some((f) => f.toLowerCase() === routeString.toLowerCase())) {
      return;
    }

    if (isAuthenticated && user?.id) {
      // Save to API
      try {
        const routeData = favouriteRoutesService.formatRouteForAPI(
          routeString,
          user.id
        );
        await favouriteRoutesService.addFavouriteRoute(routeData);

        // Update local state
        setFavourites([routeString, ...favourites]);
      } catch (error) {
        console.error("Failed to add favourite to API:", error);
        // Fallback to localStorage
        setFavourites([routeString, ...favourites]);
      }
    } else {
      // Save to localStorage for non-authenticated users
      setFavourites([routeString, ...favourites]);
    }
  };

  // Function to remove a route from favourites
  const removeFromFavourites = async (routeString) => {
    if (isAuthenticated && user?.id) {
      // Remove from API
      try {
        const [startLocation, endLocation] = routeString.split(" → ");
        await favouriteRoutesService.removeFavouriteRouteByLocation(
          user.id,
          startLocation.trim(),
          endLocation.trim()
        );

        // Update local state
        setFavourites(favourites.filter((f) => f !== routeString));
      } catch (error) {
        console.error("Failed to remove favourite from API:", error);
        // Still update local state even if API call fails
        setFavourites(favourites.filter((f) => f !== routeString));
      }
    } else {
      // Remove from localStorage for non-authenticated users
      setFavourites(favourites.filter((f) => f !== routeString));
    }
  };

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
                addToFavourites={addToFavourites}
                routesData={routesData}
                routesLoading={routesLoading}
              />
            ) : (
              <FavouriteMenu
                favourites={favourites}
                setFavourites={setFavourites}
                removeFromFavourites={removeFromFavourites}
                setStart={setStart}
                setEnd={setEnd}
                setRoute={setRoute}
                setOpen={setOpen}
                isLoading={isLoadingFavourites}
                routesData={routesData}
                routesLoading={routesLoading}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}
