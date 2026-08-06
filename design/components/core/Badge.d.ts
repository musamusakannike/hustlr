export interface BadgeProps {
  children: React.ReactNode;
  /** sale = red discount tag, info = blue, success = green, neutral = gray */
  tone?: "sale" | "info" | "success" | "neutral";
}
export interface RatingBadgeProps {
  value: string | number;
}
