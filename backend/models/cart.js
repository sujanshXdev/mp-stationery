import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      unitType: { type: String, enum: ["Packet", "Piece"], required: false },
    },
  ],
});

export default model("Cart", cartSchema);
