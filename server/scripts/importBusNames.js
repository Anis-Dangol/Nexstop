import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import BusName from "../models/BusName.js";
import dotenv from "dotenv";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function importBusNames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Read the busNameArray.json file
    const filePath = path.resolve(
      __dirname,
      "../../client/src/assets/busNameArray.json"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    const busNamesData = JSON.parse(fileContent);

    console.log(`Found ${busNamesData.length} bus names to import...`);

    // Clear existing bus names (optional)
    await BusName.deleteMany({});
    console.log("Cleared existing bus names");

    // Transform and insert data
    const transformedData = busNamesData.map((busName) => ({
      busname: busName.busname,
      stops: busName.stops,
    }));

    const result = await BusName.insertMany(transformedData);
    console.log(`Successfully imported ${result.length} bus names`);

    // Close the connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error importing bus names:", error);
    process.exit(1);
  }
}

// Run the import
importBusNames();
