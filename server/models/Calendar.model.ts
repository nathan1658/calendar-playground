import mongoose from "mongoose";
import type { ICalendar, ICalendarPermission } from "~/types/database";

const { Schema, model, models } = mongoose;

const calendarPermissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accessLevel: {
      type: String,
      enum: ["view", "edit"],
      required: true,
    },
  },
  { _id: false },
);

const calendarSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    permissions: [calendarPermissionSchema],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// Index for performance on permissions queries
calendarSchema.index({ "permissions.userId": 1 });
calendarSchema.index({ ownerId: 1 });
calendarSchema.index({ name: 1 });

export const Calendar = models.Calendar || model<ICalendar>("Calendar", calendarSchema);
