import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    favourites: [
      {
        start: { type: String, required: true },
        end: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // This adds createdAt and updatedAt fields automatically
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
