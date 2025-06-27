import express from "express";
import { getBusStatistics } from "../../controllers/bus/bus-controller.js";
import { authMiddleware } from "../../controllers/auth/auth-controller.js";

const router = express.Router();

router.get("/statistics", authMiddleware, getBusStatistics);

export default router;
