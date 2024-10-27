import experess from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = experess.Router({ mergeParams: true });

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
