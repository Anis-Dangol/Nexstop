import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to calculate distance
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1); const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.post("/estimate-fare", (req, res) => {
  try {
    const { start, end } = req.body;
    console.log("Estimate fare request:", { start, end });
    const filePath = path.resolve(
      __dirname,
      "../../../client/src/assets/routes.json"
    );
    if (!fs.existsSync(filePath)) {
      console.error("routes.json file not found at:", filePath);
      return res.status(500).json({ error: "routes.json file not found" });
    }
    let routesData;
    try {
      routesData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.error("Error parsing routes.json:", err);
      return res.status(500).json({ error: "Error parsing routes.json" });
    }

    // Flatten all stops (unique by name)
    const allStops = [];
    const stopSet = new Set();
    for (const route of routesData) {
      for (const stop of route.stops) {
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

    // Calculate straight-line (haversine) distance
    const totalDistance = haversineDistance(
      startStop.lat,
      startStop.lon,
      endStop.lat,
      endStop.lon
    );

    // Fare logic (same as before)
    let fare;
    if (totalDistance < 1) {
      fare = 10;
    } else if (totalDistance < 5) {
      fare = 20;
    } else if (totalDistance < 10) {
      fare = 25;
    } else if (totalDistance < 15) {
      fare = 30;
    } else if (totalDistance < 20) {
      fare = 35;
    } else {
      fare = 40;
    }

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
