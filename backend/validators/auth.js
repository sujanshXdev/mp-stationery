import { body } from "express-validator";

export const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").isMobilePhone().withMessage("Valid phone is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const resetPasswordValidation = [
  body("resetCode").notEmpty().withMessage("Reset code is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const updatePasswordValidation = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const updateProfileValidation = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
];

export const verifyEmailValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("code").notEmpty().withMessage("Verification code is required"),
];

export const resendVerificationCodeValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const updateUserValidation = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("role").optional().notEmpty().withMessage("Role cannot be empty"),
]; 