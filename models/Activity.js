import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  activityType: { type: String, required: true },
  activityValue: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
