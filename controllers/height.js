import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import User from "../models/User.js";
import { convertToCm } from "../utils/conversionHelper.js";
import Activity from "../models/Activity.js";

export const getHeight = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("measurements.height");

  if (!user) {
    return new ErrorResponse("User not found", 404);
  }

  const { height } = user.measurements;

  res.status(200).json({
    success: true,
    data: height,
  });
});

export const addHeight = asyncHandler(async (req, res) => {
  const { height, unit } = req.body;
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!height) {
    return new ErrorResponse(`Invalid height`, 400);
  }

  if (unit === "imperial") {
    user.measurements.height.push(convertToCm(height));
  } else {
    user.measurements.height.push(height);
  }

  const activity = new Activity({
    userId: user._id,
    activityType: "height",
    activityValue: `Add height - ${height}`,
  });
  await activity.save();

  await user.save();

  res.status(200).json({ success: true, data: user.measurements });
});
