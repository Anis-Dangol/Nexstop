import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import BusRoute from "../../models/BusRoute.js";

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

    // Get statistics from MongoDB
    const totalRoutes = await BusRoute.countDocuments();

    // Get unique bus stops count
    const routes = await BusRoute.find();
    const allStops = new Set();
    routes.forEach((route) => {
      route.stops.forEach((stop) => {
        // Use name + coordinates to identify unique stops
        allStops.add(`${stop.name}-${stop.lat}-${stop.lon}`);
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

// Get all bus routes
export const getAllBusRoutes = async (req, res) => {
  try {
    const routes = await BusRoute.find().sort({ routeNumber: 1 });
    res.status(200).json({
      success: true,
      data: routes,
    });
  } catch (error) {
    console.error("Error fetching bus routes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bus routes",
    });
  }
};

// Get single bus route by ID
export const getBusRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await BusRoute.findById(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Bus route not found",
      });
    }

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    console.error("Error fetching bus route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bus route",
    });
  }
};

// Create new bus route (admin only)
export const createBusRoute = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    const { routeNumber, name, stops } = req.body;

    // Check if route number already exists
    const existingRoute = await BusRoute.findOne({ routeNumber });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: "Route number already exists",
      });
    }

    // Validate stops data
    if (!stops || stops.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one stop is required",
      });
    }

    // Validate each stop has required fields
    for (const stop of stops) {
      if (!stop.name || stop.lat === undefined || stop.lon === undefined) {
        return res.status(400).json({
          success: false,
          message: "Each stop must have name, latitude, and longitude",
        });
      }
    }

    const newRoute = new BusRoute({
      routeNumber,
      name,
      stops,
    });

    const savedRoute = await newRoute.save();

    res.status(201).json({
      success: true,
      message: "Bus route created successfully",
      data: savedRoute,
    });
  } catch (error) {
    console.error("Error creating bus route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bus route",
    });
  }
};

// Update bus route (admin only)
export const updateBusRoute = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    const { id } = req.params;
    const { routeNumber, name, stops } = req.body;

    // Check if route exists
    const existingRoute = await BusRoute.findById(id);
    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        message: "Bus route not found",
      });
    }

    // Check if route number is being changed and if it already exists
    if (routeNumber && routeNumber !== existingRoute.routeNumber) {
      const routeWithNumber = await BusRoute.findOne({ routeNumber });
      if (routeWithNumber) {
        return res.status(400).json({
          success: false,
          message: "Route number already exists",
        });
      }
    }

    // Validate stops data if provided
    if (stops) {
      if (stops.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one stop is required",
        });
      }

      for (const stop of stops) {
        if (!stop.name || stop.lat === undefined || stop.lon === undefined) {
          return res.status(400).json({
            success: false,
            message: "Each stop must have name, latitude, and longitude",
          });
        }
      }
    }

    const updatedRoute = await BusRoute.findByIdAndUpdate(
      id,
      { routeNumber, name, stops },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Bus route updated successfully",
      data: updatedRoute,
    });
  } catch (error) {
    console.error("Error updating bus route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bus route",
    });
  }
};

// Delete bus route (admin only)
export const deleteBusRoute = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    const { id } = req.params;

    const deletedRoute = await BusRoute.findByIdAndDelete(id);
    if (!deletedRoute) {
      return res.status(404).json({
        success: false,
        message: "Bus route not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bus route deleted successfully",
      data: deletedRoute,
    });
  } catch (error) {
    console.error("Error deleting bus route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete bus route",
    });
  }
};

