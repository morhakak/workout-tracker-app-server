import mongoose from "mongoose";

const WeighingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  weight: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Weighing = mongoose.model("Weighing", WeighingSchema);
export default Weighing;
