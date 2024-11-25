import express from "express";
import { getHeight, addHeight } from "../controllers/height.js";
import {
  getWeighings,
  addWeighing,
  updateWeighing,
  deleteWeighing,
} from "../controllers/weighings.js";
import {
  addCircumference,
  getCircumferences,
  deleteCircumference,
  updateCircumference,
} from "../controllers/circumferences.js";
import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

router
  .route("/weighings")
  .get(protect, authorize("user", "admin"), getWeighings)
  .post(protect, authorize("user", "admin"), addWeighing);

router
  .route("/weighings/:id")
  .delete(protect, authorize("user", "admin"), deleteWeighing)
  .put(protect, authorize("user", "admin"), updateWeighing);

router
  .route("/height")
  .get(protect, authorize("user", "admin"), getHeight)
  .post(protect, authorize("user", "admin"), addHeight);

router
  .route("/circumferences")
  .get(protect, authorize("user", "admin"), getCircumferences)
  .post(protect, authorize("user", "admin"), addCircumference);

router
  .route("/circumferences/:id")
  .delete(protect, authorize("user", "admin"), deleteCircumference)
  .put(protect, authorize("user", "admin"), updateCircumference);

export default router;
