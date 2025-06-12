import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const farePerKm = 5; // ₹5 per km

// Helper to calculate distance
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.post("/estimate-fare", (req, res) => {
  try {
    const { start, end } = req.body;

    // Debug log for start/end
    console.log("Estimate fare request:", { start, end });

    // Use correct path to routes.json (adjust as needed for your project structure)
    const filePath = path.resolve(
      __dirname,
      "../../../client/src/assets/routes.json"
    );
    console.log("Resolved routes.json path:", filePath);
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

    for (const route of routesData) {
      const startIndex = route.stops.findIndex((stop) => stop.name === start);
      const endIndex = route.stops.findIndex((stop) => stop.name === end);

      if (startIndex !== -1 && endIndex !== -1) {
        const [from, to] =
          startIndex < endIndex
            ? [startIndex, endIndex]
            : [endIndex, startIndex];

        let totalDistance = 0;
        for (let i = from; i < to; i++) {
          const a = route.stops[i];
          const b = route.stops[i + 1];
          totalDistance += haversineDistance(a.lat, a.lon, b.lat, b.lon);
        }

        //   const fare = Math.ceil(totalDistance * farePerKm); // Round fare up
        let fare;
        if (totalDistance < 1) {
          fare = 5;
        } else if (totalDistance < 5) {
          fare = 20;
        } else if (totalDistance < 10) {
          fare = 25;
        } else if (totalDistance < 15) {
          fare = 30;
        } else if (totalDistance < 20) {
          fare = 33;
        } else {
          fare = 38;
        }

        return res.json({
          route: `${route.start} → ${route.end}`,
          from: start,
          to: end,
          totalDistance: totalDistance.toFixed(2),
          fare: `${fare}`,
        });
      }
    }

    return res
      .status(404)
      .json({ error: "Start and end stops not found in any route." });
  } catch (err) {
    console.error("Internal server error in /estimate-fare:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
