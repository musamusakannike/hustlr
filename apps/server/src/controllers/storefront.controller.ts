import type { Request, Response } from "express";
import * as storefrontService from "../services/storefront.service";
import { validateCouponForStore } from "../services/coupon.service";
import { getCartView } from "../services/cart.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";
import { getPagination, paginationMeta } from "../utils/pagination.util";

const buyerId = (req: Request) => (req.buyer ? String(req.buyer._id) : undefined);
const storeId = (req: Request) => String(req.store!._id);

export const info = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await storefrontService.storefrontInfo(req.store!));
});

export const products = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await storefrontService.storefrontProducts(
    storeId(req),
    {
      category: req.query.category as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sort: req.query.sort as string,
      skip,
      limit,
    },
    buyerId(req),
  );
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const product = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await storefrontService.storefrontProduct(storeId(req), req.params.slug, buyerId(req)));
});

export const categories = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await storefrontService.storefrontCategories(storeId(req)));
});

export const featured = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await storefrontService.featuredProducts(storeId(req), buyerId(req)));
});

export const newArrivals = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await storefrontService.newArrivals(storeId(req), buyerId(req)));
});

export const bestSellers = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await storefrontService.bestSellers(storeId(req), buyerId(req)));
});

export const reviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const data = await storefrontService.productReviews(storeId(req), req.params.slug, skip, limit);
  sendSuccess(res, { ...data, meta: paginationMeta(data.total, page, limit) });
});

export const blog = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await storefrontService.storefrontBlog(
    storeId(req),
    skip,
    limit,
    req.query.tag as string,
  );
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const blogPost = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await storefrontService.storefrontBlogPost(storeId(req), req.params.slug));
});

export const blogTags = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await storefrontService.storefrontBlogTags(storeId(req)));
});

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  let subtotal = Number(req.body.subtotal ?? 0);
  if (req.buyer) {
    const cart = await getCartView(String(req.buyer._id), storeId(req));
    subtotal = cart.items.reduce((s, i) => s + i.currentPrice * i.quantity, 0);
  }
  const { coupon, discount } = await validateCouponForStore(storeId(req), req.body.code, {
    subtotal,
    buyerProfileId: buyerId(req),
  });
  sendSuccess(res, {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  });
});
