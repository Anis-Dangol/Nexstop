import mongoose from "mongoose";

const fareConfigSchema = new mongoose.Schema(
  {
    distanceRange: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
fareConfigSchema.index({ "distanceRange.min": 1, "distanceRange.max": 1 });

const FareConfig = mongoose.model("FareConfig", fareConfigSchema);

export default FareConfig;
