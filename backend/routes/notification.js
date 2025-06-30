import express from "express";
import {
  getNotifications,
  updateNotification,
  createNotification,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { notificationValidation } from "../validators/notification.js";

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notification]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router
  .route("/notifications")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getNotifications)
  .post(isAuthenticatedUser, authorizeRoles("admin"), notificationValidation, validate, createNotification);

router
  .route("/notifications/mark-all-read")
  .put(isAuthenticatedUser, authorizeRoles("admin"), markAllAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Update notification read status
 *     tags: [Notification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               read:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router
  .route("/notifications/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateNotification);

export default router;
