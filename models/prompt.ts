import mongoose from "mongoose";

const Schema = mongoose.Schema;

const propmtSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    prompt: { type: String, required: true },
  },
  { timestamps: true }
);

const promptModel = mongoose.model("prompt", propmtSchema);
export default promptModel;
