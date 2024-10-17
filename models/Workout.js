import mongoose from "mongoose";
import Exercise from "./Exercise.js";
import ExerciseHistory from "./ExerciseHistory.js";
import slugify from "slugify";

const WorkoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please select a workout name"],
  },
  type: {
    type: Array,
  },
  slug: String,
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  exercises: {
    type: [Exercise.schema],
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  volume: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

WorkoutSchema.pre("save", async function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

WorkoutSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const exercises = update.exercises;

  const workout = await this.model.findOne(this.getQuery());

  const oldExercises = workout.exercises.map((e) => e.name);
  const updatedExercises = update.exercises?.map((e) => e.name) || [];

  const removedExercises = oldExercises.filter(
    (exerciseName) => !updatedExercises.includes(exerciseName)
  );

  if (removedExercises.length > 0) {
    for (const exerciseName of removedExercises) {
      const existingExerciseHistory = await ExerciseHistory.findOneAndUpdate(
        { exerciseId: exerciseName, userId: workout.user },
        { $pull: { sessions: { "workout.workoutId": workout._id } } },
        { new: true }
      );

      if (existingExerciseHistory) {
        await existingExerciseHistory.recalculateMaxValues();
        await existingExerciseHistory.save();
      }

      console.log("Exercise history after update: ", existingExerciseHistory);
    }
  }

  if (exercises && exercises.length > 0) {
    let totalVolume = 0;

    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      let exerciseVolume = 0;
      const sessionSets = [];

      exercise.sets.forEach((set) => {
        if (set) {
          const setVolume = set.reps * set.weight;
          exerciseVolume += setVolume;

          sessionSets.push({
            reps: set.reps,
            weight: set.weight,
            createdDate: new Date(),
          });
        }
      });

      exercise.volume = exerciseVolume;
      totalVolume += exercise.volume;

      const existingExerciseHistory = await ExerciseHistory.findOne({
        exerciseId: exercise.name,
        userId: update.user,
      });

      if (existingExerciseHistory) {
        const existingSessionIndex = existingExerciseHistory.sessions.findIndex(
          (session) => session.workout.workoutId.equals(workout._id)
        );

        if (existingSessionIndex > -1) {
          existingExerciseHistory.sessions[existingSessionIndex].sets =
            sessionSets;
          existingExerciseHistory.sessions[existingSessionIndex].volume =
            exerciseVolume;
          existingExerciseHistory.sessions[existingSessionIndex].createdDate =
            new Date();
        } else {
          existingExerciseHistory.sessions.push({
            sets: sessionSets,
            createdDate: new Date(),
            volume: exerciseVolume,
            workout: {
              workoutId: workout._id,
              workoutName: workout.name,
            },
          });
        }

        await existingExerciseHistory.recalculateMaxValues();
        await existingExerciseHistory.save();
      } else {
        const newSession = {
          sets: sessionSets,
          createdDate: new Date(),
          volume: exerciseVolume,
          workout: {
            workoutId: workout._id,
            workoutName: workout.name,
          },
        };

        const newExerciseHistory = new ExerciseHistory({
          exerciseId: exercise.name,
          userId: update.user,
          sessions: [newSession],
        });

        await newExerciseHistory.recalculateMaxValues();
        await newExerciseHistory.save();
      }
    }

    update.volume = totalVolume;
  }

  next();
});

WorkoutSchema.post("deleteOne", { document: true }, async function (doc) {
  const workoutId = doc._id;

  const exerciseHistories = await ExerciseHistory.find({
    "sessions.workout.workoutId": workoutId,
  });

  for (let history of exerciseHistories) {
    history.sessions = history.sessions.filter(
      (session) => !session.workout.workoutId.equals(workoutId)
    );

    await history.recalculateMaxValues();
    await history.save();
  }
});

const Workout = mongoose.model("Workout", WorkoutSchema);
export default Workout;
