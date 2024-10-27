import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import workoutRoutes from "./routes/workoutRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import exerciseHistoryRoutes from "./routes/exerciseHistoryRoutes.js";
import measurementsRoutes from "./routes/measurementsRoutes.js";
import userActicityRoutes from "./routes/userActivityRoutes.js";
import connectDb from "./config/db.js";
import colors from "colors";
import errorHandler from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";

dotenv.config({ path: "./config/config.env" });
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use(hpp());
app.use(cors());

connectDb();

app.use("/api/v1/workouts", workoutRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/activities", userActicityRoutes);
app.use("/api/v1/exercise-history", exerciseHistoryRoutes);
app.use("/api/v1/measurements", measurementsRoutes);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`.yellow.bold);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => process.exit(1));
});
