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
  // let totalVolume = 0;
  // for (let i = 0; i < this.exercises.length; i++) {
  //   const exercise = this.exercises[i];

  //   let exerciseVolume = 0;
  //   exercise.sets.forEach((set) => {
  //     if (set) {
  //       exerciseVolume += set.reps * set.weight;
  //     }
  //   });

  //   exercise.volume = exerciseVolume;

  //   totalVolume += exercise.volume;
  // }

  // this.volume = totalVolume;

  // // Check if exercises array is populated
  // console.log("Exercises in workout:", this.exercises);

  // if (!this.exercises || this.exercises.length === 0) {
  //   console.error("No exercises found in workout");
  //   return;
  // }

  // for (let i = 0; i < this.exercises.length; i++) {
  //   const exercise = this.exercises[i];

  //   // Create a new session object
  //   const newSession = {
  //     totalSets: exercise.sets.length,
  //     reps: exercise.sets[0].reps, // Assuming all sets have the same reps for simplicity
  //     weight: exercise.sets[0].weight, // Assuming all sets have the same weight for simplicity
  //     createdDate: new Date(), // Use the current date
  //   };

  //   console.log(`Updating exercise history for ${exercise.name}`);

  //   // Update or create the exercise history
  //   await ExerciseHistory.findOneAndUpdate(
  //     { exerciseId: exercise.name, userId: this.user },
  //     { $push: { sessions: newSession } }, // Push the new session to the sessions array
  //     { new: true, upsert: true } // Create if not exists
  //   );
  // }

  next();
});

// WorkoutSchema.pre("findOneAndUpdate", async function (next) {
//   const update = this.getUpdate();
//   const exercises = update.exercises;

//   if (exercises && exercises.length > 0) {
//     let totalVolume = 0;

//     for (let i = 0; i < exercises.length; i++) {
//       const exercise = exercises[i];
//       let exerciseVolume = 0;

//       // Create an array to hold the sets for this session
//       const sessionSets = [];

//       // Iterate over each set and calculate its volume
//       exercise.sets.forEach((set) => {
//         if (set) {
//           const setVolume = set.reps * set.weight;
//           exerciseVolume += setVolume;

//           // Push the individual set's data to the sessionSets array
//           sessionSets.push({
//             reps: set.reps,
//             weight: set.weight,
//             createdDate: new Date(), // Record the time of this set
//           });
//         }
//       });

//       exercise.volume = exerciseVolume;
//       totalVolume += exercise.volume;

//       const workout = await this.model.findOne(this.getQuery());

//       // Create the session object with the sets array
//       const newSession = {
//         sets: sessionSets, // Store the sets with varying reps/weight
//         createdDate: new Date(),
//         volume: totalVolume,
//         workout: {
//           workoutId: workout._id, // Reference the workout's ObjectId
//           workoutName: workout.name, // Store the workout name
//         },
//       };

//       console.log(`Updating exercise history for ${exercise.name}`);
//       console.log(`Workout id ${workout._id}`);
//       console.log(`Workout name ${workout.name}`);

//       // Update or create the exercise history for the user
//       await ExerciseHistory.findOneAndUpdate(
//         { exerciseId: exercise.name, userId: update.user },
//         { $push: { sessions: newSession } }, // Push the new session with detailed sets
//         { new: true, upsert: true }
//       );
//     }

//     // Update the total volume for the workout
//     update.volume = totalVolume;
//   }

//   next();
// });

WorkoutSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const exercises = update.exercises;

  if (exercises && exercises.length > 0) {
    let totalVolume = 0;

    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      let exerciseVolume = 0;

      // Create an array to hold the sets for this session
      const sessionSets = [];

      // Iterate over each set and calculate its volume
      exercise.sets.forEach((set) => {
        if (set) {
          const setVolume = set.reps * set.weight;
          exerciseVolume += setVolume;

          // Push the individual set's data to the sessionSets array
          sessionSets.push({
            reps: set.reps,
            weight: set.weight,
            createdDate: new Date(), // Record the time of this set
          });
        }
      });

      exercise.volume = exerciseVolume;
      totalVolume += exercise.volume;

      const workout = await this.model.findOne(this.getQuery());

      // Find the exercise history for this exercise and user
      const existingExerciseHistory = await ExerciseHistory.findOne({
        exerciseId: exercise.name,
        userId: update.user,
      });

      if (existingExerciseHistory) {
        // Check if a session for this workout already exists
        const existingSessionIndex = existingExerciseHistory.sessions.findIndex(
          (session) => session.workout.workoutId.equals(workout._id)
        );

        if (existingSessionIndex > -1) {
          // Update the existing session with new sets and volume
          existingExerciseHistory.sessions[existingSessionIndex].sets =
            sessionSets;
          existingExerciseHistory.sessions[existingSessionIndex].volume =
            exerciseVolume;
          existingExerciseHistory.sessions[existingSessionIndex].createdDate =
            new Date();
        } else {
          // If no session for this workout exists, create a new session
          existingExerciseHistory.sessions.push({
            sets: sessionSets,
            createdDate: new Date(),
            volume: exerciseVolume,
            workout: {
              workoutId: workout._id, // Reference the workout's ObjectId
              workoutName: workout.name, // Store the workout name
            },
          });
        }

        // Save the updated exercise history
        await existingExerciseHistory.save();
      } else {
        // If no exercise history exists, create a new record
        const newSession = {
          sets: sessionSets, // Store the sets with varying reps/weight
          createdDate: new Date(),
          volume: exerciseVolume,
          workout: {
            workoutId: workout._id, // Reference the workout's ObjectId
            workoutName: workout.name, // Store the workout name
          },
        };

        await ExerciseHistory.findOneAndUpdate(
          { exerciseId: exercise.name, userId: update.user },
          { $push: { sessions: newSession } },
          { new: true, upsert: true }
        );
      }
    }

    // Update the total volume for the workout
    update.volume = totalVolume;
  }

  next();
});

WorkoutSchema.post("deleteOne", { document: true }, async function (doc) {
  const workoutId = doc._id;

  // Log the workout being deleted
  console.log(`Deleting workout with id ${workoutId}`);

  // Find and remove all sessions linked to the workout in exercise history
  const result = await ExerciseHistory.updateMany(
    { "sessions.workout.workoutId": workoutId }, // Match sessions with the workout ID
    { $pull: { sessions: { "workout.workoutId": workoutId } } }, // Remove the session
    { multi: true }
  );

  // Log the result of session deletion
  console.log(`Session deletion result:`, result);
});

const Workout = mongoose.model("Workout", WorkoutSchema);
export default Workout;
