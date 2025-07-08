import express from "express";
import {
  getAllTransfers,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  bulkImportTransfers,
} from "../../controllers/transfer/transfer-controller.js";

const router = express.Router();

// Get all transfers
router.get("/", getAllTransfers);

// Create a new transfer
router.post("/", createTransfer);

// Update a transfer
router.put("/:id", updateTransfer);

// Delete a transfer
router.delete("/:id", deleteTransfer);

// Bulk import transfers
router.post("/bulk-import", bulkImportTransfers);

export default router;
