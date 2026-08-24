import mongoose, { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
  buyerProfileId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    buyerProfileId: { type: Schema.Types.ObjectId, ref: "BuyerProfile", required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

wishlistSchema.index({ buyerProfileId: 1, storeId: 1 }, { unique: true });

export const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
