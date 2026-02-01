import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { sendSupportMessage } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const categories = ["Billing", "Account", "Technical", "Feedback", "Other"];

export default function Support() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.username || "");
    setEmail((prev) => prev || user.email || "");
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    setError("");
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("Please complete every required field.");
      return;
    }
    setLoading(true);
    try {
      await sendSupportMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        category,
        order_id: orderId.trim() || undefined,
      });
      setStatus("Thanks! Your message is on its way. We will reply soon.");
      setMessage("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Support request failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] px-6 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b2a8c6]">
              Support
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-[#3d3854]">
              We got you (no judgement)
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#7d7890]">
            <Link to="/" className="hover:text-[#3d3854]">
              Back to app
            </Link>
            <Link to="/pricing" className="hover:text-[#3d3854]">
              Pricing
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white/90 p-8 shadow-xl"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 w-full rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm text-[#4a4561]"
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                  Order ID (optional)
                </label>
                <input
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  placeholder="Dodo payment ID"
                  className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                Subject
              </label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="What can we help with?"
                className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                Message
              </label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe the issue and what you need from us."
                className="mt-2 w-full min-h-[160px] rounded-2xl border border-[#e5e7eb] px-4 py-3 text-sm text-[#4a4561]"
              />
            </div>

            {status ? <p className="mt-4 text-sm text-[#6bb38b]">{status}</p> : null}
            {error ? <p className="mt-4 text-sm text-[#b9586b]">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#3d3854] px-6 py-3 text-sm font-semibold text-white"
            >
              {loading ? "Sending..." : "Send support request"}
            </button>
          </form>

            <aside className="rounded-3xl bg-white/70 p-6 text-sm text-[#7d7890] shadow-lg">
              <h2 className="text-sm font-semibold text-[#3d3854]">What happens next?</h2>
              <ul className="mt-3 space-y-3 text-xs">
                <li>We reply within 1-2 business days.</li>
                <li>Billing: include your payment ID for faster help.</li>
                <li>Bug report: paste the exact error text if you can.</li>
              </ul>
              <div className="mt-6 rounded-2xl bg-[#f8f4fb] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b2a8c6]">
                  Quick fixes
                </p>
                <p className="mt-2 text-xs">
                  For login or verification issues, try signing out and signing back in after checking
                  your inbox (and spam/promotions).
                </p>
              </div>
            </aside>
        </div>
      </div>
    </div>
  );
}
