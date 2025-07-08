import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Transfer from "../models/Transfer.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for data import"))
  .catch((error) => console.log("MongoDB connection error:", error));

async function importTransferData() {
  try {
    // Read the transfer.json file
    const transferFilePath = path.join(
      __dirname,
      "../../client/src/assets/transfer.json"
    );
    const transferData = JSON.parse(fs.readFileSync(transferFilePath, "utf8"));

    // Clear existing transfer data
    await Transfer.deleteMany({});
    console.log("Cleared existing transfer data");

    // Transform and insert transfer data
    const transformedData = transferData.map((transfer) => ({
      transferNumber: transfer.transferNumber,
      name: transfer.name,
      transfer1: transfer.Transfer1,
      transfer2: transfer.Transfer2,
    }));

    await Transfer.insertMany(transformedData);
    console.log(
      `Successfully imported ${transformedData.length} transfers to MongoDB`
    );

    // Close the connection
    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error importing transfer data:", error);
    mongoose.connection.close();
  }
}

// Run the import
importTransferData();
