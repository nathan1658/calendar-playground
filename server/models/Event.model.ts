import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export interface IEvent {
  _id: string;
  calendarId: string;
  subject: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema(
  {
    calendarId: {
      type: Schema.Types.ObjectId,
      ref: "Calendar",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    allDay: {
      type: Boolean,
      default: false,
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

// Compound indexes for performance on common queries
eventSchema.index({ calendarId: 1, startTime: 1 });
eventSchema.index({ calendarId: 1, endTime: 1 });
eventSchema.index({ startTime: 1, endTime: 1 });
eventSchema.index({ createdBy: 1 });

// Validation: endTime should be after startTime
eventSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    const error = new Error("End time must be after start time");
    return next(error);
  }
  next();
});

export const Event = models.Event || model<IEvent>("Event", eventSchema);
