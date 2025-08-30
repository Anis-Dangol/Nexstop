import express from "express";
import {
  handleCalculateDistance,
  handleNearestPoint,
  handleRouteDistance,
} from "../../controllers/distance/distance-controller.js";

const router = express.Router();

router.post("/calculate", handleCalculateDistance);
router.post("/route", handleRouteDistance);
router.post("/nearest", handleNearestPoint);

export default router;
