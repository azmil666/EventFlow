const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://localhost:27017/eventflow";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: "participant" },
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    location: { type: String, default: "Virtual" },
    status: { type: String, default: "upcoming" },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // Clear existing test data
        await User.deleteMany({ email: "testuser_osq_1@example.com" });
        await Event.deleteMany({ title: "OSQ Hackathon 2026" });

        // Create User
        // Note: Password is 'Password123!' but we don't need the hash for just dashboard access if we bypass login, 
        // but NextAuth will need a real hash. I'll use a known hash for 'Password123!' if I can find one or just use bcrypt.
        const user = await User.create({
            name: "Test User",
            email: "testuser_osq_1@example.com",
            password: "hashed_password", // Placeholder if we don't login via UI
            role: "participant"
        });
        console.log("User seeded:", user._id);

        // Create Event
        const event = await Event.create({
            title: "OSQ Hackathon 2026",
            description: "Building the future of open source.",
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            location: "Online",
            status: "upcoming",
            organizer: user._id
        });
        console.log("Event seeded:", event._id);

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
