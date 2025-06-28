import express from "express";
import FavouriteRoutes from "../../models/FavouriteRoutes.js";

const router = express.Router();

// Add a favourite route for a user
router.post("/add-favourite", async (req, res) => {
  try {
    const { userId, routeName, startLocation, endLocation } = req.body;

    if (!userId || !startLocation || !endLocation) {
      return res
        .status(400)
        .json({ error: "userId, startLocation, and endLocation are required" });
    }

    // Check if route already exists for this user
    const existingRoute = await FavouriteRoutes.routeExists(
      userId,
      startLocation,
      endLocation
    );
    if (existingRoute) {
      return res.status(409).json({ error: "Route already in favourites" });
    }

    // Create new favourite route with only essential fields
    const favouriteRoute = new FavouriteRoutes({
      userId,
      routeName: routeName || `${startLocation} → ${endLocation}`,
      startLocation,
      endLocation,
    });

    await favouriteRoute.save();

    res.status(201).json({
      message: "Favourite route added successfully",
      route: favouriteRoute,
    });
  } catch (err) {
    console.error("Error adding favourite route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all favourite routes for a user
router.get("/get-favourites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const favourites = await FavouriteRoutes.findByUserId(userId);

    res.json({
      message: "Favourites retrieved successfully",
      favourites: favourites,
      count: favourites.length,
    });
  } catch (err) {
    console.error("Error fetching favourite routes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove a favourite route for a user
router.delete("/remove-favourite/:routeId", async (req, res) => {
  try {
    const { routeId } = req.params;
    const { userId } = req.body;

    if (!routeId || !userId) {
      return res.status(400).json({ error: "routeId and userId are required" });
    }

    const favouriteRoute = await FavouriteRoutes.findOneAndDelete({
      _id: routeId,
      userId: userId,
    });

    if (!favouriteRoute) {
      return res.status(404).json({ error: "Favourite route not found" });
    }

    res.json({
      message: "Favourite route removed successfully",
      route: favouriteRoute,
    });
  } catch (err) {
    console.error("Error removing favourite route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Alternative route to remove by start/end locations
router.post("/remove-favourite", async (req, res) => {
  try {
    const { userId, startLocation, endLocation } = req.body;

    if (!userId || !startLocation || !endLocation) {
      return res
        .status(400)
        .json({ error: "userId, startLocation, and endLocation are required" });
    }

    const favouriteRoute = await FavouriteRoutes.findOneAndDelete({
      userId,
      startLocation: { $regex: new RegExp(`^${startLocation}$`, "i") },
      endLocation: { $regex: new RegExp(`^${endLocation}$`, "i") },
      isActive: true,
    });

    if (!favouriteRoute) {
      return res.status(404).json({ error: "Favourite route not found" });
    }

    res.json({
      message: "Favourite route removed successfully",
      route: favouriteRoute,
    });
  } catch (err) {
    console.error("Error removing favourite route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific favourite route by ID
router.get("/get-favourite/:routeId", async (req, res) => {
  try {
    const { routeId } = req.params;
    const { userId } = req.query;

    if (!routeId || !userId) {
      return res.status(400).json({ error: "routeId and userId are required" });
    }

    const favouriteRoute = await FavouriteRoutes.findOne({
      _id: routeId,
      userId: userId,
      isActive: true,
    });

    if (!favouriteRoute) {
      return res.status(404).json({ error: "Favourite route not found" });
    }

    res.json({
      message: "Favourite route retrieved successfully",
      route: favouriteRoute,
    });
  } catch (err) {
    console.error("Error fetching favourite route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a favourite route
router.put("/update-favourite/:routeId", async (req, res) => {
  try {
    const { routeId } = req.params;
    const { userId, routeName } = req.body;

    if (!routeId || !userId) {
      return res.status(400).json({ error: "routeId and userId are required" });
    }

    const updateData = {};
    if (routeName !== undefined) updateData.routeName = routeName;

    const favouriteRoute = await FavouriteRoutes.findOneAndUpdate(
      { _id: routeId, userId: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!favouriteRoute) {
      return res.status(404).json({ error: "Favourite route not found" });
    }

    res.json({
      message: "Favourite route updated successfully",
      route: favouriteRoute,
    });
  } catch (err) {
    console.error("Error updating favourite route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
