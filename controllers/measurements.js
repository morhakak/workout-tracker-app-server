import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import User from "../models/User.js";
import { convertToCm, convertToKg } from "../utils/conversionHelper.js";
import Activity from "../models/Activity.js";

export const getWeight = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("measurements.weight");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const { weight } = user.measurements;

  const sortedWeight = weight.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  res.status(200).json({
    success: true,
    data: sortedWeight,
  });
});

export const getHeight = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("measurements.height");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const { height } = user.measurements;

  res.status(200).json({
    success: true,
    data: height,
  });
});

export const getCircumference = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("measurements.circumference");

  if (!user) {
    return new ErrorResponse(`User ${req.user} was not found`, 404);
  }

  const { circumference } = user.measurements;

  const sortedCircumference = circumference.sort(
    (b, a) => new Date(a.date) - new Date(b.date)
  );

  res.status(200).json({
    success: true,
    data: { sortedCircumference },
  });
});

export const addWeight = asyncHandler(async (req, res) => {
  const { weight, unit } = req.body;
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!weight) {
    return new ErrorResponse(`Invalid weight`, 400);
  }

  if (unit === "imperial") {
    user.measurements.weight.push({ value: convertToKg(weight) });
  } else {
    user.measurements.weight.push({ value: weight });
  }

  const activity = new Activity({
    userId: user._id,
    activityType: "weighing",
    activityValue: `Add weight - ${weight}`,
  });
  await activity.save();

  await user.save();
  res.status(200).json({ success: true, data: user.measurements });
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

export const addCircumference = asyncHandler(async (req, res) => {
  const {
    unit,
    neck,
    shoulders,
    chest,
    rightArm,
    leftArm,
    waist,
    rightThigh,
    leftThigh,
    rightCalf,
    leftCalf,
  } = req.body;

  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    return new ErrorResponse(`User ${req.user} was not found`, 404);
  }

  if (unit === "imperial") {
    user.measurements.circumference.push({
      neck: convertToCm(neck),
      shoulders: convertToCm(shoulders),
      chest: convertToCm(chest),
      rightArm: convertToCm(rightArm),
      leftArm: convertToCm(leftArm),
      waist: convertToCm(waist),
      rightThigh: convertToCm(rightThigh),
      leftThigh: convertToCm(leftThigh),
      rightCalf: convertToCm(rightCalf),
      leftCalf: convertToCm(leftCalf),
    });
  } else {
    user.measurements.circumference.push({
      neck,
      shoulders,
      chest,
      rightArm,
      leftArm,
      waist,
      rightThigh,
      leftThigh,
      rightCalf,
      leftCalf,
    });
  }

  const activity = new Activity({
    userId: user._id,
    activityType: "height",
    activityValue: `Add new circumference`,
  });
  await activity.save();

  await user.save();

  res.status(200).json({ success: true, data: user.measurements });
});
