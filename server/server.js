import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth/authRoutes.js";
import routeSuggestion from "./routes/bus/routeSuggestion.js";
import fareEstimator from "./routes/bus/fareEstimator.js";
import favouriteRoutes from "./routes/auth/favouriteRoutes.js";

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
    origin: "http://192.168.1.4:5173",
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
app.use("/api/favourites", favouriteRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://192.168.1.4:${PORT}`);
});
