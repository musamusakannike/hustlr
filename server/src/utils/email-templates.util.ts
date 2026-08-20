import { APP_NAME, BRAND, SUPPORT_EMAIL } from "../config/constants.config";

type TemplateData = Record<string, string | number | undefined>;

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.backgroundSoft};font-family:Arial,Helvetica,sans-serif;color:${BRAND.textColor};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.backgroundSoft};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:${BRAND.background};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND.primaryColor};padding:24px 32px;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;letter-spacing:0.5px;">${APP_NAME}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 32px;color:#666666;font-size:12px;">
              Need help? Contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.primaryColor};">${SUPPORT_EMAIL}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;line-height:1.6;font-size:15px;">${text}</p>`;
}

function otpBox(code: string): string {
  return `<div style="margin:24px 0;padding:16px;background:${BRAND.primaryLight};border-radius:12px;text-align:center;">
    <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:${BRAND.primaryColor};">${code}</div>
    <div style="margin-top:8px;font-size:12px;color:#666;">This code expires in 10 minutes.</div>
  </div>`;
}

const templates: Record<string, (data: TemplateData) => { subject: string; html: string }> = {
  sellerWelcome: (d) => ({
    subject: `Welcome to ${APP_NAME}`,
    html: layout(
      `Welcome to ${APP_NAME}`,
      `${p(`Hi ${d.name},`)}${p(`Your ${APP_NAME} seller account is ready. Verify your email with the code we sent, then set up your storefront.`)}`,
    ),
  }),
  otpVerification: (d) => ({
    subject: `Your ${APP_NAME} verification code`,
    html: layout(
      "Verify your email",
      `${p(`Hi ${d.name ?? "there"},`)}${p(`Use this one-time code to verify your ${d.context ?? "account"}.`)}${otpBox(String(d.otp))}`,
    ),
  }),
  passwordResetOtp: (d) => ({
    subject: `Reset your ${APP_NAME} password`,
    html: layout(
      "Password reset",
      `${p(`Hi ${d.name ?? "there"},`)}${p("Use this code to reset your password.")}${otpBox(String(d.otp))}`,
    ),
  }),
  kycSubmitted: (d) => ({
    subject: "KYC application received",
    html: layout(
      "KYC received",
      `${p(`Hi ${d.name},`)}${p("We received your KYC application and will review it shortly.")}`,
    ),
  }),
  kycApproved: (d) => ({
    subject: "KYC approved — you can go live",
    html: layout(
      "KYC approved",
      `${p(`Hi ${d.name},`)}${p("Your identity verification was approved. Subscribe to a plan to take your store live.")}`,
    ),
  }),
  kycRejected: (d) => ({
    subject: "KYC application rejected",
    html: layout(
      "KYC rejected",
      `${p(`Hi ${d.name},`)}${p(`Your KYC application was rejected.`)}${p(`Reason: ${d.reason ?? "See dashboard for details."}`)}`,
    ),
  }),
  kycInfoRequested: (d) => ({
    subject: "More KYC information needed",
    html: layout(
      "KYC info requested",
      `${p(`Hi ${d.name},`)}${p(`We need a few more documents: ${d.files ?? "see your dashboard"}.`)}${p(`Note: ${d.reason ?? ""}`)}`,
    ),
  }),
  adminKycSubmitted: (d) => ({
    subject: `New KYC application — ${d.sellerName}`,
    html: layout(
      "New KYC",
      `${p(`A new KYC application from ${d.sellerName} (${d.email}) is waiting for review.`)}`,
    ),
  }),
  subscriptionActivated: (d) => ({
    subject: `${APP_NAME} ${d.planName} plan activated`,
    html: layout(
      "Subscription activated",
      `${p(`Hi ${d.name},`)}${p(`Your ${d.planName} subscription is now active. Your store can go live.`)}`,
    ),
  }),
  subscriptionExpiring: (d) => ({
    subject: `Your ${APP_NAME} subscription expires soon`,
    html: layout(
      "Subscription expiring",
      `${p(`Hi ${d.name},`)}${p(`Your ${d.planName} plan expires on ${d.endDate}. Renew to keep your store online.`)}`,
    ),
  }),
  subscriptionExpired: (d) => ({
    subject: `Your ${APP_NAME} store is offline`,
    html: layout(
      "Subscription expired",
      `${p(`Hi ${d.name},`)}${p("Your subscription has expired and your store is currently unavailable to buyers.")}`,
    ),
  }),
  newOrderSeller: (d) => ({
    subject: `New order ${d.orderNumber}`,
    html: layout(
      "New order",
      `${p(`Hi ${d.name},`)}${p(`You received order ${d.orderNumber} for ${d.currencySymbol ?? "₦"}${d.amount}.`)}`,
    ),
  }),
  orderConfirmationBuyer: (d) => ({
    subject: `Order ${d.orderNumber} confirmed`,
    html: layout(
      "Order confirmation",
      `${p(`Hi ${d.name},`)}${p(`Thanks for shopping at ${d.storeName}. Your order ${d.orderNumber} totaling ${d.currencySymbol ?? "₦"}${d.amount} has been paid.`)}`,
    ),
  }),
  orderShipped: (d) => ({
    subject: `Order ${d.orderNumber} has shipped`,
    html: layout(
      "Order shipped",
      `${p(`Hi ${d.name},`)}${p(`Your order ${d.orderNumber} has been shipped.${d.trackingNumber ? ` Tracking: ${d.trackingNumber}` : ""} ${d.trackingNote ?? ""}`)}`,
    ),
  }),
  orderDelivered: (d) => ({
    subject: `Please confirm order ${d.orderNumber}`,
    html: layout(
      "Order delivered",
      `${p(`Hi ${d.name},`)}${p(`The seller marked order ${d.orderNumber} as delivered. Confirm receipt so funds can be released.`)}`,
    ),
  }),
  orderConfirmedSeller: (d) => ({
    subject: `Escrow released for ${d.orderNumber}`,
    html: layout(
      "Escrow released",
      `${p(`Hi ${d.name},`)}${p(`Order ${d.orderNumber} was confirmed. ${d.currencySymbol ?? "₦"}${d.amount} has been credited to your wallet.`)}`,
    ),
  }),
  orderAutoConfirmed: (d) => ({
    subject: `Order ${d.orderNumber} auto-confirmed`,
    html: layout(
      "Auto-confirmed",
      `${p(`Hi ${d.name},`)}${p(`Order ${d.orderNumber} was auto-confirmed after the escrow window. Funds have been released to the seller.`)}`,
    ),
  }),
  disputeOpened: (d) => ({
    subject: `Dispute opened on ${d.orderNumber}`,
    html: layout(
      "Dispute opened",
      `${p(`A dispute was opened on order ${d.orderNumber}. Reason: ${d.reason}`)}`,
    ),
  }),
  disputeResolved: (d) => ({
    subject: `Dispute resolved for ${d.orderNumber}`,
    html: layout(
      "Dispute resolved",
      `${p(`The dispute on order ${d.orderNumber} was resolved: ${d.resolution}. ${d.note ?? ""}`)}`,
    ),
  }),
  withdrawalRequestedAdmin: (d) => ({
    subject: `New withdrawal request — ${d.storeName}`,
    html: layout(
      "Withdrawal request",
      `${p(`New withdrawal of ${d.currencySymbol ?? "₦"}${d.amount} from ${d.storeName}.`)}`,
    ),
  }),
  withdrawalUpdate: (d) => ({
    subject: `Withdrawal ${d.status}`,
    html: layout(
      "Withdrawal update",
      `${p(`Hi ${d.name},`)}${p(`Your withdrawal of ${d.currencySymbol ?? "₦"}${d.amount} is now ${d.status}.${d.reason ? ` ${d.reason}` : ""}`)}`,
    ),
  }),
  lowStock: (d) => ({
    subject: `Low stock: ${d.productTitle}`,
    html: layout(
      "Low stock",
      `${p(`Hi ${d.name},`)}${p(`${d.productTitle} is out of stock and was moved to draft.`)}`,
    ),
  }),
  newReview: (d) => ({
    subject: `New review on ${d.productTitle}`,
    html: layout(
      "New review",
      `${p(`Hi ${d.name},`)}${p(`You received a ${d.rating}-star review on ${d.productTitle}.`)}`,
    ),
  }),
  buyerWelcome: (d) => ({
    subject: `Welcome to ${d.storeName}`,
    html: layout(
      "Welcome",
      `${p(`Hi ${d.name},`)}${p(`Welcome to ${d.storeName}, powered by ${APP_NAME}.`)}`,
    ),
  }),
  referralReward: (d) => ({
    subject: "Referral reward received",
    html: layout(
      "Referral reward",
      `${p(`Hi ${d.name},`)}${p(`You earned ${d.currencySymbol ?? "₦"}${d.amount} for a successful referral.`)}`,
    ),
  }),
  paymentFailedAdmin: (d) => ({
    subject: `Subscription payment failed — ${d.sellerName}`,
    html: layout(
      "Payment failed",
      `${p(`Subscription payment failed for ${d.sellerName} (${d.email}).`)}`,
    ),
  }),
};

export function renderEmail(
  templateName: string,
  data: TemplateData,
): { subject: string; html: string } {
  const renderer = templates[templateName];
  if (!renderer) {
    return {
      subject: String(data.subject ?? APP_NAME),
      html: layout(APP_NAME, p(String(data.message ?? ""))),
    };
  }
  return renderer(data);
}
