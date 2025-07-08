import mongoose from "mongoose";

const BusStopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lon: {
    type: Number,
    required: true,
  },
});

const BusRouteSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      default: "#FF0000",
    },
    stops: [BusStopSchema],
    totalStops: {
      type: Number,
      default: function () {
        return this.stops.length;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Update totalStops before saving
BusRouteSchema.pre("save", function (next) {
  this.totalStops = this.stops.length;
  next();
});

const BusRoute = mongoose.model("BusRoute", BusRouteSchema);

export default BusRoute;
