import Weighing from "../models/Weighing.js";
import Activity from "../models/Activity.js";
import { convertToKg } from "../utils/conversionHelper.js";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";

export const getWeighings = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;
  const skip = (page - 1) * limit;

  const weighings = await Weighing.find({ userId })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const totalWeighings = await Weighing.countDocuments({ userId });

  res.status(200).json({
    success: true,
    data: weighings,
    meta: {
      total: totalWeighings,
      page,
      limit,
      totalPages: Math.ceil(totalWeighings / limit),
    },
  });
});

export const addWeighing = asyncHandler(async (req, res) => {
  const { weight, unit } = req.body;
  const userId = req.user.id;

  if (!weight) {
    return new ErrorResponse("Invalid weight", 400);
  }

  const convertedWeight = unit === "imperial" ? convertToKg(weight) : weight;

  const newWeighing = await Weighing.create({
    userId,
    weight: convertedWeight,
  });

  const activity = new Activity({
    userId,
    activityType: "weighing",
    activityValue: `Add weighing - ${weight} ${
      unit == "imperial" ? "lbs" : "kg"
    }`,
  });

  await activity.save();

  res.status(200).json({ success: true, data: newWeighing });
});

export const updateWeighing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { weight, unit } = req.body;
  const userId = req.user.id;

  const weighing = await Weighing.findOne({ _id: id, userId });

  if (!weighing) {
    return new ErrorResponse("Weighing entry not found", 404);
  }

  weighing.weight = unit === "imperial" ? convertToKg(weight) : weight;

  await weighing.save();

  const activity = new Activity({
    userId,
    activityType: "weighing",
    activityValue: `Updated weight - ${weighing.weight} {${
      unit == "imperial" ? "lbs" : "kg"
    }}`,
  });
  await activity.save();

  console.log(weighing);

  res.status(200).json({ success: true, data: weighing });
});

export const deleteWeighing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const weighing = await Weighing.findOneAndDelete({ _id: id, userId });

  if (!weighing) {
    return new ErrorResponse(
      `Weighing entry not found or unauthorized access`,
      404
    );
  }

  const activity = new Activity({
    userId,
    activityType: "weighing",
    activityValue: `Deleted weighing with weight - ${weighing.weight}`,
  });
  await activity.save();

  res
    .status(200)
    .json({ success: true, message: "Weighing entry deleted successfully" });
});
