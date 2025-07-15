import express from "express";
import BusRoute from "../../models/BusRoute.js";
import { getFareForDistance } from "./fare-controller.js";
import { calculateDistance } from "../distance/distanceUtils.js";

const router = express.Router();

router.post("/estimate-fare", async (req, res) => {
  try {
    const { start, end, route } = req.body;
    console.log("Estimate fare request:", { start, end, route });

    // Get routes data from MongoDB
    const routesData = await BusRoute.find();

    // Flatten all stops (unique by name)
    const allStops = [];
    const stopSet = new Set();
    for (const routeData of routesData) {
      for (const stop of routeData.stops) {
        if (!stopSet.has(stop.name)) {
          stopSet.add(stop.name);
          allStops.push(stop);
        }
      }
    }

    // Helper: normalize
    const norm = (s) => s && s.trim().toLowerCase();
    const normStart = norm(start);
    const normEnd = norm(end);

    // Find closest matching stops (case-insensitive, partial)
    const findBestMatch = (target, stops) => {
      let exact = stops.find((s) => norm(s.name) === target);
      if (exact) return exact;
      let partial = stops.find(
        (s) => norm(s.name).includes(target) || target.includes(norm(s.name))
      );
      return partial || null;
    };
    const startStop = findBestMatch(normStart, allStops);
    const endStop = findBestMatch(normEnd, allStops);

    if (!startStop || !endStop) {
      return res.status(404).json({
        error: "Start or end stop not found.",
        availableStops: allStops.map((s) => s.name),
      });
    }

    let totalDistance;

    // If route is provided, calculate route-based distance
    if (route && Array.isArray(route) && route.length > 1) {
      totalDistance = 0;
      for (let i = 0; i < route.length - 1; i++) {
        const currentStop = route[i];
        const nextStop = route[i + 1];

        if (
          currentStop.lat &&
          currentStop.lon &&
          nextStop.lat &&
          nextStop.lon
        ) {
          const segmentDistance = calculateDistance(
            currentStop.lat,
            currentStop.lon,
            nextStop.lat,
            nextStop.lon
          );
          totalDistance += segmentDistance;
        }
      }
      console.log("Route-based distance calculated:", totalDistance);
    } else {
      // Fallback: Calculate straight-line (haversine) distance
      totalDistance = calculateDistance(
        startStop.lat,
        startStop.lon,
        endStop.lat,
        endStop.lon
      );
      console.log("Straight-line distance calculated:", totalDistance);
    }

    // Get fare from database based on distance
    const fare = await getFareForDistance(totalDistance);

    return res.json({
      route: `${startStop.name} → ${endStop.name}`,
      from: startStop.name,
      to: endStop.name,
      totalDistance: totalDistance.toFixed(2),
      fare: `${fare}`,
    });
  } catch (err) {
    console.error("Internal server error in /estimate-fare:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
