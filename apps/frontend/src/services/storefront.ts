import { getTransport } from "@/lib/transport";

const t = getTransport();

export const storefrontService = {
  setSlug: t.setStoreSlug.bind(t),
  info: t.storefrontInfo.bind(t),
  products: t.storefrontProducts.bind(t),
  product: t.storefrontProduct.bind(t),
  categories: t.storefrontCategories.bind(t),
  featured: t.storefrontFeatured.bind(t),
  newArrivals: t.storefrontNewArrivals.bind(t),
  bestSellers: t.storefrontBestSellers.bind(t),
  reviews: t.storefrontReviews.bind(t),
  blog: t.storefrontBlog.bind(t),
  blogPost: t.storefrontBlogPost.bind(t),
  validateCoupon: t.validateCoupon.bind(t),
};

export const buyerAuthService = {
  register: t.registerBuyer.bind(t),
  verifyOtp: t.verifyBuyerOtp.bind(t),
  resendOtp: t.resendBuyerOtp.bind(t),
  login: t.loginBuyer.bind(t),
  google: t.googleBuyer.bind(t),
  forgotPassword: t.forgotBuyerPassword.bind(t),
  resetPassword: t.resetBuyerPassword.bind(t),
  logout: t.logoutBuyer.bind(t),
  me: t.getBuyerMe.bind(t),
};

export const cartService = {
  get: t.getCart.bind(t),
  add: t.addCartItem.bind(t),
  update: t.updateCartItem.bind(t),
  remove: t.removeCartItem.bind(t),
  clear: t.clearCart.bind(t),
  count: t.cartCount.bind(t),
};

export const checkoutService = {
  initiate: t.initiateCheckout.bind(t),
  verify: t.verifyCheckout.bind(t),
};

export const buyerOrderService = {
  list: t.buyerOrders.bind(t),
  get: t.buyerOrder.bind(t),
  confirm: t.confirmReceipt.bind(t),
  dispute: t.openDispute.bind(t),
  receipt: t.buyerOrderReceipt.bind(t),
};

export const wishlistService = {
  toggle: t.toggleWishlist.bind(t),
  list: t.getWishlist.bind(t),
  clear: t.clearWishlist.bind(t),
};

export const buyerReferralService = {
  get: t.buyerReferrals.bind(t),
};
