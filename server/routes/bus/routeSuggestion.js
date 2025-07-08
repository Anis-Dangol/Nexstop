import express from "express";
import BusRoute from "../../models/BusRoute.js";

const router = express.Router();

router.post("/route", async (req, res) => {
  const { start, end } = req.body;

  try {
    // Get routes data from MongoDB
    const routes = await BusRoute.find();

    console.log(`Looking for route from "${start}" to "${end}"`);

    let foundRoute = null;

    // Search through all routes for a path from start to end (including circular routes)
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
          foundRoute = stops.slice(startIndex, endIndex + 1);
          console.log(
            `Forward route found: ${foundRoute.map((s) => s.name).join(" → ")}`
          );
          break;
        } else {
          // Check if this is a circular route
          const firstStop = stops[0];
          const lastStop = stops[stops.length - 1];
          const isCircular =
            firstStop.name.toLowerCase() === lastStop.name.toLowerCase();

          if (isCircular) {
            // Create circular route: from start to end of array + from beginning to end
            foundRoute = [
              ...stops.slice(startIndex),
              ...stops.slice(0, endIndex + 1),
            ];
            console.log(
              `Circular route found: ${foundRoute
                .map((s) => s.name)
                .join(" → ")}`
            );
            break;
          }
        }
      }
    }

    if (foundRoute) {
      res.json({ status: "success", route: foundRoute });
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
