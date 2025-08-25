import FareConfig from "../../models/FareConfig.js";

// Get all fare estimation
export const getAllFareConfigs = async (req, res) => {
  try {
    const fareConfigs = await FareConfig.find({ isActive: true }).sort({
      "distanceRange.min": 1,
    });
    res.json({
      success: true,
      data: fareConfigs,
    });
  } catch (error) {
    console.error("Error fetching fare estimation:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Create new fare estimation
export const createFareConfig = async (req, res) => {
  try {
    const { distanceRange, fare, description } = req.body;

    // Validate input
    if (!distanceRange || !distanceRange.min || !distanceRange.max || !fare) {
      return res.status(400).json({
        success: false,
        error: "Distance range and fare are required",
      });
    }

    if (distanceRange.min >= distanceRange.max) {
      return res.status(400).json({
        success: false,
        error: "Minimum distance must be less than maximum distance",
      });
    }

    // Check for overlapping ranges
    const overlappingConfig = await FareConfig.findOne({
      isActive: true,
      $or: [
        {
          "distanceRange.min": { $lt: distanceRange.max },
          "distanceRange.max": { $gt: distanceRange.min },
        },
      ],
    });

    if (overlappingConfig) {
      return res.status(400).json({
        success: false,
        error: "Distance range overlaps with existing configuration",
      });
    }

    const newFareConfig = new FareConfig({
      distanceRange,
      fare,
      description,
    });

    await newFareConfig.save();

    res.status(201).json({
      success: true,
      data: newFareConfig,
    });
  } catch (error) {
    console.error("Error creating Fare Estimation:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update Fare Estimation
export const updateFareConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { distanceRange, fare, description } = req.body;

    const fareConfig = await FareConfig.findById(id);
    if (!fareConfig) {
      return res.status(404).json({
        success: false,
        error: "Fare Estimation not found",
      });
    }

    // Validate input
    if (distanceRange && distanceRange.min >= distanceRange.max) {
      return res.status(400).json({
        success: false,
        error: "Minimum distance must be less than maximum distance",
      });
    }

    // Check for overlapping ranges (excluding current config)
    if (distanceRange) {
      const overlappingConfig = await FareConfig.findOne({
        _id: { $ne: id },
        isActive: true,
        $or: [
          {
            "distanceRange.min": { $lt: distanceRange.max },
            "distanceRange.max": { $gt: distanceRange.min },
          },
        ],
      });

      if (overlappingConfig) {
        return res.status(400).json({
          success: false,
          error: "Distance range overlaps with existing configuration",
        });
      }
    }

    const updatedFareConfig = await FareConfig.findByIdAndUpdate(
      id,
      {
        ...(distanceRange && { distanceRange }),
        ...(fare !== undefined && { fare }),
        ...(description !== undefined && { description }),
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedFareConfig,
    });
  } catch (error) {
    console.error("Error updating Fare Estimation:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Delete Fare Estimation
export const deleteFareConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const fareConfig = await FareConfig.findById(id);
    if (!fareConfig) {
      return res.status(404).json({
        success: false,
        error: "Fare Estimation not found",
      });
    }

    // Soft delete by setting isActive to false
    await FareConfig.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: "Fare Estimation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Fare Estimation:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get fare for a specific distance
export const getFareForDistance = async (distance) => {
  try {
    const fareConfig = await FareConfig.findOne({
      isActive: true,
      "distanceRange.min": { $lte: distance },
      "distanceRange.max": { $gt: distance },
    });

    if (fareConfig) {
      return fareConfig.fare;
    }

    // If no exact match, find the highest range that's less than distance
    const fallbackConfig = await FareConfig.findOne({
      isActive: true,
      "distanceRange.max": { $lte: distance },
    }).sort({ "distanceRange.max": -1 });

    if (fallbackConfig) {
      return fallbackConfig.fare;
    }

    // Default fare if no configuration found
    return 10;
  } catch (error) {
    console.error("Error getting fare for distance:", error);
    return 10; // Default fare
  }
};
