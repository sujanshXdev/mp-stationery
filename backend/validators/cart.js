import { body, param } from "express-validator";

export const addToCartValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

export const updateCartItemValidation = [
  param("itemId").notEmpty().withMessage("Cart item ID is required"),
  body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
]; 