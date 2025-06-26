import User from "../../models/User.js";
import bcrypt from "bcryptjs";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    const users = await User.find({}, { password: 0 }); // Exclude password
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  const { userName, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const user = new User({ userName, email, password: hashPassword, role });
    await user.save();
    res
      .status(201)
      .json({
        success: true,
        user: { ...user.toObject(), password: undefined },
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { userName, email, role, password } = req.body;
  try {
    const updateData = { userName, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      context: "query",
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({
      success: true,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};
