import { body } from "express-validator";

export const notificationValidation = [
  body("message").notEmpty().withMessage("Message is required"),
  body("type").isIn(["order", "payment", "system", "message"]).withMessage("Type must be order, payment, system, or message"),
  body("order").optional().isString().withMessage("Order must be a string if provided"),
  body("messageRef").optional().isString().withMessage("MessageRef must be a string if provided"),
]; 