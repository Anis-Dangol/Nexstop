import mongoose from "mongoose";

const FavouriteRoutesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    routeName: {
      type: String,
      required: true,
      trim: true,
    },
    startLocation: {
      type: String,
      required: true,
      trim: true,
    },
    endLocation: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
FavouriteRoutesSchema.index({ userId: 1, createdAt: -1 });
FavouriteRoutesSchema.index({ userId: 1, startLocation: 1, endLocation: 1 });

// Instance method to get route display name
FavouriteRoutesSchema.methods.getDisplayName = function () {
  return `${this.startLocation} → ${this.endLocation}`;
};

// Static method to find user's favorite routes
FavouriteRoutesSchema.statics.findByUserId = function (userId) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

// Static method to check if route already exists for user
FavouriteRoutesSchema.statics.routeExists = function (
  userId,
  startLocation,
  endLocation
) {
  return this.findOne({
    userId,
    startLocation: { $regex: new RegExp(`^${startLocation}$`, "i") },
    endLocation: { $regex: new RegExp(`^${endLocation}$`, "i") },
    isActive: true,
  });
};

// Pre-save middleware to generate route name if not provided
FavouriteRoutesSchema.pre("save", function (next) {
  if (!this.routeName) {
    this.routeName = `${this.startLocation} → ${this.endLocation}`;
  }
  next();
});

export default mongoose.model("FavouriteRoutes", FavouriteRoutesSchema);
