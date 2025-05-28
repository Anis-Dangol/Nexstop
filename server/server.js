import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRouter from './routes/auth/authRoutes.js';
import routeSuggestion  from "./routes/bus/routeSuggestion.js";

import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(error => console.log(error));

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin : 'http://localhost:5173',
        methods : ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders : [
            "content-type",
            'Authorization',
            'Cache-Control',
            'Expires',
            'Pragma',
        ],
        credentials : true,
    })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api", routeSuggestion);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})