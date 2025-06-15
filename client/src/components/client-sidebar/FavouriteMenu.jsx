import routesData from "../../assets/routes.json";

export default function FavouriteMenu({
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
