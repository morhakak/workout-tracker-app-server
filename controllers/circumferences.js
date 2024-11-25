import Circumference from "../models/Circumference.js";
import Activity from "../models/Activity.js";
import { convertToCm } from "../utils/conversionHelper.js";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";

export const getCircumferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 3;
  const skip = (page - 1) * limit;

  const circumferences = await Circumference.find({ userId })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const totalCircumferences = await Circumference.countDocuments({ userId });

  res.status(200).json({
    success: true,
    data: circumferences,
    meta: {
      total: totalCircumferences,
      page,
      limit,
      totalPages: Math.ceil(totalCircumferences / limit),
    },
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

export const updateCircumference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { circumference, unit } = req.body;
  const userId = req.user.id;

  if (!circumference || !circumference._id) {
    return res.status(400).json({ message: "Invalid circumference data." });
  }

  const {
    _id,
    userId: circumferenceUserId,
    __v,
    ...updateFields
  } = circumference;

  if (userId !== circumferenceUserId)
    return new ErrorResponse("User cannot update this circumference", 401);

  if (unit === "imperial") {
    for (const key in updateFields) {
      if (typeof updateFields[key] === "number") {
        updateFields[key] = convertToCm(updateFields[key]);
      }
    }
  }

  const updatedCircumference = await Circumference.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!circumference) {
    return new ErrorResponse("Circumference entry not found", 404);
  }

  const activity = new Activity({
    userId,
    activityType: "circumference",
    activityValue: `Updated circumference`,
  });
  await activity.save();

  res.status(200).json({ success: true, data: updatedCircumference });
});

export const deleteCircumference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const circumferenceToDelete = await Circumference.findOneAndDelete({
    _id: id,
    userId,
  });

  if (!circumferenceToDelete) {
    return new ErrorResponse(
      `circumference entry not found or unauthorized access`,
      404
    );
  }

  const activity = new Activity({
    userId: userId,
    activityType: "circumference",
    activityValue: "Deleted circumference",
  });

  await activity.save();

  res.status(200).json({ success: true, data: circumferenceToDelete });
});
