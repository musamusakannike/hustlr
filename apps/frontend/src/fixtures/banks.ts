import type { Bank } from "@/types/kyc";

/** Cached subset of the Paystack bank list (NGN payout accounts). */
export const NIGERIAN_BANKS: Bank[] = [
  { name: "Access Bank", code: "044", acronym: "ACCESS" },
  { name: "Citibank Nigeria", code: "023", acronym: "CITI" },
  { name: "Ecobank Nigeria", code: "050", acronym: "ECO" },
  { name: "Fidelity Bank", code: "070", acronym: "FIDELITY" },
  { name: "First Bank of Nigeria", code: "011", acronym: "FBP" },
  { name: "First City Monument Bank", code: "214", acronym: "FCMB" },
  { name: "Guaranty Trust Bank", code: "058", acronym: "GTB" },
  { name: "Heritage Bank", code: "030", acronym: "HERITAGE" },
  { name: "Keystone Bank", code: "082", acronym: "KEYSTONE" },
  { name: "Kuda Microfinance Bank", code: "50211", acronym: "KUDA" },
  { name: "Moniepoint MFB", code: "50515", acronym: "MONIEPOINT" },
  { name: "OPay Digital Services", code: "999992", acronym: "OPAY" },
  { name: "PalmPay", code: "999991", acronym: "PALMPAY" },
  { name: "Polaris Bank", code: "076", acronym: "POLARIS" },
  { name: "Stanbic IBTC Bank", code: "221", acronym: "STANBIC" },
  { name: "Standard Chartered Bank", code: "068", acronym: "STANCHART" },
  { name: "Sterling Bank", code: "232", acronym: "STERLING" },
  { name: "Union Bank of Nigeria", code: "032", acronym: "UBN" },
  { name: "United Bank for Africa", code: "033", acronym: "UBA" },
  { name: "Unity Bank", code: "215", acronym: "UNITY" },
  { name: "Wema Bank", code: "035", acronym: "WEMA" },
  { name: "Zenith Bank", code: "057", acronym: "ZENITH" },
];
