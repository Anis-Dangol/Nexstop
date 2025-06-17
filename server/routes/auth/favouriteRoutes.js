import express from "express";
import User from "../../models/User.js";

const router = express.Router();

// Add a favourite route for a user
router.post("/add-favourite", async (req, res) => {
  try {
    const { userId, start, end } = req.body;
    if (!userId || !start || !end) {
      return res
        .status(400)
        .json({ error: "userId, start, and end are required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    // Prevent duplicates
    if (user.favourites.some((fav) => fav.start === start && fav.end === end)) {
      return res.status(409).json({ error: "Route already in favourites" });
    }
    user.favourites.push({ start, end });
    await user.save();
    res.json({ message: "Favourite route added", favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all favourite routes for a user
router.get("/get-favourites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove a favourite route for a user
router.post("/remove-favourite", async (req, res) => {
  try {
    const { userId, start, end } = req.body;
    if (!userId || !start || !end) {
      return res
        .status(400)
        .json({ error: "userId, start, and end are required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.favourites = user.favourites.filter(
      (fav) => fav.start !== start || fav.end !== end
    );
    await user.save();
    res.json({
      message: "Favourite route removed",
      favourites: user.favourites,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
