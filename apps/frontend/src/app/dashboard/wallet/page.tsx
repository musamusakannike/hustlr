"use client";

import React, { useState } from "react";
import { Clock, CreditCard, Wallet as WalletIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useKyc } from "@/hooks/useKyc";
import { useWallet, useWalletTransactions, useWithdraw } from "@/hooks/useCommerce";
import { formatNaira, getErrorMessage, relativeTime } from "@/lib/utils";
import type { WalletTxStatus } from "@/types/wallet";

function txBadge(status: WalletTxStatus): "success" | "warning" | "danger" | "neutral" {
  if (status === "completed") return "success";
  if (status === "failed" || status === "rejected") return "danger";
  if (status === "awaiting_approval" || status === "approved" || status === "dispatched")
    return "warning";
  return "neutral";
}

export default function WalletPage() {
  const { toast } = useToast();
  const { data: wallet, isLoading } = useWallet();
  const { data: txPage, isLoading: txLoading } = useWalletTransactions({ limit: 30 });
  const { data: kyc } = useKyc();
  const withdraw = useWithdraw();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const bank = kyc?.bankDetails;
  const kycOk = kyc?.status === "approved" && bank?.accountNumber;
  const max = wallet?.balance ?? 0;
  const value = Number(amount);

  const handleWithdraw = () => {
    withdraw.mutate(value, {
      onSuccess: () => {
        toast("Withdrawal requested. We'll process it shortly.", "success");
        setOpen(false);
        setAmount("");
      },
      onError: (err) => toast(getErrorMessage(err), "error"),
    });
  };

  if (isLoading) return <Spinner label="Loading wallet…" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Wallet</h2>
        <p className="text-sm text-muted mt-0.5">
          Escrow releases land here. Withdraw to the bank account on your KYC.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Available</p>
          <p className="text-3xl font-bold font-archivo text-primary mt-2">
            {formatNaira(wallet?.balance ?? 0)}
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)} disabled={!kycOk || max <= 0}>
            Withdraw
          </Button>
          {!kycOk && (
            <p className="text-xs text-warning mt-2">
              Approved KYC with bank details is required before you can withdraw.
            </p>
          )}
        </Card>
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">In escrow</p>
          <p className="text-3xl font-bold font-archivo mt-2">
            {formatNaira(wallet?.pendingBalance ?? 0)}
          </p>
          <p className="text-xs text-subtle mt-2 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Releases after the buyer confirms delivery
          </p>
        </Card>
      </div>

      {bank && (
        <Card className="p-5 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">{bank.bankName}</p>
            <p className="text-xs text-muted">
              {bank.accountName} • {bank.accountNumber}
            </p>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="font-bold text-lg mb-4">Transactions</h3>
        {txLoading ? (
          <Spinner />
        ) : (txPage?.items.length ?? 0) === 0 ? (
          <EmptyState
            icon={<WalletIcon className="w-6 h-6" />}
            title="No movements yet"
            description="Payouts and escrow credits will show up here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {txPage!.items.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{tx.description || tx.type}</p>
                  <p className="text-xs text-muted">{relativeTime(tx.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">{formatNaira(tx.amount)}</p>
                  <Badge variant={txBadge(tx.status)}>{tx.status.replace(/_/g, " ")}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Withdraw"
        description={`Available ${formatNaira(max)}. Funds go to ${bank?.bankName ?? "your bank"} ${bank?.accountNumber ?? ""}.`}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Amount (₦)"
            type="number"
            min={1}
            max={max}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button
            onClick={handleWithdraw}
            loading={withdraw.isPending}
            disabled={!value || value <= 0 || value > max}
          >
            Request withdrawal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
