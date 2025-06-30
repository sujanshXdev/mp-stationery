import express from "express";
import {
  newOrder,
  myOrders,
  getOrderDetails,
  allOrders,
  updateOrder,
  deleteOrder,
  cancelOrder,
} from "../controllers/orderControllers.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { orderValidation, updateOrderValidation } from "../validators/order.js";

const router = express.Router();

/**
 * @swagger
 * /orders/new:
 *   post:
 *     summary: Create a new order
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *               totalAmount:
 *                 type: number
 *               paymentInfo:
 *                 type: object
 *               shippingInfo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order created
 *       401:
 *         description: Unauthorized
 */
router.post("/orders/new", isAuthenticatedUser, newOrder);

/**
 * @swagger
 * /orders/me/orders:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *       401:
 *         description: Unauthorized
 */
router.get("/orders/me/orders", isAuthenticatedUser, myOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get("/orders/:id", isAuthenticatedUser, getOrderDetails);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (admin)
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       401:
 *         description: Unauthorized
 */
router.get("/admin/orders", isAuthenticatedUser, authorizeRoles("admin"), allOrders);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order (status/payment)
 *     tags: [Order]
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
 *               orderStatus:
 *                 type: string
 *               paymentInfo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Order updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.put("/orders/:id", isAuthenticatedUser, updateOrderValidation, validate, updateOrder);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.put("/orders/:id/cancel", isAuthenticatedUser, cancelOrder);

/**
 * @swagger
 * /admin/orders/{id}:
 *   delete:
 *     summary: Delete an order (admin)
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.delete("/admin/orders/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

export default router;
