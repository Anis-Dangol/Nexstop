import express from "express";
import BusRoute from "../../models/BusRoute.js";

const router = express.Router();

router.post("/route", async (req, res) => {
  const { start, end } = req.body;

  try {
    // Get routes data from MongoDB
    const routes = await BusRoute.find();

    console.log(`Looking for route from "${start}" to "${end}"`);

    let directRoute = null;
    let transferRoute = null;

    // Search for direct routes
    for (const route of routes) {
      const stops = route.stops;
      const startIndex = stops.findIndex(
        (stop) => stop.name.toLowerCase() === start.toLowerCase()
      );
      const endIndex = stops.findIndex(
        (stop) => stop.name.toLowerCase() === end.toLowerCase()
      );

      if (startIndex !== -1 && endIndex !== -1) {
        if (startIndex <= endIndex) {
          // Normal forward route
          directRoute = stops.slice(startIndex, endIndex + 1);
          console.log(
            `Direct route found: ${directRoute.map((s) => s.name).join(" → ")}`
          );
          break;
        } else {
          // Check if this is a circular route
          const firstStop = stops[0];
          const lastStop = stops[stops.length - 1];
          const isCircular =
            firstStop.name.toLowerCase() === lastStop.name.toLowerCase();

          if (isCircular) {
            directRoute = [
              ...stops.slice(startIndex),
              ...stops.slice(0, endIndex + 1),
            ];
            console.log(
              `Circular route found: ${directRoute
                .map((s) => s.name)
                .join(" → ")}`
            );
            break;
          }
        }
      }
    }

    // If no direct route is found, search for transfer routes
    if (!directRoute) {
      for (const route1 of routes) {
        const stops1 = route1.stops;
        const startIndex = stops1.findIndex(
          (stop) => stop.name.toLowerCase() === start.toLowerCase()
        );

        if (startIndex !== -1) {
          for (const route2 of routes) {
            if (route1 === route2) continue; // Skip the same route

            const stops2 = route2.stops;
            const endIndex = stops2.findIndex(
              (stop) => stop.name.toLowerCase() === end.toLowerCase()
            );

            if (endIndex !== -1) {
              // Find a common transfer point between route1 and route2
              const transferPoint = stops1.find((stop1) =>
                stops2.some(
                  (stop2) => stop1.name.toLowerCase() === stop2.name.toLowerCase()
                )
              );

              if (transferPoint) {
                transferRoute = {
                  route1: stops1.slice(startIndex, stops1.indexOf(transferPoint) + 1),
                  transferPoint: transferPoint.name,
                  route2: stops2.slice(
                    stops2.indexOf(transferPoint),
                    endIndex + 1
                  ),
                };
                console.log(
                  `Transfer route found: ${transferRoute.route1
                    .map((s) => s.name)
                    .join(" → ")} → ${transferRoute.transferPoint} → ${transferRoute.route2
                    .map((s) => s.name)
                    .join(" → ")}`
                );
                break;
              }
            }
          }
        }
      }
    }

    // Respond with the appropriate route
    if (directRoute) {
      res.json({ status: "success", route: directRoute });
    } else if (transferRoute) {
      res.json({ status: "success", transferRoute });
    } else {
      console.log("No route found");
      res.status(404).json({ status: "fail", message: "Route not found" });
    }
  } catch (err) {
    console.error("Error reading route data:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
