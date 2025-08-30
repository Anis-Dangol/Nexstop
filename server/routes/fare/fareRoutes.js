import express from "express";
import {
  getAllFareConfigs,
  createFareConfig,
  updateFareConfig,
  deleteFareConfig,
  estimateFare,
} from "../../controllers/fare/fare-controller.js";

const router = express.Router();

// Get all Fare Estimations
router.get("/", getAllFareConfigs);

// Create new Fare Estimation
router.post("/", createFareConfig);

// Update Fare Estimation
router.put("/:id", updateFareConfig);

// Delete Fare Estimation
router.delete("/:id", deleteFareConfig);

router.post("/estimate-fare", estimateFare);

export default router;
