import mongoose from "mongoose";

const BusNameSchema = new mongoose.Schema(
  {
    busname: {
      type: String,
      required: true,
      trim: true,
    },
    stops: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one stop is required",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
BusNameSchema.index({ busname: 1 });

export default mongoose.model("BusName", BusNameSchema);
