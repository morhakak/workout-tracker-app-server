import express from "express";
import {
  addCircumference,
  getCircumference,
  getWeight,
  updateWeight,
  getHeight,
  updateHeight,
} from "../controllers/measurements.js";

import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

router
  .route("/weight")
  .get(protect, authorize("user", "admin"), getWeight)
  .post(protect, authorize("user", "admin"), updateWeight);

router
  .route("/height")
  .get(protect, authorize("user", "admin"), getHeight)
  .post(protect, authorize("user", "admin"), updateHeight);

router
  .route("/circumference")
  .get(protect, authorize("user", "admin"), getCircumference)
  .post(protect, authorize("user", "admin"), addCircumference);
export default router;
