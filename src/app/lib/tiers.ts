import type { Tier } from "./types";

export const TIERS = {
  FREE: {
    weeklyLimit: 3,
    toneVariations: 3,
    conversationMemory: 0,
    features: ["basic_analysis"],
  },
  STARTER: {
    weeklyLimit: 25,
    toneVariations: 5,
    conversationMemory: 5,
    features: [
      "full_analysis",
      "red_flags",
      "quick_actions",
      "conversation_tracking",
      "export_clipboard",
    ],
  },
  PRO: {
    weeklyLimit: Number.POSITIVE_INFINITY,
    toneVariations: 5,
    conversationMemory: Number.POSITIVE_INFINITY,
    features: [
      "all",
      "custom_presets",
      "batch_mode",
      "advanced_insights",
      "chrome_extension",
      "reports",
      "scenarios",
    ],
  },
} as const;

export type FeatureKey =
  | "basic_analysis"
  | "full_analysis"
  | "red_flags"
  | "quick_actions"
  | "conversation_tracking"
  | "custom_presets"
  | "batch_mode"
  | "advanced_insights"
  | "chrome_extension"
  | "reports"
  | "scenarios"
  | "export_clipboard"
  | "all";

export function checkFeatureAccess(feature: FeatureKey, userTier: Tier): boolean {
  const tierFeatures = TIERS[userTier].features;
  return tierFeatures.includes("all") || tierFeatures.includes(feature);
}

export function canTranslate(userTier: Tier, weeklyUsage: number): boolean {
  return weeklyUsage < TIERS[userTier].weeklyLimit;
}

export function getToneLimit(userTier: Tier): number {
  return TIERS[userTier].toneVariations;
}
