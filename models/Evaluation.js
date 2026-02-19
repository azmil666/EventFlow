import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    scores: {
      innovation: { type: Number, min: 0, max: 10, required: true },
      execution: { type: Number, min: 0, max: 10, required: true },
      presentation: { type: Number, min: 0, max: 10, required: true },
      impact: { type: Number, min: 0, max: 10, required: true },
    },
    feedback: {
      type: String,
      maxlength: [1000, "Feedback cannot exceed 1000 characters"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate evaluations by the same judge for the same submission
EvaluationSchema.index({ submission: 1, judge: 1 }, { unique: true });

export default mongoose.models.Evaluation ||
  mongoose.model("Evaluation", EvaluationSchema);
