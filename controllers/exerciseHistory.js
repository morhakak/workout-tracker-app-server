import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import ExerciseHistory from "../models/ExerciseHistory.js";

// @desc    Get exercises history for a user
// @route   GET /api/exercise-history
// @access  Private (Authenticated users)
export const getExercisesHistory = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const exerciseHistory = await ExerciseHistory.find({ userId });

  if (!exerciseHistory || exerciseHistory.length === 0) {
    return next(
      new ErrorResponse(
        `No exercise history found for this user. ${userId}`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: exerciseHistory });
});

// @desc    Get exercise history for a user
// @route   GET /api/exercise-history/:id
// @access  Private (Authenticated users)
export const getExerciseHistory = asyncHandler(async (req, res, next) => {
  const exercise = await ExerciseHistory.findById(req.params.id);
  if (!exercise)
    return next(
      new ErrorResponse(`Exercise not found with ID of ${req.params.id}`, 404)
    );
  res.status(200).json({ success: true, data: exercise });
});
