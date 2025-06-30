import mongoose from "mongoose";

// Defining the product schema with validation rules
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      maxLength: [200, "Product name cannot exceed 200 characters"],
    },
    unitType: {
      type: String,
      required: function () {
        return this.category !== "Book";
      },
      enum: {
        values: ["Packet", "Piece"],
        message: "Unit type must be either Packet or Piece",
      },
    },
    pricePerPacket: {
      type: Number,
      required: function () {
        return this.category !== "Book" && this.unitType === "Packet";
      },
    },
    pricePerPiece: {
      type: Number,
      required: function () {
        return this.category !== "Book";
      },
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: [true, "Please select category for this product"],
      enum: {
        values: ["Book", "Gift", "Stationery", "Sport"],
        message: "Please select correct category for product",
      },
    },
    subCategory: {
      type: String,
      required: function () {
        return this.category === "Book";
      },
    },
    academicCategory: {
      type: String,
      required: function () {
        return this.category === "Book" && this.subCategory === "Academic";
      },
    },
    class: {
      type: String,
      required: function () {
        return this.category === "Book" && this.subCategory === "Academic";
      },
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    marketPrice: {
      type: Number,
      required: function () {
        return this.category === "Book";
      },
      immutable: true,
    },
    priceToSell: {
      type: Number,
      required: function () {
        return this.category === "Book";
      },
    },
  },
  { timestamps: true }
);

// Exporting the Product model
export default mongoose.model("Product", productSchema);
