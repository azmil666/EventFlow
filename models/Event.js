import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: [true, "Event title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"]
        },
        description: { 
            type: String, 
            required: [true, "Description is required"],
            maxlength: [2000, "Description cannot exceed 2000 characters"]
        },
        startDate: { 
            type: Date, 
            required: [true, "Start date is required"] 
        },
        endDate: { 
            type: Date, 
            required: [true, "End date is required"] 
        },
        registrationDeadline: Date,
        organizer: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            // Made optional to allow easier event creation for demo
            required: false 
        },
        status: {
            type: String,
            enum: ["draft", "upcoming", "ongoing", "completed"],
            default: "draft",
        },
        rules: [String],
        tracks: [String],
        modules: {
            judging: { type: Boolean, default: true },
            certificates: { type: Boolean, default: true },
            gallery: { type: Boolean, default: true },
            teams: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

// Index for faster queries
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ organizer: 1 });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
