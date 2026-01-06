import { useCallback, useEffect, useMemo, useState } from "react";
import { canTranslate, TIERS } from "../lib/tiers";
import type { Tier, UsageState } from "../lib/types";
import { incrementUsage, getUsageState } from "../lib/usage";
import { readTier, writeTier } from "../lib/storage";

export function useTierState() {
  const [tier, setTier] = useState<Tier>(readTier);
  const [usage, setUsage] = useState<UsageState>(getUsageState);

  useEffect(() => {
    writeTier(tier);
  }, [tier]);

  useEffect(() => {
    setUsage(getUsageState());
  }, []);

  const recordUsage = useCallback(
    (amount = 1) => {
      const next = incrementUsage(amount);
      setUsage(next);
      return next;
    },
    [setUsage],
  );

  const remaining = useMemo(() => {
    const limit = TIERS[tier].weeklyLimit;
    if (!Number.isFinite(limit)) return Infinity;
    return Math.max(0, limit - usage.count);
  }, [tier, usage.count]);

  const canRun = useMemo(() => canTranslate(tier, usage.count), [tier, usage.count]);

  return {
    tier,
    setTier,
    usage,
    remaining,
    canRun,
    recordUsage,
  };
}
