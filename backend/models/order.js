import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          required: false,
        },
        purchasePrice: {
          type: Number,
          required: true,
        },
        marketPrice: {
          type: Number,
          required: false,
        },
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        unitType: {
          type: String,
          enum: ["Packet", "Piece"],
          required: false,
        },
        category: {
          type: String,
          required: true,
        },
        subCategory: {
          type: String,
          required: false,
        },
        academicCategory: {
          type: String,
          required: false,
        },
        class: {
          type: String,
          required: false,
        },
      },
    ],
    shippingInfo: {
      phoneNo: { type: String, required: true },
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paymentInfo: {
      status: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending",
      },
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Ready for Pickup", "Delivered", "Cancelled"],
      default: "Processing",
    },
    deliveredAt: Date,
    isInHistory: {
      type: Boolean,
      default: false,
    },

    // Add this field:
    orderID: {
      type: String,
      required: true,
      unique: true,
      length: 4,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
