import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  selectedVariants: Record<string, string>;
  priceSnapshot: number;
}

export interface ICart extends Document {
  buyerProfileId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  items: mongoose.Types.DocumentArray<ICartItem>;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedVariants: { type: Schema.Types.Mixed, default: {} },
    priceSnapshot: { type: Number, required: true },
  },
  { _id: true },
);

const cartSchema = new Schema<ICart>(
  {
    buyerProfileId: { type: Schema.Types.ObjectId, ref: "BuyerProfile", required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

cartSchema.index({ buyerProfileId: 1, storeId: 1 }, { unique: true });

export const Cart = mongoose.model<ICart>("Cart", cartSchema);
