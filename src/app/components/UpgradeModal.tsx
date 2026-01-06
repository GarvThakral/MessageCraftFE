import type { Tier } from "../lib/types";

const PRICES = {
  starter: { weekly: 1.99, monthly: 6.99 },
  pro: { weekly: 4.99, monthly: 16.99 },
};

export type UpgradeReason = "limit_reached" | "feature_locked" | "result_moment";

interface UpgradeModalProps {
  open: boolean;
  reason: UpgradeReason;
  currentTier: Tier;
  billingCycle: "weekly" | "monthly";
  onClose: () => void;
  onSelectPlan: (plan: "STARTER" | "PRO") => void;
}

const reasonCopy: Record<UpgradeReason, { title: string; description: string }> = {
  limit_reached: {
    title: "Upgrade to keep translating",
    description: "You have hit your weekly limit. Unlock more translations instantly.",
  },
  feature_locked: {
    title: "This feature is in a paid plan",
    description: "Upgrade to unlock strategic insights, scenarios, and advanced tools.",
  },
  result_moment: {
    title: "You are getting sharper at communication",
    description: "Unlock unlimited translations and advanced analysis with Pro.",
  },
};

export default function UpgradeModal({
  open,
  reason,
  currentTier,
  billingCycle,
  onClose,
  onSelectPlan,
}: UpgradeModalProps) {
  if (!open) return null;

  const copy = reasonCopy[reason];
  const cycleLabel = billingCycle === "weekly" ? "week" : "month";

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
              ${PRICES.starter[billingCycle].toFixed(2)}
              <span className="text-sm font-normal text-[#7d7890]">/{cycleLabel}</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#6f6a83]">
              <li>25 translations per week</li>
              <li>All 5 tone variations</li>
              <li>Full analysis + red flags</li>
              <li>Conversation memory (5 contacts)</li>
            </ul>
            <button
              onClick={() => onSelectPlan("STARTER")}
              className="mt-6 w-full rounded-full bg-[#e77ba0] px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Activate Starter
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
              ${PRICES.pro[billingCycle].toFixed(2)}
              <span className="text-sm font-normal text-[#7d7890]">/{cycleLabel}</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#6f6a83]">
              <li>Unlimited translations</li>
              <li>Advanced insights + dashboards</li>
              <li>Custom presets + batch mode</li>
              <li>Priority one-click scenarios</li>
            </ul>
            <button
              onClick={() => onSelectPlan("PRO")}
              className="mt-6 w-full rounded-full bg-[#3d3854] px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Activate Pro
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
