import express from "express";
import {
  addCircumference,
  getCircumference,
  getWeight,
  addWeight,
  getHeight,
  addHeight,
} from "../controllers/measurements.js";

import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

router
  .route("/weight")
  .get(protect, authorize("user", "admin"), getWeight)
  .post(protect, authorize("user", "admin"), addWeight);

router
  .route("/height")
  .get(protect, authorize("user", "admin"), getHeight)
  .post(protect, authorize("user", "admin"), addHeight);

router
  .route("/circumference")
  .get(protect, authorize("user", "admin"), getCircumference)
  .post(protect, authorize("user", "admin"), addCircumference);
export default router;
