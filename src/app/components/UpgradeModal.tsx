import type { Tier } from "../lib/types";

const PRICES = {
  starter: { weekly: 1.75, monthly: 6.99 },
  pro: { weekly: 4, monthly: 16 },
};

export type UpgradeReason = "limit_reached" | "feature_locked" | "result_moment";

interface UpgradeModalProps {
  open: boolean;
  reason: UpgradeReason;
  currentTier: Tier;
  onClose: () => void;
  onSelectPlan: (plan: "STARTER" | "PRO") => void;
}

const reasonCopy: Record<UpgradeReason, { title: string; description: string }> = {
  limit_reached: {
    title: "Upgrade to keep fixing the vibe",
    description: "You hit your limit. Unlock more vibe-fixes instantly.",
  },
  feature_locked: {
    title: "This feature is in a paid plan",
    description: "Upgrade to unlock extra vibes, scenarios, and the good stuff.",
  },
  result_moment: {
    title: "You're getting better at hard conversations",
    description: "Unlock unlimited vibe-fixes and advanced analysis with Pro.",
  },
};

export default function UpgradeModal({
  open,
  reason,
  currentTier,
  onClose,
  onSelectPlan,
}: UpgradeModalProps) {
  if (!open) return null;

  const copy = reasonCopy[reason];
  const starterCurrent = currentTier === "STARTER";
  const proCurrent = currentTier === "PRO";
  const starterDisabled = starterCurrent || currentTier === "PRO";
  const starterLabel = starterCurrent
    ? "Current plan"
    : currentTier === "PRO"
      ? "Included in Pro"
      : "Activate Starter";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b2a8c6]">
              Upgrade
            </p>
            <h2 className="text-3xl font-semibold text-[#3d3854]">{copy.title}</h2>
            <p className="mt-2 text-sm text-[#7d7890]">{copy.description}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-[#e5e7eb] px-3 py-1 text-xs font-semibold text-[#7d7890]"
          >
            Close
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#e8e4f2] bg-[#f8f4fb] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b2a8c6]">
              Starter
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#3d3854]">
              ${PRICES.starter.weekly.toFixed(2)}
              <span className="text-sm font-normal text-[#7d7890]">/week</span>
            </p>
            <p className="text-xs text-[#9b96aa]">
              ${PRICES.starter.monthly.toFixed(2)} billed monthly
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#6f6a83]">
              <li>25 vibe-fixes per week</li>
              <li>All 5 texting vibes</li>
              <li>Full analysis + red flags</li>
              <li>Conversation memory (5 people)</li>
            </ul>
            <button
              onClick={() => onSelectPlan("STARTER")}
              disabled={starterDisabled}
              className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold shadow-lg ${
                starterDisabled
                  ? "cursor-not-allowed bg-[#f0c5d5] text-white/80"
                  : "bg-[#e77ba0] text-white"
              }`}
            >
              {starterLabel}
            </button>
          </div>

          <div className="rounded-2xl border-2 border-[#e77ba0] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b2a8c6]">
                Pro
              </p>
              <span className="rounded-full bg-[#ffe2eb] px-3 py-1 text-xs font-semibold text-[#d45c86]">
                Most Popular
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-[#3d3854]">
              ${PRICES.pro.weekly.toFixed(2)}
              <span className="text-sm font-normal text-[#7d7890]">/week</span>
            </p>
            <p className="text-xs text-[#9b96aa]">
              ${PRICES.pro.monthly.toFixed(2)} billed monthly
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#6f6a83]">
              <li>Unlimited vibe-fixes</li>
              <li>Reports + dashboards</li>
              <li>Custom presets + batch mode</li>
              <li>Priority one-click scenarios</li>
            </ul>
            <button
              onClick={() => onSelectPlan("PRO")}
              disabled={proCurrent}
              className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold shadow-lg ${
                proCurrent ? "cursor-not-allowed bg-[#a3a0b3] text-white/80" : "bg-[#3d3854] text-white"
              }`}
            >
              {proCurrent ? "Current plan" : "Activate Pro"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-[#9b96aa]">
          Switch plans anytime. Current plan: {currentTier}.
        </p>
      </div>
    </div>
  );
}
