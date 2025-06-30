import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "payment", "system", "message"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    order: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
    messageRef: {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
