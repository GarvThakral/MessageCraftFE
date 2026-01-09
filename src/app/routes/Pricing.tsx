import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Sparkles, User, Users, Briefcase } from "lucide-react";

import { createDodoCheckoutLink } from "../lib/api";
import { readTier } from "../lib/storage";
import { useAuth } from "../hooks/useAuth";

const PRICING = {
  FREE: { weekly: 0, monthly: 0 },
  STARTER: { weekly: 1.75, monthly: 6.99 },
  PRO: { weekly: 4, monthly: 16 },
};

const FEATURES = {
  FREE: [
    "1 translation per day",
    "3 tone variations",
    "Basic tone analysis",
  ],
  STARTER: [
    "25 translations per week",
    "All 5 tone variations",
    "Smart analysis panel",
    "Conversation memory (5 contacts)",
    "Red flag detection",
    "Quick actions",
    "Clipboard export",
  ],
  PRO: [
    "Unlimited translations",
    "Custom tone presets",
    "Batch mode",
    "One-click scenarios",
    "Reports + dashboards",
  ],
};

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. One-time purchases expire after 30 days, so you can renew anytime.",
  },
  {
    q: "Do unused translations roll over?",
    a: "No. Free resets daily; paid plans reset weekly.",
  },
  {
    q: "What payment methods are supported?",
    a: "Dodo checkout supports cards and local payment methods.",
  },
];

