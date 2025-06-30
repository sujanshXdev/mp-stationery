import { body } from "express-validator";

export const orderValidation = [
  body("orderItems").isArray({ min: 1 }).withMessage("Order items are required"),
  body("totalAmount").isNumeric().withMessage("Total amount must be a number"),
  body("paymentInfo").notEmpty().withMessage("Payment info is required"),
  body("shippingInfo").notEmpty().withMessage("Shipping info is required"),
];

export const updateOrderValidation = [
  body("orderStatus").optional().isString().withMessage("Order status must be a string"),
  body("paymentInfo").optional().notEmpty().withMessage("Payment info cannot be empty if provided"),
]; 