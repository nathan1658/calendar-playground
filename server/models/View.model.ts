import mongoose from "mongoose";
import type { IView } from "~/types/database";

const { Schema, model, models } = mongoose;

const viewSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    alias: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 1,
      maxlength: 50,
      match: /^[a-zA-Z0-9_-]+$/,
    },
    selectedCalendarIds: [{
      type: Schema.Types.ObjectId,
      ref: "Calendar",
      required: true,
    }],
    columnCount: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
      default: 2,
    },
    paddingPx: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
      default: 16,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// Index for performance on queries
viewSchema.index({ alias: 1 });
viewSchema.index({ createdBy: 1 });
viewSchema.index({ name: 1 });

export const View = models.View || model<IView>("View", viewSchema);