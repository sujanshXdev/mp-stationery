import { body } from "express-validator";

export const addToWishlistValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
]; 