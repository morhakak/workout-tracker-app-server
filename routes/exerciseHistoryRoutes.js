import express from "express";
import {
  getExercisesHistory,
  getExerciseHistory,
} from "../controllers/exerciseHistory.js";

import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

router.route("/").get(protect, authorize("user", "admin"), getExercisesHistory);
router
  .route("/:id")
  .get(protect, authorize("user", "admin"), getExerciseHistory);

export default router;
