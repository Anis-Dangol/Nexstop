import express from "express";
import {
  getAllBusNames,
  createBusName,
  updateBusName,
  deleteBusName,
  importBusNames,
} from "../../controllers/busname/busname-controller.js";

const router = express.Router();

// Get all bus names
router.get("/", getAllBusNames);

// Create a new bus name
router.post("/", createBusName);

// Update a bus name
router.put("/:id", updateBusName);

// Delete a bus name
router.delete("/:id", deleteBusName);

// Import bus names from JSON
router.post("/import", importBusNames);

export default router;
