import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";

import { verifyCheckoutSession } from "../lib/api";
import { writeCustomerId, writeTier } from "../lib/storage";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying your subscription...");
  const [tier, setTier] = useState("FREE");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("Missing session info. Please contact support.");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyCheckoutSession(sessionId);
        const normalizedTier =
          result.tier === "PRO" ? "PRO" : result.tier === "STARTER" ? "STARTER" : "FREE";
        setTier(normalizedTier);
        writeTier(normalizedTier);
        if (result.customer_id) {
          writeCustomerId(result.customer_id);
        }
        const label =
          normalizedTier === "FREE" ? "MessageCraft" : `MessageCraft ${normalizedTier}`;
        setStatus(`Welcome to ${label}!`);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Verification failed.";
        setStatus(message);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] flex items-center justify-center px-6">
      <div className="max-w-xl rounded-3xl bg-white/90 p-8 text-center shadow-xl">
        <h1 className="text-3xl font-semibold text-[#3d3854]">{status}</h1>
        <p className="mt-4 text-sm text-[#7d7890]">
          Your plan is now {tier}. Explore the new features below.
        </p>
        <div className="mt-6 rounded-2xl bg-[#f8f4fb] p-4 text-left text-sm text-[#6f6a83]">
          <p className="font-semibold text-[#3d3854]">Quick tour</p>
          <ul className="mt-2 space-y-2">
            <li>- Unlock all tone variations and tactical rewrites.</li>
            <li>- Access quick actions, scenarios, and red-flag detection.</li>
            <li>- Track communication health with conversation memory.</li>
          </ul>
        </div>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-[#3d3854] px-6 py-3 text-sm font-semibold text-white"
        >
          Go to the app
        </Link>
      </div>
    </div>
  );
}
