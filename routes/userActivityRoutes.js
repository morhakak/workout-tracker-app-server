import express from "express";
import { getUserActivities } from "../controllers/users.js";

import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

router.route("/").get(protect, authorize("user", "admin"), getUserActivities);

export default router;
