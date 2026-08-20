import { REFERRAL_CODE_ALPHABET, REFERRAL_CODE_LENGTH } from "../config/constants.config";

export function generateReferralCode(length = REFERRAL_CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += REFERRAL_CODE_ALPHABET[Math.floor(Math.random() * REFERRAL_CODE_ALPHABET.length)];
  }
  return code;
}

export async function uniqueReferralCode(
  exists: (code: string) => Promise<boolean>,
): Promise<string> {
  for (let i = 0; i < 20; i += 1) {
    const code = generateReferralCode();
    if (!(await exists(code))) return code;
  }
  return generateReferralCode(REFERRAL_CODE_LENGTH + 2);
}
