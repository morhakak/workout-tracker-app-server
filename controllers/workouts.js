import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import Workout from "../models/Workout.js";

export const getWorkouts = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  if (!token) {
    console.log("theres is no token");
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const workouts = await Workout.find({ user: decoded.id });
  res
    .status(200)
    .json({ success: true, data: workouts, count: workouts.length });
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
  console.log("Workout data:", req.body); // Log the workout data sent from the frontend
  req.body.user = req.user.id;
  const workout = new Workout(req.body);
  const savedWorkout = await workout.save();
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

  // Calculate volumes for each exercise
  // req.body.exercises.forEach((exercise) => {
  //   let exerciseVolume = 0;
  //   exercise.sets.forEach((set) => {
  //     exerciseVolume += set.reps * set.weight;
  //   });
  //   exercise.volume = exerciseVolume; // Add calculated volume to each exercise
  // });

  // Calculate total workout volume
  // const totalVolume = req.body.exercises.reduce(
  //   (acc, exercise) => acc + exercise.volume,
  //   0
  // );
  // req.body.volume = totalVolume; // Set the total workout volume

  workout = await Workout.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });

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
