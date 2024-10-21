import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import User from "../models/User.js";

export const getWeight = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("measurements.weight");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const { weight } = user.measurements;

  res.status(200).json({
    success: true,
    data: weight,
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

  res.status(200).json({
    success: true,
    data: { circumference },
  });
});

export const updateWeight = asyncHandler(async (req, res) => {
  const { weight } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!weight) {
    return new ErrorResponse(`Invalid weight`, 400);
  }

  user.measurements.weight.push({ value: weight });
  await user.save();
  res.status(200).json({ success: true, data: user.measurements });
});

export const updateHeight = asyncHandler(async (req, res) => {
  const { height } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (height) {
    user.measurements.height.push(height);
  }

  await user.save();

  res.status(200).json({ success: true, data: user.measurements });
});

export const addCircumference = asyncHandler(async (req, res) => {
  console.log("this is the req.body", req.body);

  const {
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

  await user.save();

  res.status(200).json({ success: true, data: user.measurements });
});
