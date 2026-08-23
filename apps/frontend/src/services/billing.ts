import { getTransport } from "@/lib/transport";

const transport = getTransport();

export const kycService = {
  get: transport.getMyKyc.bind(transport),
  upsert: transport.upsertKyc.bind(transport),
  submit: transport.submitKyc.bind(transport),
  listBanks: transport.listBanks.bind(transport),
};

export const subscriptionService = {
  listPlans: transport.listPlans.bind(transport),
  current: transport.getCurrentSubscription.bind(transport),
  subscribeFree: transport.subscribeFree.bind(transport),
  initialize: transport.initializeSubscription.bind(transport),
  verify: transport.verifySubscription.bind(transport),
  cancel: transport.cancelSubscription.bind(transport),
  changePlan: transport.changePlan.bind(transport),
};
