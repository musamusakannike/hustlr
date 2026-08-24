export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredId?: string;
  status?: string;
  rewardAmount?: number;
  createdAt: string;
}

export interface ReferralSummary {
  code: string;
  referrals: ReferralRecord[];
}