import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    unique: [true, "Email already exists"],
    required: [true, "Please add an email"],
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please add a valid email"],
    dropDups: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  measurements: {
    height: Number,
    // weighings: [
    //   {
    //     weight: Number,
    //     date: { type: Date, default: Date.now },
    //   },
    // ],
    circumference: [
      {
        neck: Number,
        shoulders: Number,
        chest: Number,
        rightArm: Number,
        leftArm: Number,
        waist: Number,
        rightThigh: Number,
        leftThigh: Number,
        rightCalf: Number,
        leftCalf: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", UserSchema);
export default User;
