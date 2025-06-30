import express from "express";
import {
  getProducts,
  newProduct,
  getProductDetails,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
  getBestSellers,
  getRecentProducts,
} from "../controllers/productController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { productValidation, productReviewValidation } from "../validators/product.js";
import { uploadProductImage } from "../utils/uploads.js";

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of products
 */
router.route("/products").get(getProducts);

/**
 * @swagger
 * /products/best-sellers:
 *   get:
 *     summary: Get best selling products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of best selling products
 */
router.route("/products/best-sellers").get(getBestSellers);

/**
 * @swagger
 * /products/recent:
 *   get:
 *     summary: Get recently added products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of recent products
 */
router.route("/products/recent").get(getRecentProducts);

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         description: Unauthorized
 */
router.route("/admin/products").post(isAuthenticatedUser, authorizeRoles("admin"), uploadProductImage, productValidation, validate, newProduct);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product details
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.route("/products/:id").get(getProductDetails);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Update product details
 *     tags: [Product]
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
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete a product
 *     tags: [Product]
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
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), uploadProductImage, productValidation, validate, updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create or update a product review
 *     tags: [Product]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review created/updated
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get product reviews
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 *       404:
 *         description: Product not found
 */
router.route("/reviews")
  .post(isAuthenticatedUser, productReviewValidation, validate, createProductReview)
  .get(getProductReviews);

/**
 * @swagger
 * /admin/reviews:
 *   delete:
 *     summary: Delete a product review
 *     tags: [Product]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.route("/admin/reviews").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);

export default router;
