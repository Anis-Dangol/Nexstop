import User from '../../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }

    const users = await User.find({}, { password: 0 }); // Exclude password
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