// Get all bus stops
export const getAllBusStops = async (req, res) => {
  try {
    const routes = await BusRoute.find();
    const allStops = [];

    routes.forEach((route) => {
      route.stops.forEach((stop) => {
        // Check if stop already exists to avoid duplicates
        const existingStop = allStops.find(
          (s) =>
            s.name === stop.name && s.lat === stop.lat && s.lon === stop.lon
        );
        if (!existingStop) {
          allStops.push({
            id: stop._id,
            name: stop.name,
            lat: stop.lat,
            lon: stop.lon,
            routeId: route._id,
            routeName: route.name,
            routeNumber: route.routeNumber,
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      data: allStops,
    });
  } catch (error) {
    console.error("Error fetching bus stops:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bus stops",
    });
  }
};

// Import routes from JSON file (admin only)
export const importBusRoutes = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    const { routes, replaceExisting } = req.body;

    if (!routes || !Array.isArray(routes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid routes data. Expected an array of routes.",
      });
    }

    let importedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    const errors = [];

    // If replaceExisting is true, clear all existing routes
    if (replaceExisting) {
      await BusRoute.deleteMany({});
    }

    // Process each route
    for (const routeData of routes) {
      try {
        // Validate required fields
        if (!routeData.routeNumber || !routeData.name || !routeData.stops) {
          errors.push(
            `Route ${
              routeData.routeNumber || "unknown"
            }: Missing required fields`
          );
          continue;
        }

        // Validate stops
        if (!Array.isArray(routeData.stops) || routeData.stops.length === 0) {
          errors.push(
            `Route ${routeData.routeNumber}: No valid stops provided`
          );
          continue;
        }

        // Validate each stop
        for (const stop of routeData.stops) {
          if (!stop.name || stop.lat === undefined || stop.lon === undefined) {
            errors.push(
              `Route ${routeData.routeNumber}: Invalid stop data - missing name, lat, or lon`
            );
            continue;
          }
        }

        // Check if route number already exists
        const existingRoute = await BusRoute.findOne({
          routeNumber: routeData.routeNumber,
        });

        if (existingRoute && !replaceExisting) {
          // Update existing route
          await BusRoute.findByIdAndUpdate(existingRoute._id, {
            name: routeData.name,
            stops: routeData.stops,
          });
          updatedCount++;
        } else if (!existingRoute) {
          // Create new route
          const newRoute = new BusRoute({
            routeNumber: routeData.routeNumber,
            name: routeData.name,
            stops: routeData.stops,
          });
          await newRoute.save();
          importedCount++;
        } else {
          // Route exists and we're replacing - it will be handled by the bulk insert
          const newRoute = new BusRoute({
            routeNumber: routeData.routeNumber,
            name: routeData.name,
            stops: routeData.stops,
          });
          await newRoute.save();
          importedCount++;
        }
      } catch (error) {
        errors.push(`Route ${routeData.routeNumber}: ${error.message}`);
        skippedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: "Routes import completed",
      summary: {
        total: routes.length,
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error importing bus routes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import bus routes",
    });
  }
};

// Delete bus stop by ID
export const deleteBusStop = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    const { id } = req.params;

    // Find the route containing this stop
    const route = await BusRoute.findOne({ "stops._id": id });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Bus stop not found",
      });
    }

    // Remove the stop from the route
    route.stops = route.stops.filter((stop) => stop._id.toString() !== id);
    await route.save();

    res.status(200).json({
      success: true,
      message: "Bus stop deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bus stop:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete bus stop",
    });
  }
};

// Update bus stop by ID
export const updateBusStop = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    const { id } = req.params;
    const { name, lat, lon } = req.body;

    // Validate required fields
    if (!name || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, latitude, and longitude are required",
      });
    }

    // Find the route containing this stop
    const route = await BusRoute.findOne({ "stops._id": id });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Bus stop not found",
      });
    }

    // Update the stop
    const stopIndex = route.stops.findIndex(
      (stop) => stop._id.toString() === id
    );
    if (stopIndex !== -1) {
      route.stops[stopIndex].name = name;
      route.stops[stopIndex].lat = parseFloat(lat);
      route.stops[stopIndex].lon = parseFloat(lon);
      await route.save();
    }

    res.status(200).json({
      success: true,
      message: "Bus stop updated successfully",
      data: route.stops[stopIndex],
    });
  } catch (error) {
    console.error("Error updating bus stop:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bus stop",
    });
  }
};
