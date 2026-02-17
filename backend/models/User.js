import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    idNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true },

    role: {
      type: String,
      required: true,
      enum: [
        "Registrar",
        "Dept Head",
        "Finance",
        "Super Admin",
        "Faculty",
        "Student",
      ],
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    // Add these inside UserSchema

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
    },
    isTemporaryPassword: {
      type: Boolean,
      default: true, // new accounts start as temporary
    },

    department: { type: String, required: true },
    notes: String,
    createdBy: {
      type: String,
      enum: ["SuperAdmin", "Registrar"],
      default: "SuperAdmin",
    },

    password: { type: String, required: true },

    credentialsSent: {
      type: Boolean,
      default: false,
    },
    resetCode: {
  type: String,
},

resetCodeExpires: {
  type: Date,
},

resetAttempts: {
  type: Number,
  default: 0,
},

resetLockUntil: {
  type: Date,
},
resetVerified: {
  type: Boolean,
  default: false,
},


  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
