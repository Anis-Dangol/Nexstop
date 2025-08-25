import User from "../../models/User.js";
import BusRoute from "../../models/BusRoute.js";
import Transfer from "../../models/Transfer.js";
import BusName from "../../models/BusName.js";
import FareConfig from "../../models/FareConfig.js";

// Helper function to get statistics by month and year
const getEntityStatistics = async (Model, year, month) => {
  const matchStage = {};

  if (year) {
    matchStage.createdAt = {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${parseInt(year) + 1}-01-01`),
    };

    if (month && month !== "all") {
      const monthNum = parseInt(month);
      matchStage.createdAt = {
        $gte: new Date(`${year}-${monthNum.toString().padStart(2, "0")}-01`),
        $lt: new Date(
          `${year}-${(monthNum + 1).toString().padStart(2, "0")}-01`
        ),
      };
    }
  }

  try {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ];

    const results = await Model.aggregate(pipeline);

    // Create array for all 12 months
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: 0,
    }));

    // Fill in actual data
    results.forEach((result) => {
      const monthIndex = result._id.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyStats[monthIndex].count = result.count;
      }
    });

    return monthlyStats;
  } catch (error) {
    console.error(`Error getting statistics:`, error);
    return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }));
  }
};

// Get total counts for all entities
export const getDashboardStats = async (req, res) => {
  try {
    const [
      userCount,
      busStopCount,
      busRouteCount,
      transferCount,
      busNameCount,
      fareConfigCount,
    ] = await Promise.all([
      User.countDocuments(),
      // For bus stops, we need to count unique stops from all routes
      BusRoute.aggregate([
        { $unwind: "$stops" },
        {
          $group: {
            _id: { name: "$stops.name", lat: "$stops.lat", lon: "$stops.lon" },
          },
        },
        { $count: "total" },
      ]),
      BusRoute.countDocuments(),
      Transfer.countDocuments(),
      BusName.countDocuments(),
      FareConfig.countDocuments({ isActive: true }),
    ]);

    res.json({
      success: true,
      data: {
        users: userCount,
        busStops: busStopCount[0]?.total || 0,
        busRoutes: busRouteCount,
        transfers: transferCount,
        busNames: busNameCount,
        fareConfigs: fareConfigCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get user registration statistics
export const getUserStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = "all" } = req.query;
    const stats = await getEntityStatistics(User, year, month);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get bus route statistics
export const getBusRouteStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = "all" } = req.query;
    const stats = await getEntityStatistics(BusRoute, year, month);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching bus route statistics:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get transfer statistics
export const getTransferStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = "all" } = req.query;
    const stats = await getEntityStatistics(Transfer, year, month);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching transfer statistics:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get bus name statistics
export const getBusNameStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = "all" } = req.query;
    const stats = await getEntityStatistics(BusName, year, month);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching bus name statistics:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get fare configuration statistics
export const getFareConfigStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = "all" } = req.query;
    const stats = await getEntityStatistics(FareConfig, year, month);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching fare config statistics:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get bus stop statistics (special case - needs to aggregate from routes)
export const getBusStopStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = "all" } = req.query;

    // Since bus stops don't have their own collection, we'll use bus route creation dates
    // as a proxy for when stops were added
    const stats = await getEntityStatistics(BusRoute, year, month);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching bus stop statistics:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
