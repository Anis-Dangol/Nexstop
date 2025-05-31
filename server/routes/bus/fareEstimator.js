import express from "express";
import fs from "fs";
import path from "path";

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
  const { start, end } = req.body;

  // Load routes.json
  const filePath = path.resolve("data/routes.json");
  const routesData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  for (const route of routesData) {
    const startIndex = route.stops.findIndex((stop) => stop.name === start);
    const endIndex = route.stops.findIndex((stop) => stop.name === end);

    if (startIndex !== -1 && endIndex !== -1) {
      const [from, to] =
        startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

      let totalDistance = 0;
      for (let i = from; i < to; i++) {
        const a = route.stops[i];
        const b = route.stops[i + 1];
        totalDistance += haversineDistance(
          a.latitude,
          a.longitude,
          b.latitude,
          b.longitude
        );
      }

      const fare = Math.ceil(totalDistance * farePerKm); // Round fare up

      return res.json({
        route: `${route.start} → ${route.end}`,
        from: start,
        to: end,
        totalDistance: totalDistance.toFixed(2) + " km",
        fare: `₹${fare}`,
      });
    }
  }

  return res
    .status(404)
    .json({ error: "Start and end stops not found in any route." });
});

export default router;
