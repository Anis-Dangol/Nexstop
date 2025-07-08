import BusName from "../../models/BusName.js";

// Get all bus names
export const getAllBusNames = async (req, res) => {
  try {
    const busNames = await BusName.find().sort({ busname: 1 });
    res.status(200).json(busNames);
  } catch (error) {
    console.error("Error fetching bus names:", error);
    res.status(500).json({ error: "Failed to fetch bus names" });
  }
};

// Create a new bus name
export const createBusName = async (req, res) => {
  try {
    const { busname, stops } = req.body;

    // Validation
    if (!busname || !stops || !Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({
        error: "Bus name and at least one stop are required",
      });
    }

    // Check if bus name already exists
    const existingBusName = await BusName.findOne({ busname });
    if (existingBusName) {
      return res.status(400).json({
        error: "Bus name already exists",
      });
    }

    // Filter out empty stops
    const validStops = stops.filter((stop) => stop && stop.trim() !== "");

    if (validStops.length === 0) {
      return res.status(400).json({
        error: "At least one valid stop is required",
      });
    }

    const newBusName = new BusName({
      busname: busname.trim(),
      stops: validStops.map((stop) => stop.trim()),
    });

    const savedBusName = await newBusName.save();
    res.status(201).json(savedBusName);
  } catch (error) {
    console.error("Error creating bus name:", error);
    res.status(500).json({ error: "Failed to create bus name" });
  }
};

// Update a bus name
export const updateBusName = async (req, res) => {
  try {
    const { id } = req.params;
    const { busname, stops } = req.body;

    // Validation
    if (!busname || !stops || !Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({
        error: "Bus name and at least one stop are required",
      });
    }

    // Filter out empty stops
    const validStops = stops.filter((stop) => stop && stop.trim() !== "");

    if (validStops.length === 0) {
      return res.status(400).json({
        error: "At least one valid stop is required",
      });
    }

    // Check if another bus name with the same name exists (excluding current one)
    const existingBusName = await BusName.findOne({
      busname: busname.trim(),
      _id: { $ne: id },
    });
    if (existingBusName) {
      return res.status(400).json({
        error: "Bus name already exists",
      });
    }

    const updatedBusName = await BusName.findByIdAndUpdate(
      id,
      {
        busname: busname.trim(),
        stops: validStops.map((stop) => stop.trim()),
      },
      { new: true }
    );

    if (!updatedBusName) {
      return res.status(404).json({ error: "Bus name not found" });
    }

    res.status(200).json(updatedBusName);
  } catch (error) {
    console.error("Error updating bus name:", error);
    res.status(500).json({ error: "Failed to update bus name" });
  }
};

// Delete a bus name
export const deleteBusName = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBusName = await BusName.findByIdAndDelete(id);

    if (!deletedBusName) {
      return res.status(404).json({ error: "Bus name not found" });
    }

    res.status(200).json({ message: "Bus name deleted successfully" });
  } catch (error) {
    console.error("Error deleting bus name:", error);
    res.status(500).json({ error: "Failed to delete bus name" });
  }
};

// Import bus names from JSON (bulk operation)
export const importBusNames = async (req, res) => {
  try {
    const { busNames, replaceExisting } = req.body;

    if (!Array.isArray(busNames) || busNames.length === 0) {
      return res.status(400).json({
        error: "Bus names array is required",
      });
    }

    // Validate each bus name entry
    for (const busName of busNames) {
      if (
        !busName.busname ||
        !busName.stops ||
        !Array.isArray(busName.stops) ||
        busName.stops.length === 0
      ) {
        return res.status(400).json({
          error: "Each bus name must have a name and at least one stop",
        });
      }
    }

    let result;

    if (replaceExisting) {
      // Clear existing data and insert new data
      await BusName.deleteMany({});
      result = await BusName.insertMany(
        busNames.map((busName) => ({
          busname: busName.busname.trim(),
          stops: busName.stops
            .filter((stop) => stop && stop.trim() !== "")
            .map((stop) => stop.trim()),
        }))
      );
    } else {
      // Insert only new bus names (skip duplicates)
      const results = [];
      for (const busName of busNames) {
        try {
          const existingBusName = await BusName.findOne({
            busname: busName.busname.trim(),
          });
          if (!existingBusName) {
            const newBusName = new BusName({
              busname: busName.busname.trim(),
              stops: busName.stops
                .filter((stop) => stop && stop.trim() !== "")
                .map((stop) => stop.trim()),
            });
            const saved = await newBusName.save();
            results.push(saved);
          }
        } catch (error) {
          console.error(`Error importing bus name ${busName.busname}:`, error);
        }
      }
      result = results;
    }

    res.status(200).json({
      message: `Successfully imported ${result.length} bus names`,
      imported: result.length,
    });
  } catch (error) {
    console.error("Error importing bus names:", error);
    res.status(500).json({ error: "Failed to import bus names" });
  }
};
