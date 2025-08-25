import mongoose from "mongoose";
import FareConfig from "../models/FareConfig.js";
import dotenv from "dotenv";

dotenv.config();

async function initializeFareConfigs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if fare configs already exist
    const existingConfigs = await FareConfig.find();
    if (existingConfigs.length > 0) {
      console.log("Fare Estimations already exist. Skipping initialization.");
      return;
    }

    // Insert default Fare Estimations
    await FareConfig.insertMany(defaultFareConfigs);
    console.log("Default Fare Estimations initialized successfully!");

    // Display the inserted configurations
    const configs = await FareConfig.find().sort({ "distanceRange.min": 1 });
    console.log("\nInitialized Fare Estimations:");
    configs.forEach((config) => {
      console.log(
        `- ${config.distanceRange.min}km - ${config.distanceRange.max}km: Rs. ${config.fare} (${config.description})`
      );
    });
  } catch (error) {
    console.error("Error initializing Fare Estimations:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

initializeFareConfigs();
