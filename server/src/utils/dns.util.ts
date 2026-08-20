import dns from "dns/promises";
import { env } from "../config/env.config";

export function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

export function isValidDomain(domain: string): boolean {
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain);
}

export async function verifyCustomDomain(domain: string): Promise<{
  verified: boolean;
  records: string[];
  message: string;
}> {
  const target = env.customDomainCnameTarget.toLowerCase();
  const records: string[] = [];
  try {
    const cnames = await dns.resolveCname(domain);
    records.push(...cnames);
    if (cnames.some((c) => c.replace(/\.$/, "").toLowerCase() === target)) {
      return { verified: true, records, message: "CNAME verified" };
    }
  } catch {
    // apex domains often have no CNAME
  }

  if (env.platformServerIp) {
    try {
      const aRecords = await dns.resolve4(domain);
      records.push(...aRecords);
      if (aRecords.includes(env.platformServerIp)) {
        return { verified: true, records, message: "A record verified" };
      }
    } catch {
      // ignore
    }
  }

  return {
    verified: false,
    records,
    message: `DNS does not yet point to ${target}${env.platformServerIp ? ` or ${env.platformServerIp}` : ""}`,
  };
}
