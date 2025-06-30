console.log("Using updated product validator");

import { body } from "express-validator";

export const productValidation = [
  body("name").notEmpty().withMessage("Product name is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("description").notEmpty().withMessage("Description is required"),

  // Book-specific validations
  body("category").custom((value, { req }) => {
    if (value === "Book") {
      if (!req.body.subCategory) {
        throw new Error("Sub-category is required for books");
      }
      if (req.body.subCategory === "Academic") {
        if (!req.body.academicCategory) {
          throw new Error("Academic category is required for academic books");
        }
        if (!req.body.class) {
          throw new Error("Class is required for academic books");
        }
      }
      if (isNaN(Number(req.body.marketPrice)) || Number(req.body.marketPrice) <= 0) {
        throw new Error("Market price must be a positive number for books");
      }
      if (isNaN(Number(req.body.priceToSell)) || Number(req.body.priceToSell) <= 0) {
        throw new Error("Price to sell must be a positive number for books");
      }
    }
    return true;
  }),

  // Non-book validations
  body("category").custom((value, { req }) => {
    if (value !== "Book") {
      if (!req.body.unitType || !["Packet", "Piece"].includes(req.body.unitType)) {
        throw new Error("Unit type must be either Packet or Piece for non-book products");
      }
      if (isNaN(Number(req.body.pricePerPiece)) || Number(req.body.pricePerPiece) <= 0) {
        throw new Error("Price per piece must be a positive number for non-book products");
      }
      if (req.body.unitType === "Packet" && (isNaN(Number(req.body.pricePerPacket)) || Number(req.body.pricePerPacket) <= 0)) {
        throw new Error("Price per packet must be a positive number for packet products");
      }
    }
    return true;
  }),
];

export const productReviewValidation = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").notEmpty().withMessage("Comment is required"),
  body("productId").notEmpty().withMessage("Product ID is required"),
]; 