import express from "express";
import {
  getBusStatistics,
  getAllBusRoutes,
  getBusRouteById,
  createBusRoute,
  updateBusRoute,
  deleteBusRoute,
  getAllBusStops,
  deleteBusStop,
  deleteBusStopFromAllRoutes,
  updateBusStop,
  importBusRoutes,
  bulkUpdateRouteNumbers,
  reorderRoutes,
} from "../../controllers/bus/bus-controller.js";
import { authMiddleware } from "../../controllers/auth/auth-controller.js";

const router = express.Router();

// Public routes
router.get("/routes", getAllBusRoutes);
router.get("/routes/:id", getBusRouteById);
router.get("/stops", getAllBusStops);

// Admin only routes
router.get("/statistics", authMiddleware, getBusStatistics);
router.post("/routes", authMiddleware, createBusRoute);
router.post("/routes/import", authMiddleware, importBusRoutes);
router.put(
  "/routes/bulk-update-numbers",
  authMiddleware,
  bulkUpdateRouteNumbers
);
router.put("/routes/reorder", authMiddleware, reorderRoutes);
router.put("/routes/:id", authMiddleware, updateBusRoute);
router.delete("/routes/:id", authMiddleware, deleteBusRoute);
router.put("/stops/:id", authMiddleware, updateBusStop);
router.delete(
  "/stops/delete-from-all-routes",
  authMiddleware,
  deleteBusStopFromAllRoutes
);
router.delete("/stops/:id", authMiddleware, deleteBusStop);

export default router;
