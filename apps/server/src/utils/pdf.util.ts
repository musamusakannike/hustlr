import PDFDocument from "pdfkit";
import { APP_NAME, BRAND, DEFAULT_CURRENCY_SYMBOL } from "../config/constants.config";
import type { IOrder } from "../models/order.model";
import type { IStore } from "../models/store.model";
import { uploadNamedBuffer } from "./upload.util";
import { isR2Configured } from "../config/r2.config";

function money(amount: number, symbol = DEFAULT_CURRENCY_SYMBOL): string {
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function renderPdf(draw: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  draw(doc);
  doc.end();
  return done;
}

function header(doc: PDFKit.PDFDocument, title: string, store: IStore): void {
  doc.fillColor(BRAND.primaryColor).fontSize(22).text(APP_NAME);
  doc.moveDown(0.3);
  doc.fillColor(BRAND.textColor).fontSize(16).text(title);
  doc.moveDown(0.5);
  doc.fontSize(11).text(store.name);
  if (store.contactEmail) doc.text(store.contactEmail);
  doc.moveDown();
}

export async function generateOrderPdfs(
  order: IOrder,
  store: IStore,
): Promise<{ receiptUrl: string; invoiceUrl: string }> {
  const receipt = await renderPdf((doc) => {
    header(doc, "Receipt", store);
    doc.fontSize(11).text(`Order: ${order.orderNumber}`);
    doc.text(`Date: ${order.paidAt ? new Date(order.paidAt).toLocaleString() : new Date().toLocaleString()}`);
    doc.text(`Buyer: ${order.shippingAddress.fullName}`);
    doc.moveDown();
    order.items.forEach((item) => {
      doc.text(`${item.title} x${item.quantity} — ${money(item.price * item.quantity, store.currencySymbol)}`);
    });
    doc.moveDown();
    doc.text(`Subtotal: ${money(order.subtotal, store.currencySymbol)}`);
    doc.text(`Shipping: ${money(order.shippingTotal, store.currencySymbol)}`);
    doc.text(`Discount: ${money(order.discountAmount, store.currencySymbol)}`);
    doc.fontSize(13).text(`Total: ${money(order.totalAmount, store.currencySymbol)}`);
    doc.moveDown();
    doc.fontSize(10).fillColor("#666").text("Paid via Paystack escrow.");
  });

  const invoice = await renderPdf((doc) => {
    header(doc, "Invoice", store);
    doc.fontSize(11).text(`Order: ${order.orderNumber}`);
    doc.text(`Date: ${order.paidAt ? new Date(order.paidAt).toLocaleString() : new Date().toLocaleString()}`);
    doc.moveDown();
    order.items.forEach((item) => {
      doc.text(`${item.title} x${item.quantity} — ${money(item.price * item.quantity, store.currencySymbol)}`);
    });
    doc.moveDown();
    doc.text(`Subtotal: ${money(order.subtotal, store.currencySymbol)}`);
    doc.text(`Shipping: ${money(order.shippingTotal, store.currencySymbol)}`);
    doc.text(`Discount: ${money(order.discountAmount, store.currencySymbol)}`);
    doc.text(`Total: ${money(order.totalAmount, store.currencySymbol)}`);
    doc.moveDown();
    doc.text(`Commission (${order.commissionPercent}%): ${money(order.commissionAmount, store.currencySymbol)}`);
    doc.fontSize(13).text(`Payout: ${money(order.payoutAmount, store.currencySymbol)}`);
  });

  if (!isR2Configured()) {
    return { receiptUrl: "", invoiceUrl: "" };
  }

  const [receiptUrl, invoiceUrl] = await Promise.all([
    uploadNamedBuffer(receipt, `receipts/${order._id}`, "receipt.pdf", "application/pdf"),
    uploadNamedBuffer(invoice, `invoices/${order._id}`, "invoice.pdf", "application/pdf"),
  ]);
  return { receiptUrl, invoiceUrl };
}
