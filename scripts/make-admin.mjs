import mongoose from "mongoose";
import User from "../models/User.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/eventflow";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

async function makeAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const username = "metrix"; 
    // Case-insensitive search for name
    const user = await User.findOne({ name: { $regex: new RegExp(`^${username}$`, "i") } });

    if (!user) {
      console.log(`User "${username}" not found.`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`Successfully updated user "${user.name}" (Email: ${user.email}) to role "admin".`);
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
}

makeAdmin();
