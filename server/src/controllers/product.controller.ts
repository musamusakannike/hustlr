import type { Request, Response } from "express";
import * as productService from "../services/product.service";
import * as categoryService from "../services/category.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";
import { getPagination, paginationMeta } from "../utils/pagination.util";
import { uploadFile } from "../utils/upload.util";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await productService.createProduct(String(req.user!._id), req.body), "Product created", 201);
});

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await productService.listSellerProducts(String(req.user!._id), {
    status: req.query.status as string,
    category: req.query.category as string,
    search: req.query.search as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await productService.getSellerProduct(String(req.user!._id), req.params.productId));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await productService.updateProduct(String(req.user!._id), req.params.productId, req.body), "Updated");
});

export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await productService.setProductStatus(String(req.user!._id), req.params.productId, req.body.status),
  );
});

export const archiveProduct = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await productService.archiveProduct(String(req.user!._id), req.params.productId), "Archived");
});

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const urls = await Promise.all(files.map((f) => uploadFile(f, `stores/${req.user!._id}/products/${req.params.productId}`)));
  sendSuccess(res, await productService.addProductImages(String(req.user!._id), req.params.productId, urls));
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await productService.removeProductImage(String(req.user!._id), req.params.productId, Number(req.params.imageIndex)),
  );
});

export const bulkStatus = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await productService.bulkStatus(String(req.user!._id), req.body.productIds, req.body.status));
});

export const bulkDelete = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await productService.bulkArchive(String(req.user!._id), req.body.productIds));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await categoryService.createStoreCategory(String(req.user!._id), req.body), "Created", 201);
});

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await categoryService.listStoreCategories(String(req.user!._id)));
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await categoryService.updateStoreCategory(String(req.user!._id), req.params.categoryId, req.body));
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await categoryService.deleteStoreCategory(String(req.user!._id), req.params.categoryId), "Deactivated");
});
