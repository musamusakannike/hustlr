"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { useCart, useCheckout } from "@/hooks/useStorefront";
import { storefrontService } from "@/services/storefront";
import { formatNaira, getErrorMessage } from "@/lib/utils";
import { storeHref } from "@/lib/store-path";

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading: authLoading } = useBuyerAuth();
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const checkout = useCheckout();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [addr, setAddr] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nigeria",
    phoneNumber: "",
  });

  if (authLoading) return <Spinner />;
  if (!isAuthenticated) {
    router.replace(storeHref(slug, "/auth/login"));
    return <Spinner />;
  }

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const shipping = cart?.shippingTotal ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const validAddr = Object.values(addr).every((v) => String(v).trim().length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-bold mb-2">Checkout</h1>
        <p className="text-sm opacity-70 mb-6">
          Payment is held in escrow until you confirm delivery.
        </p>
        {step === 1 ? (
          <div className="flex flex-col gap-3">
            {(
              [
                ["fullName", "Full name"],
                ["streetAddress", "Street address"],
                ["city", "City"],
                ["state", "State"],
                ["zipCode", "Zip / postal"],
                ["phoneNumber", "Phone"],
              ] as const
            ).map(([key, label]) => (
              <Input
                key={key}
                label={label}
                value={addr[key]}
                onChange={(e) => setAddr((a) => ({ ...a, [key]: e.target.value }))}
              />
            ))}
            <Button disabled={!validAddr} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                label="Coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              />
              <Button
                variant="outline"
                className="self-end"
                onClick={async () => {
                  try {
                    const res = await storefrontService.validateCoupon(slug, coupon, subtotal);
                    if (res.valid) {
                      setDiscount(res.discountAmount);
                      toast("Coupon applied.", "success");
                    } else {
                      toast(res.message || "Invalid coupon", "error");
                    }
                  } catch (err) {
                    toast(getErrorMessage(err), "error");
                  }
                }}
              >
                Apply
              </Button>
            </div>
            <Button
              loading={checkout.isPending}
              onClick={() =>
                checkout.mutate(
                  {
                    shippingAddress: addr,
                    couponCode: coupon || undefined,
                    saveAddress: true,
                  },
                  {
                    onSuccess: (res) => {
                      if (res.authorizationUrl) window.location.href = res.authorizationUrl;
                    },
                    onError: (err) => toast(getErrorMessage(err), "error"),
                  }
                )
              }
            >
              Pay with Paystack
            </Button>
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
          </div>
        )}
      </div>
      <aside className="lg:col-span-2 border rounded-2xl p-5 h-fit">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <p className="font-bold mb-3">{items.length} items</p>
            <dl className="text-sm flex flex-col gap-2">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{formatNaira(shipping)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt>Discount</dt>
                  <dd>-{formatNaira(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <dt>Total</dt>
                <dd>{formatNaira(total)}</dd>
              </div>
            </dl>
          </>
        )}
      </aside>
    </div>
  );
}
