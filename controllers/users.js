import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

export const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    next(new ErrorResponse(`User with ${req.body.id} not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const getUserActivities = asyncHandler(async (req, res, next) => {
  console.log("Received request to get user activities"); // Check if request is reaching here

  const userId = req.user?._id; // Check if user ID is set
  if (!userId) {
    console.log("User ID not found on request object"); // Add this log to check
    return next(new ErrorResponse("User not authenticated", 401));
  }

  const activities = await Activity.find({ userId }).sort({ date: -1 });
  console.log("********* activities get called **************", activities);

  res.status(200).json({
    success: true,
    data: activities,
  });
});

export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
