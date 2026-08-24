import { getTransport } from "@/lib/transport";

const t = getTransport();

export const orderService = {
  list: t.listOrders.bind(t),
  get: t.getOrder.bind(t),
  stats: t.getOrderStats.bind(t),
  ship: t.shipOrder.bind(t),
  inTransit: t.markOrderInTransit.bind(t),
  delivered: t.markOrderDelivered.bind(t),
  invoice: t.getOrderInvoice.bind(t),
};

export const walletService = {
  get: t.getWallet.bind(t),
  transactions: t.listWalletTransactions.bind(t),
  withdraw: t.withdrawWallet.bind(t),
};

export const couponService = {
  list: t.listCoupons.bind(t),
  create: t.createCoupon.bind(t),
  update: t.updateCoupon.bind(t),
  toggle: t.toggleCoupon.bind(t),
  delete: t.deleteCoupon.bind(t),
};

export const reviewService = {
  list: t.listSellerReviews.bind(t),
  reply: t.replyReview.bind(t),
};

export const disputeService = {
  list: t.listSellerDisputes.bind(t),
  get: t.getDispute.bind(t),
  message: t.messageDispute.bind(t),
};

export const blogService = {
  list: t.listBlog.bind(t),
  get: t.getBlog.bind(t),
  create: t.createBlog.bind(t),
  update: t.updateBlog.bind(t),
  publish: t.publishBlog.bind(t),
  unpublish: t.unpublishBlog.bind(t),
  archive: t.archiveBlog.bind(t),
};

export const analyticsService = {
  overview: t.analyticsOverview.bind(t),
  trend: t.analyticsTrend.bind(t),
  top: t.analyticsTopProducts.bind(t),
  status: t.analyticsOrderStatus.bind(t),
  customers: t.analyticsCustomers.bind(t),
};

export const aiService = {
  improveTitle: t.improveTitle.bind(t),
  rewriteDescription: t.rewriteDescription.bind(t),
  generateSeo: t.generateSeo.bind(t),
};

export const referralService = {
  get: t.getReferrals.bind(t),
};

export const notificationService = {
  list: t.listNotifications.bind(t),
  unread: t.unreadNotificationCount.bind(t),
  read: t.markNotificationRead.bind(t),
  readAll: t.markAllNotificationsRead.bind(t),
  remove: t.deleteNotification.bind(t),
};

export const ticketService = {
  list: t.listTickets.bind(t),
  get: t.getTicket.bind(t),
  create: t.createTicket.bind(t),
  reply: t.replyTicket.bind(t),
};

export const domainService = {
  set: t.setCustomDomain.bind(t),
  verify: t.verifyCustomDomain.bind(t),
  remove: t.removeCustomDomain.bind(t),
};
