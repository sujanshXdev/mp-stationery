import Notification from "../models/notification.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// Get all notifications => /api/v1/notifications
export const getNotifications = catchAsyncErrors(async (req, res, next) => {
  const notifications = await Notification.find()
    .populate('order', 'orderItems totalAmount status')
    .populate('messageRef', 'name email message')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    notifications,
  });
});

// Update notification read status => /api/v1/notifications/:id
export const updateNotification = catchAsyncErrors(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  notification.read = req.body.read;
  await notification.save();

  res.status(200).json({
    success: true,
    notification,
  });
});

// Create notification => /api/v1/notifications
export const createNotification = catchAsyncErrors(async (req, res, next) => {
  const { message, type, order } = req.body;

  const notification = await Notification.create({
    message,
    type,
    order,
  });

  res.status(201).json({
    success: true,
    notification,
  });
});

export const markAllAsRead = catchAsyncErrors(async (req, res, next) => {
  await Notification.updateMany({ read: false }, { $set: { read: true } });

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
  });
});
