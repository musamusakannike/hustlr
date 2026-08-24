"use client";

import React from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { storeHref } from "@/lib/store-path";

export default function GuestModal({
  slug,
  open,
  onClose,
}: {
  slug: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Sign in to continue"
      description="Create a free account for this store to use cart, checkout, and wishlist."
      size="sm"
    >
      <div className="flex flex-col gap-2">
        <Link href={storeHref(slug, "/auth/login")}>
          <Button fullWidth>Sign in</Button>
        </Link>
        <Link href={storeHref(slug, "/auth/register")}>
          <Button fullWidth variant="outline">
            Create account
          </Button>
        </Link>
      </div>
    </Modal>
  );
}
