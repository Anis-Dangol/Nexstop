import User from "../../models/User.js";
import bcrypt from "bcryptjs";

// Get user registration statistics by month
export const getUserRegistrationStats = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    // Get year and month from query parameters
    const { year, month } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : null;

    let startDate, endDate;
    let groupStage, monthlyData;

    if (targetMonth) {
      // If specific month is selected, show daily statistics for that month
      startDate = new Date(targetYear, targetMonth - 1, 1);
      endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59); // Last day of the month

      // Get days in the month
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

      // Aggregate users by day
      const dailyStats = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Create array with all days of the month
      monthlyData = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const found = dailyStats.find((stat) => stat._id === day);
        monthlyData.push({
          day: day,
          users: found ? found.count : 0,
        });
      }
    } else {
      // Show monthly statistics for the entire year
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59);

      // Aggregate users by month
      const monthlyStats = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Create array with all 12 months, filling missing months with 0
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      monthlyData = monthNames.map((month, index) => {
        const monthNumber = index + 1;
        const found = monthlyStats.find((stat) => stat._id === monthNumber);
        return {
          month: month,
          users: found ? found.count : 0,
        };
      });
    }

    res.status(200).json({
      success: true,
      data: monthlyData,
      year: targetYear,
      month: targetMonth,
    });
  } catch (error) {
    console.error("Error fetching user registration stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user registration statistics",
    });
  }
};

// Get user count
export const getUserCount = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admins only" });
    }

    const userCount = await User.countDocuments();
    res.status(200).json({ success: true, count: userCount });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user count" });
  }
};

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
    res.status(201).json({
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
