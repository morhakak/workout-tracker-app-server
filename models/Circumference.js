import mongoose from "mongoose";

const CircumferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  neck: {
    type: Number,
    min: [0.1, "Neck measurement must be greater than 0"],
    required: [true, "Neck measurement is required"],
  },
  shoulders: {
    type: Number,
    min: [0.1, "Shoulders measurement must be greater than 0"],
    required: [true, "Shoulders measurement is required"],
  },
  chest: {
    type: Number,
    min: [0.1, "Chest measurement must be greater than 0"],
    required: [true, "Chest measurement is required"],
  },
  rightArm: {
    type: Number,
    min: [0.1, "Right arm measurement must be greater than 0"],
    required: [true, "Right arm measurement is required"],
  },
  leftArm: {
    type: Number,
    min: [0.1, "Left arm measurement must be greater than 0"],
    required: [true, "Left arm measurement is required"],
  },
  waist: {
    type: Number,
    min: [0.1, "Waist measurement must be greater than 0"],
    required: [true, "Waist measurement is required"],
  },
  rightThigh: {
    type: Number,
    min: [0.1, "Right thigh measurement must be greater than 0"],
    required: [true, "Right thigh measurement is required"],
  },
  leftThigh: {
    type: Number,
    min: [0.1, "Left thigh measurement must be greater than 0"],
    required: [true, "Left thigh measurement is required"],
  },
  rightCalf: {
    type: Number,
    min: [0.1, "Right calf measurement must be greater than 0"],
    required: [true, "Right calf measurement is required"],
  },
  leftCalf: {
    type: Number,
    min: [0.1, "Left calf measurement must be greater than 0"],
    required: [true, "Left calf measurement is required"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Circumference = mongoose.model("Circumference", CircumferenceSchema);
export default Circumference;
