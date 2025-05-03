import express from "express";
import {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  toggleIsFavorite,
} from "../controllers/workouts.js";

import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

router
  .route("/")
  .get(protect, getWorkouts)
  .post(protect, authorize("user", "admin"), createWorkout);

router
  .route("/:id")
  .get(protect, getWorkout)
  .put(protect, authorize("user", "admin"), updateWorkout)
  .delete(protect, authorize("user", "admin"), deleteWorkout);

router
  .route("/:id/toggleIsFavorite")
  .post(protect, authorize("user", "admin"), toggleIsFavorite);

export default router;
