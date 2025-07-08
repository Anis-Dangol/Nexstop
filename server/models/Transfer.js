import mongoose from "mongoose";

const TransferSchema = new mongoose.Schema(
  {
    transferNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    transfer1: {
      type: String,
      required: true,
    },
    transfer2: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transfer", TransferSchema);
