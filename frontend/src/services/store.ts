import { getTransport } from "@/lib/transport";

const transport = getTransport();

export const storeService = {
  getStore: transport.getStore.bind(transport),
  setupStore: transport.setupStore.bind(transport),
  checkSlug: transport.checkSlug.bind(transport),
  setTemplate: transport.setStoreTemplate.bind(transport),
  uploadAsset: transport.uploadAsset.bind(transport),
};

export const templateService = {
  list: transport.listTemplates.bind(transport),
};
