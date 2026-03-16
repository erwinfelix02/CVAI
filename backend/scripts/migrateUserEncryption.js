import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find().select(
      "+emailHash +idNumberHash +phoneHash +departmentHash",
    );

    console.log(`Found ${users.length} users`);

    for (const user of users) {
      await user.save(); // pre-save hook encrypts old plaintext fields + fills hash fields
      console.log(`Migrated user ${user._id}`);
    }

    await User.syncIndexes();
    console.log("Indexes synced");

    await mongoose.disconnect();
    console.log("Done");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();