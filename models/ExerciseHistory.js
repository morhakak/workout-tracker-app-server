import mongoose from "mongoose";
import slugify from "slugify";

const ExerciseHistorySchema = new mongoose.Schema({
  exerciseId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  slug: String,
  sessions: [
    {
      sets: [
        {
          reps: {
            type: Number,
            required: true,
          },
          weight: {
            type: Number,
            required: true,
          },
          createdDate: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      workout: {
        workoutId: {
          type: mongoose.Schema.ObjectId,
          ref: "Workout",
          required: true,
        },
        workoutName: {
          type: String,
          required: true,
        },
      },
      createdDate: {
        type: Date,
        default: Date.now,
      },
      volume: {
        type: Number,
      },
    },
  ],
  oneRepMax: {
    value: { type: Number },
    workout: {
      workoutId: { type: mongoose.Schema.ObjectId, ref: "Workout" },
      workoutName: { type: String },
    },
  },
  maxWeight: {
    value: { type: Number },
    workout: {
      workoutId: { type: mongoose.Schema.ObjectId, ref: "Workout" },
      workoutName: { type: String },
    },
  },
  maxReps: {
    value: { type: Number },
    workout: {
      workoutId: { type: mongoose.Schema.ObjectId, ref: "Workout" },
      workoutName: { type: String },
    },
  },
  maxVolume: {
    value: { type: Number },
    workout: {
      workoutId: { type: mongoose.Schema.ObjectId, ref: "Workout" },
      workoutName: { type: String },
    },
  },
});

const ExerciseHistory = mongoose.model(
  "ExerciseHistory",
  ExerciseHistorySchema
);

ExerciseHistorySchema.pre("save", async function (next) {
  this.slug = slugify(this.exerciseId, { lower: true });
});

export default ExerciseHistory;
