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
  const userId = req.user?._id;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  if (!userId) {
    return next(new ErrorResponse("User not authenticated", 401));
  }
  const activities = await Activity.find({ userId })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const totalactivities = await Activity.countDocuments({ userId });

  res.status(200).json({
    success: true,
    data: activities,
    meta: {
      total: totalactivities,
      page,
      limit,
      totalPages: Math.ceil(totalactivities / limit),
    },
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
