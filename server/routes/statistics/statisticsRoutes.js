import express from "express";
import {
  getDashboardStats,
  getUserStatistics,
  getBusRouteStatistics,
  getBusStopStatistics,
  getTransferStatistics,
  getBusNameStatistics,
  getFareConfigStatistics,
} from "../../controllers/statistics/statistics-controller.js";

const router = express.Router();

// Get dashboard overview stats
router.get("/dashboard", getDashboardStats);

// Get detailed statistics for each entity
router.get("/users", getUserStatistics);
router.get("/bus-routes", getBusRouteStatistics);
router.get("/bus-stops", getBusStopStatistics);
router.get("/transfers", getTransferStatistics);
router.get("/bus-names", getBusNameStatistics);
router.get("/fare-configs", getFareConfigStatistics);

export default router;
