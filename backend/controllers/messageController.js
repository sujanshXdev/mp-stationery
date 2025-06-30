import Message from '../models/message.js';
import Notification from '../models/notification.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import APIFilters from '../utils/apiFilters.js';
import sendEmail from '../utils/sendEmail.js';
import { messageReplyTemplate } from '../utils/emailTemplates.js';

// Create new message (from contact form)
export const createMessage = catchAsyncErrors(async (req, res, next) => {
  const { name, email, message } = req.body;

  const newMessage = await Message.create({
    name,
    email,
    message
  });

  // Create notification for new message
  await Notification.create({
    message: `New message from ${name}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
    type: 'message',
    messageRef: newMessage._id
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully!',
    data: newMessage
  });
});

// Get all messages (admin only)
export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 10;
  const messagesCount = await Message.countDocuments();

  const apiFilters = new APIFilters(Message.find(), req.query)
    .search()
    .filters();

  let messages = await apiFilters.query;
  const filteredMessagesCount = messages.length;

  apiFilters.pagination(resPerPage);

  messages = await apiFilters.query.clone();

  res.status(200).json({
    success: true,
    messagesCount,
    resPerPage,
    filteredMessagesCount,
    messages
  });
});

// Get single message details
export const getMessageDetails = catchAsyncErrors(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new ErrorHandler('Message not found', 404));
  }

  // Mark as read if not already read
  if (!message.read) {
    message.read = true;
    await message.save();
  }

  res.status(200).json({
    success: true,
    message
  });
});

// Mark message as read
export const markAsRead = catchAsyncErrors(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new ErrorHandler('Message not found', 404));
  }

  message.read = true;
  await message.save();

  res.status(200).json({
    success: true,
    message: 'Message marked as read'
  });
});

// Mark message as unread
export const markAsUnread = catchAsyncErrors(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new ErrorHandler('Message not found', 404));
  }

  message.read = false;
  await message.save();

  res.status(200).json({
    success: true,
    message: 'Message marked as unread'
  });
});

// Reply to message
export const replyToMessage = catchAsyncErrors(async (req, res, next) => {
  const { replyMessage } = req.body;

  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new ErrorHandler('Message not found', 404));
  }

  message.replyMessage = replyMessage;
  message.replied = true;
  message.repliedAt = Date.now();
  message.repliedBy = req.user.id;
  await message.save();

  // Send email notification to the original sender using the new template
  try {
    const emailData = {
      email: message.email,
      subject: `Reply to your message - MP Books & Stationery`,
      message: messageReplyTemplate(message.name, message.message, replyMessage)
    };

    await sendEmail(emailData);
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't fail the request if email sending fails
  }

  res.status(200).json({
    success: true,
    message: 'Reply sent successfully'
  });
});

// Delete message
export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new ErrorHandler('Message not found', 404));
  }

  await message.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// Get message statistics
export const getMessageStats = catchAsyncErrors(async (req, res, next) => {
  const total = await Message.countDocuments();
  const unread = await Message.countDocuments({ read: false });
  const replied = await Message.countDocuments({ replied: true });
  
  // Count messages from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await Message.countDocuments({
    createdAt: { $gte: today }
  });

  res.status(200).json({
    success: true,
    stats: {
      total,
      unread,
      replied,
      today: todayCount
    }
  });
}); 