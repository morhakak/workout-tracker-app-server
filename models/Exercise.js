import mongoose from "mongoose";
import Set from "./Set.js";

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  bodyPart: {
    type: String,
    required: [false, "Please add a body part"],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  sets: {
    type: [Set.schema],
    required: true,
  },
  volume: {
    type: Number,
  },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;
