import type { Request, Response } from "express";
import * as cartService from "../services/cart.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";

const ids = (req: Request) => ({
  buyer: String(req.buyer!._id),
  store: String(req.store!._id),
});

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const { buyer, store } = ids(req);
  sendSuccess(res, await cartService.getCartView(buyer, store));
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { buyer, store } = ids(req);
  sendSuccess(res, await cartService.addToCart(buyer, store, req.body), "Added to cart");
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const { buyer, store } = ids(req);
  sendSuccess(res, await cartService.updateCartItem(buyer, store, req.params.itemId, req.body.quantity));
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const { buyer, store } = ids(req);
  sendSuccess(res, await cartService.removeCartItem(buyer, store, req.params.itemId));
});

export const clear = asyncHandler(async (req: Request, res: Response) => {
  const { buyer, store } = ids(req);
  sendSuccess(res, await cartService.clearCart(buyer, store), "Cart cleared");
});

export const count = asyncHandler(async (req: Request, res: Response) => {
  const { buyer, store } = ids(req);
  sendSuccess(res, { count: await cartService.cartCount(buyer, store) });
});
