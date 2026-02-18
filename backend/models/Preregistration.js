import mongoose from "mongoose";

function generateRegistrationId() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PR-${year}-${random}`;
}

const preregSchema = new mongoose.Schema(
  {
    blockchainTxHash: String,
    registrationId: {
      type: String,
      unique: true,
    },

    personal: {
      firstName: String,
      middleName: String,
      lastName: String,
      email: String,
      phone: String,
      birthDate: String,
      gender: String,
      address: String,
    },

    academic: {
      applicantType: String,
      course: String,
      previousSchool: String,
    },

    documents: {
      birthCert: String,
      form137: String,
      goodMoral: String,
      idPhoto: String,
    },

  status: {
  type: String,
  enum: ["Pending", "Approved", "Rejected"],
  default: "Pending",
},

  },
  { timestamps: true }
);

preregSchema.pre("save", function () {
  if (!this.registrationId) {
    this.registrationId = generateRegistrationId();
  }
});


export default mongoose.model("Preregistration", preregSchema);
