import Transfer from "../../models/Transfer.js";

// Get all transfers
const getAllTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find().sort({ transferNumber: 1 });
    res.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    res.status(500).json({ error: "Failed to fetch transfers" });
  }
};

// Create a new transfer
const createTransfer = async (req, res) => {
  try {
    const { name, transfer1, transfer2 } = req.body;

    // Validate required fields
    if (!name || !transfer1 || !transfer2) {
      return res.status(400).json({
        error: "Name, Transfer1, and Transfer2 are required",
      });
    }

    // Get the highest transfer number and increment
    const lastTransfer = await Transfer.findOne().sort({ transferNumber: -1 });
    const nextTransferNumber = lastTransfer
      ? lastTransfer.transferNumber + 1
      : 1;

    const newTransfer = new Transfer({
      transferNumber: nextTransferNumber,
      name,
      transfer1,
      transfer2,
    });

    const savedTransfer = await newTransfer.save();
    res.status(201).json(savedTransfer);
  } catch (error) {
    console.error("Error creating transfer:", error);
    if (error.code === 11000) {
      res.status(400).json({ error: "Transfer number already exists" });
    } else {
      res.status(500).json({ error: "Failed to create transfer" });
    }
  }
};

// Update a transfer
const updateTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, transfer1, transfer2 } = req.body;

    const updatedTransfer = await Transfer.findByIdAndUpdate(
      id,
      { name, transfer1, transfer2 },
      { new: true, runValidators: true }
    );

    if (!updatedTransfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    res.json(updatedTransfer);
  } catch (error) {
    console.error("Error updating transfer:", error);
    res.status(500).json({ error: "Failed to update transfer" });
  }
};

// Delete a transfer
const deleteTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTransfer = await Transfer.findByIdAndDelete(id);

    if (!deletedTransfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    res.json({ message: "Transfer deleted successfully" });
  } catch (error) {
    console.error("Error deleting transfer:", error);
    res.status(500).json({ error: "Failed to delete transfer" });
  }
};

// Bulk import transfers
const bulkImportTransfers = async (req, res) => {
  try {
    const { transfers } = req.body;

    if (!Array.isArray(transfers)) {
      return res.status(400).json({ error: "Transfers must be an array" });
    }

    // Clear existing transfers
    await Transfer.deleteMany({});

    // Insert new transfers
    const formattedTransfers = transfers.map((transfer, index) => ({
      transferNumber: transfer.transferNumber || index + 1,
      name: transfer.name,
      transfer1: transfer.Transfer1 || transfer.transfer1,
      transfer2: transfer.Transfer2 || transfer.transfer2,
    }));

    const savedTransfers = await Transfer.insertMany(formattedTransfers);
    res.json({
      message: "Transfers imported successfully",
      count: savedTransfers.length,
    });
  } catch (error) {
    console.error("Error importing transfers:", error);
    res.status(500).json({ error: "Failed to import transfers" });
  }
};

export {
  getAllTransfers,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  bulkImportTransfers,
};
