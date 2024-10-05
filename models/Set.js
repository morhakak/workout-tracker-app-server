import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  isWarmUp: Boolean,
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Set = mongoose.model("Set", setSchema);
export default Set;
