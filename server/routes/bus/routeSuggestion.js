// server/routes/routeSuggestion.js
import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

router.post("/route", async (req, res) => {
  const { start, end } = req.body;

  try {
    const dataPath = path.resolve("data", "routes.json");
    const file = await fs.readFile(dataPath, "utf-8");
    const routes = JSON.parse(file);

    const matchingRoute = routes.find(
      (route) =>
        route.start.toLowerCase() === start.toLowerCase() &&
        route.end.toLowerCase() === end.toLowerCase()
    );

    if (matchingRoute) {
      res.json({ status: "success", route: matchingRoute.stops });
    } else {
      res.status(404).json({ status: "fail", message: "Route not found" });
    }
  } catch (err) {
    console.error("Error reading route data:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
