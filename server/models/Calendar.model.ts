import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export interface ICalendarPermission {
  userId: string;
  accessLevel: "view" | "edit";
}

export interface ICalendar {
  _id: string;
  name: string;
  category?: string;
  ownerId?: string;
  permissions: ICalendarPermission[];
  createdAt: Date;
  updatedAt: Date;
}

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
