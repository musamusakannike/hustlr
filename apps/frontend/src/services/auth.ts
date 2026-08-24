import type { Transport } from "@/lib/transport";
import { getTransport } from "@/lib/transport";

/**
 * Domain services are the only consumers of the transport. UI components and
 * hooks never import transports/fixtures directly (architecture decision 2).
 */
const transport: Transport = getTransport();

export const authService = {
  register: transport.registerSeller.bind(transport),
  verifyOtp: transport.verifySellerOtp.bind(transport),
  resendOtp: transport.resendSellerOtp.bind(transport),
  login: transport.loginSeller.bind(transport),
  google: transport.googleSeller.bind(transport),
  forgotPassword: transport.forgotSellerPassword.bind(transport),
  resetPassword: transport.resetSellerPassword.bind(transport),
  logout: transport.logoutSeller.bind(transport),
  me: transport.getSellerMe.bind(transport),
};
