import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js';
import {
  createMessage,
  getAllMessages,
  getMessageDetails,
  markAsRead,
  markAsUnread,
  replyToMessage,
  deleteMessage,
  getMessageStats
} from '../controllers/messageController.js';

const router = express.Router();

// Public route - for contact form submissions
router.route('/contact').post(createMessage);

// Admin routes - require authentication and admin role
router.route('/admin/messages').get(isAuthenticatedUser, authorizeRoles('admin'), getAllMessages);
router.route('/admin/messages/stats').get(isAuthenticatedUser, authorizeRoles('admin'), getMessageStats);

router.route('/admin/messages/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getMessageDetails)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteMessage);

router.route('/admin/messages/:id/read')
  .put(isAuthenticatedUser, authorizeRoles('admin'), markAsRead);

router.route('/admin/messages/:id/unread')
  .put(isAuthenticatedUser, authorizeRoles('admin'), markAsUnread);

router.route('/admin/messages/:id/reply')
  .put(isAuthenticatedUser, authorizeRoles('admin'), replyToMessage);

export default router; 