import { getTransport } from "@/lib/transport";

const transport = getTransport();

export const productService = {
  list: transport.listProducts.bind(transport),
  get: transport.getProduct.bind(transport),
  create: transport.createProduct.bind(transport),
  update: transport.updateProduct.bind(transport),
  setStatus: transport.setProductStatus.bind(transport),
  bulkStatus: transport.bulkProductStatus.bind(transport),
  archive: transport.archiveProduct.bind(transport),
};

export const categoryService = {
  list: transport.listCategories.bind(transport),
  create: transport.createCategory.bind(transport),
  update: transport.updateCategory.bind(transport),
  delete: transport.deleteCategory.bind(transport),
};
