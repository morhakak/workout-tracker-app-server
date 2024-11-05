import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import Workout from "../models/Workout.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

// export const getWorkouts = asyncHandler(async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   // else if (req.cookies.token) {
//   //   token = req.cookies.token;
//   // }

//   if (!token) {
//     console.log("theres is no token");
//     return next(new ErrorResponse("Not authorized to access this route", 401));
//   }

//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   const workouts = await Workout.find({ user: decoded.id });
//   res
//     .status(200)
//     .json({ success: true, data: workouts, count: workouts.length });
// });

export const getWorkouts = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("there is no token");
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalWorkouts = await Workout.countDocuments({ user: decoded.id });

  const workouts = await Workout.find({ user: decoded.id })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: workouts,
    count: workouts.length,
    totalWorkouts,
    page,
    totalPages: Math.ceil(totalWorkouts / limit),
  });
});

export const getWorkout = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id);
  if (!workout)
    return next(
      new ErrorResponse(`Workout not found with ID of ${req.params.id}`, 404)
    );
  res.status(200).json({ success: true, data: workout });
});

export const createWorkout = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const workout = new Workout(req.body);
  const savedWorkout = await workout.save();

  const user = await User.findById(req.user.id);

  const activity = new Activity({
    userId: user._id,
    activityType: "workout",
    activityValue: `Create workout - ${workout.name}`,
  });
  await activity.save();

  res.status(201).json({ success: true, data: savedWorkout });
});

export const updateWorkout = asyncHandler(async (req, res, next) => {
  req.body.updatedDate = Date.now();
  let workout = await Workout.findById(req.params.id);
  if (!workout)
    return next(
      new ErrorResponse(`Workout not found with ID of ${req.params.id}`, 404)
    );

  if (workout.user.toString() !== req.user.id && req.user.role !== "admin") {
    new ErrorResponse(
      `User ${req.user} is not authorized to update this workout`,
      401
    );
  }

  workout = await Workout.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });

  const user = await User.findById(req.user.id);

  const activity = new Activity({
    userId: user._id,
    activityType: "workout",
    activityValue: `Update workout - ${workout.name}`,
  });
  await activity.save();

  res.status(200).json({ success: true, data: workout });
});

export const deleteWorkout = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id);
  if (!workout)
    return next(
      new ErrorResponse(`Workout not found with ID of ${req.params.id}`, 404)
    );

  if (workout.user.toString() !== req.user.id && req.user.role !== "admin") {
    new ErrorResponse(
      `User ${req.user} is not authorized to delete this workout`,
      401
    );
  }

  await workout.deleteOne();

  const user = await User.findById(req.user.id);

  if (!user) {
    return new ErrorResponse(`User ${req.user} was not found`, 404);
  }

  const activity = new Activity({
    userId: user._id,
    activityType: "workout",
    activityValue: `Delete workout - ${workout.name}`,
  });
  await activity.save();

  res.status(204).json({ success: true, data: {} });
});

export const toggleIsFavorite = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id);
  if (!workout)
    return next(
      new ErrorResponse(`Workout not found with ID of ${req.params.id}`, 404)
    );

  workout.isFavorite = !workout.isFavorite;
  await workout.save();

  res.status(200).json({ success: true, data: workout });
});
