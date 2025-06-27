import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get bus routes and stops count
export const getBusStatistics = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    // Path to the JSON files (assuming they're in the client assets folder)
    const routesPath = path.join(
      __dirname,
      "../../..",
      "client",
      "src",
      "assets",
      "routes.json"
    );

    const routesData = await fs.readFile(routesPath, "utf8");
    const routes = JSON.parse(routesData);

    const totalRoutes = routes.length;

    // Get unique bus stops
    const allStops = new Set();
    routes.forEach((route) => {
      route.stops.forEach((stop) => {
        allStops.add(stop.name);
      });
    });

    const totalBusStops = allStops.size;

    res.status(200).json({
      success: true,
      statistics: {
        totalRoutes,
        totalBusStops,
      },
    });
  } catch (error) {
    console.error("Error reading bus data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bus statistics",
    });
  }
};
