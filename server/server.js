import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth/authRoutes.js";
import routeSuggestion from "./routes/bus/routeSuggestion.js";
import fareEstimator from "./routes/bus/fareEstimator.js";
import favouriteRoutes from "./routes/auth/favouriteRoutes.js";
import busRoutes from "./routes/bus/busRoutes.js";
import transferRoutes from "./routes/transfer/transferRoutes.js";
import busnameRoutes from "./routes/busname/busnameRoutes.js";
import fareRoutes from "./routes/fare/fareRoutes.js";
import statisticsRoutes from "./routes/statistics/statisticsRoutes.js";

import dotenv from "dotenv";
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

// ✅ define 'app' before using it
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "content-type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());

// ✅ now use routes after 'app' is declared
app.use("/api/auth", authRouter);
app.use("/api", routeSuggestion);
app.use("/api/bus", fareEstimator);
app.use("/api/auth", favouriteRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/busname", busnameRoutes);
app.use("/api/fare", fareRoutes);
app.use("/api/statistics", statisticsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
