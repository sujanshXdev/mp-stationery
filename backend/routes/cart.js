import express from "express";
import { addToCart, getCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { addToCartValidation, updateCartItemValidation } from "../validators/cart.js";

const router = express.Router();

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product added/updated in cart
 *       401:
 *         description: Unauthorized
 */
router.post("/cart", isAuthenticatedUser, addToCartValidation, validate, addToCart);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the user's cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of cart products
 *       401:
 *         description: Unauthorized
 */
router.get("/cart", isAuthenticatedUser, getCart);

/**
 * @swagger
 * /cart/{itemId}:
 *   put:
 *     summary: Update a cart item
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
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
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
router.put("/cart/:itemId", isAuthenticatedUser, updateCartItemValidation, validate, updateCartItem);

/**
 * @swagger
 * /cart/{itemId}:
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from cart
 *       401:
 *         description: Unauthorized
 */
router.delete("/cart/:itemId", isAuthenticatedUser, removeCartItem);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 *       401:
 *         description: Unauthorized
 */
router.delete("/cart", isAuthenticatedUser, clearCart);

export default router;
