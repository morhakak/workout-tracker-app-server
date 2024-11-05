import Circumference from "../models/Circumference.js";
import Activity from "../models/Activity.js";
import { convertToCm } from "../utils/conversionHelper.js";
import User from "../models/User.js";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";

export const getCircumferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const circumferences = await Circumference.find({ userId }).sort({
    date: -1,
  });

  res.status(200).json({
    success: true,
    data: circumferences,
  });
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

  const circumferenceData = {
    userId,
    neck: unit === "imperial" ? convertToCm(neck) : neck,
    shoulders: unit === "imperial" ? convertToCm(shoulders) : shoulders,
    chest: unit === "imperial" ? convertToCm(chest) : chest,
    rightArm: unit === "imperial" ? convertToCm(rightArm) : rightArm,
    leftArm: unit === "imperial" ? convertToCm(leftArm) : leftArm,
    waist: unit === "imperial" ? convertToCm(waist) : waist,
    rightThigh: unit === "imperial" ? convertToCm(rightThigh) : rightThigh,
    leftThigh: unit === "imperial" ? convertToCm(leftThigh) : leftThigh,
    rightCalf: unit === "imperial" ? convertToCm(rightCalf) : rightCalf,
    leftCalf: unit === "imperial" ? convertToCm(leftCalf) : leftCalf,
  };

  const newCircumference = await Circumference.create(circumferenceData);

  const activity = new Activity({
    userId,
    activityType: "circumference",
    activityValue: "Add new circumference measurement",
  });
  await activity.save();

  res.status(201).json({ success: true, data: newCircumference });
});

export const deleteCircumference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    return new ErrorResponse(`User ${req.user} was not found`, 404);
  }

  console.log("Circumference Data:", user.measurements.circumference); // Debug log
  console.log("Deleting ID:", id); // Debug log

  const circumferenceIndex = user.measurements.circumference.findIndex((c) => {
    return c._id.toString() === id;
  });

  if (circumferenceIndex === -1) {
    console.log("Circumference entry not found");

    return res
      .status(404)
      .json({ success: false, error: "Circumference entry not found" });
  }

  user.measurements.circumference.splice(circumferenceIndex, 1);

  const activity = new Activity({
    userId: user._id,
    activityType: "circumference",
    activityValue: `Deleted circumference - ${id}`,
  });
  await activity.save();

  await user.save();

  res.status(200).json({ success: true, data: user.measurements });
});
