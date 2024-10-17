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

ExerciseHistorySchema.pre("save", async function (next) {
  this.slug = slugify(this.exerciseId, { lower: true });
});

ExerciseHistorySchema.methods.recalculateMaxValues = function () {
  let maxWeight = 0;
  let maxReps = 0;
  let maxVolume = 0;
  let oneRepMax = 0;

  let maxWeightWorkout = {};
  let maxRepsWorkout = {};
  let maxVolumeWorkout = {};
  let oneRepMaxWorkout = {};

  this.sessions.forEach((session) => {
    let sessionVolume = 0;

    session.sets.forEach((set) => {
      const setVolume = set.reps * set.weight;
      sessionVolume += setVolume;

      if (set.weight > maxWeight) {
        maxWeight = set.weight;
        maxWeightWorkout = {
          workoutId: session.workout.workoutId,
          workoutName: session.workout.workoutName,
        };
      }

      if (set.reps > maxReps) {
        maxReps = set.reps;
        maxRepsWorkout = {
          workoutId: session.workout.workoutId,
          workoutName: session.workout.workoutName,
        };
      }

      const currentOneRepMax = set.weight * (1 + set.reps / 30);
      if (currentOneRepMax > oneRepMax) {
        oneRepMax = currentOneRepMax;
        oneRepMaxWorkout = {
          workoutId: session.workout.workoutId,
          workoutName: session.workout.workoutName,
        };
      }
    });

    session.volume = sessionVolume;

    if (sessionVolume > maxVolume) {
      maxVolume = sessionVolume;
      maxVolumeWorkout = {
        workoutId: session.workout.workoutId,
        workoutName: session.workout.workoutName,
      };
    }
  });

  this.maxWeight = {
    value: maxWeight,
    workout: maxWeightWorkout,
  };
  this.maxReps = {
    value: maxReps,
    workout: maxRepsWorkout,
  };
  this.maxVolume = {
    value: maxVolume,
    workout: maxVolumeWorkout,
  };
  this.oneRepMax = {
    value: Math.round(oneRepMax),
    workout: oneRepMaxWorkout,
  };
};

const ExerciseHistory = mongoose.model(
  "ExerciseHistory",
  ExerciseHistorySchema
);

export default ExerciseHistory;