export default function Pricing() {
  const [peopleCount, setPeopleCount] = useState(2347);
  const [currentTier, setCurrentTier] = useState(readTier());
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<"STARTER" | "PRO" | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setPeopleCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.tier) {
      setCurrentTier(user.tier);
    } else {
      setCurrentTier(readTier());
    }
  }, [isAuthenticated, user?.tier]);

  const starterPreviewDisabled = currentTier !== "FREE";
  const starterPreviewLabel =
    currentTier === "STARTER" ? "Current plan" : currentTier === "PRO" ? "You're on Pro" : "Activate Starter";

  const activateTier = async (plan: "FREE" | "STARTER" | "PRO") => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (plan === currentTier) {
      return;
    }
    if (currentTier === "PRO" && plan === "STARTER") {
      return;
    }
    try {
      if (plan === "FREE") {
        navigate("/");
        return;
      }
      setCheckoutPlan(plan);
      setCheckoutLoading(true);
      const result = await createDodoCheckoutLink(plan);
      window.location.href = result.checkout_url;
    } catch {
      // Keep current tier if update fails.
      setCheckoutLoading(false);
      setCheckoutPlan(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7]">
      <header className="flex items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 text-[#3d3854]">
          <Sparkles className="h-5 w-5 text-[#d96a94]" />
          <span className="text-sm font-semibold">MessageCraft Pro</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-[#7d7890]">
          <Link to="/support" className="hover:text-[#3d3854]">
            Support
          </Link>
          <Link to="/" className="hover:text-[#3d3854]">
            Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-16">
        <section className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b2a8c6]">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold text-[#3d3854]">
            Choose Your Communication Superpower
          </h1>
          <p className="mt-4 text-lg text-[#7d7890]">
            Weekly pricing that is billed monthly for simplicity.
          </p>
          <p className="mt-4 text-xs text-[#9b96aa]">Current plan: {currentTier}</p>
          {!isAuthenticated && (
            <p className="mt-2 text-xs text-[#b2a8c6]">
              Sign in to select a plan and sync it across devices.
            </p>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {([
            { tier: "FREE", highlight: false },
            { tier: "STARTER", highlight: false },
            { tier: "PRO", highlight: true },
          ] as const).map(({ tier, highlight }) => {
            const isCurrent = tier === currentTier;
            const isDowngrade = currentTier === "PRO" && tier === "STARTER";
            return (
              <div
                key={tier}
                className={
                  highlight
                    ? "rounded-3xl border-2 border-[#e77ba0] bg-white p-6 shadow-2xl"
                    : "rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg"
                }
              >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#3d3854]">{tier}</h2>
                {highlight && (
                  <span className="rounded-full bg-[#ffe2eb] px-3 py-1 text-xs font-semibold text-[#d45c86]">
                    Most Popular
                  </span>
                )}
              </div>
              {tier === "FREE" ? (
                <p className="mt-4 text-3xl font-semibold text-[#3d3854]">Free</p>
              ) : (
                <div className="mt-4">
                  <p className="text-3xl font-semibold text-[#3d3854]">
                    ${PRICING[tier].weekly.toFixed(2)}
                    <span className="text-sm font-normal text-[#7d7890]">/week</span>
                  </p>
                  <p className="text-xs text-[#9b96aa]">
                    ${PRICING[tier].monthly.toFixed(2)} billed monthly
                  </p>
                </div>
              )}
              <ul className="mt-4 space-y-2 text-sm text-[#6f6a83]">
                {FEATURES[tier].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#7dd179]" />
                    {feature}
                  </li>
                ))}
              </ul>
              {tier !== "FREE" ? (
                <button
                  onClick={() => activateTier(tier)}
                  disabled={isCurrent || isDowngrade}
                  className={
                    highlight
                      ? `mt-6 w-full rounded-full px-4 py-3 text-sm font-semibold ${
                          isCurrent || isDowngrade
                            ? "bg-[#a3a0b3] text-white/80"
                            : "bg-[#3d3854] text-white"
                        }`
                      : `mt-6 w-full rounded-full px-4 py-3 text-sm font-semibold ${
                          isCurrent || isDowngrade
                            ? "bg-[#f0c5d5] text-white/80"
                            : "bg-[#e77ba0] text-white"
                        }`
                  }
                >
                  {isCurrent
                    ? "Current plan"
                    : isDowngrade
                      ? "Included in Pro"
                      : `Activate ${tier}`}
                </button>
              ) : (
                <Link
                  to="/"
                  className="mt-6 inline-flex w-full justify-center rounded-full border border-[#e5e7eb] px-4 py-3 text-sm text-[#7d7890]"
                >
                  {currentTier === "FREE" ? "Current plan" : "Continue with Free"}
                </Link>
              )}
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe2eb]">
              <User className="h-5 w-5 text-[#d96a94]" />
            </div>
            <h3 className="text-sm font-semibold text-[#3d3854]">Starter is for</h3>
            <p className="mt-2 text-sm text-[#7d7890]">
              Individuals in relationships, job seekers, or anyone needing a steady communication
              edge.
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f0ff]">
              <Briefcase className="h-5 w-5 text-[#6bb3d9]" />
            </div>
            <h3 className="text-sm font-semibold text-[#3d3854]">Pro is for</h3>
            <p className="mt-2 text-sm text-[#7d7890]">
              Managers, therapists, sales teams, and anyone communicating at scale.
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf7ee]">
              <Users className="h-5 w-5 text-[#7dd179]" />
            </div>
            <h3 className="text-sm font-semibold text-[#3d3854]">Free is for</h3>
            <p className="mt-2 text-sm text-[#7d7890]">
              Trying the magic and seeing what MessageCraft can do for your tone.
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white/80 p-8 text-center shadow-lg">
          <h3 className="text-2xl font-semibold text-[#3d3854]">
            Join {peopleCount.toLocaleString()} people communicating better
          </h3>
          <p className="mt-3 text-sm text-[#7d7890]">"This saved my relationship" - Sarah M.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-3xl bg-white/80 p-6 shadow-lg">
              <h4 className="text-sm font-semibold text-[#3d3854]">{faq.q}</h4>
              <p className="mt-2 text-sm text-[#7d7890]">{faq.a}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl bg-white/80 p-8 text-center shadow-lg">
          <h3 className="text-2xl font-semibold text-[#3d3854]">
            Preview Starter features instantly
          </h3>
          <p className="mt-3 text-sm text-[#7d7890]">
            Payments are disabled right now. Switch tiers anytime to explore the full product.
          </p>
          <button
            onClick={() => activateTier("STARTER")}
            disabled={starterPreviewDisabled}
            className={`mt-6 rounded-full px-6 py-3 text-sm font-semibold ${
              starterPreviewDisabled ? "cursor-not-allowed bg-[#f0c5d5] text-white/80" : "bg-[#e77ba0] text-white"
            }`}
          >
            {starterPreviewLabel}
          </button>
        </section>
      </main>

      {checkoutLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#e77ba0] border-t-transparent" />
            <p className="mt-4 text-sm font-semibold text-[#3d3854]">
              Preparing secure checkout
            </p>
            {checkoutPlan && (
              <p className="mt-1 text-xs text-[#9b96aa]">
                Plan: {checkoutPlan === "STARTER" ? "Starter" : "Pro"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
