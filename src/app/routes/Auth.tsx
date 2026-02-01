import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login, requestPasswordReset, signup, getGoogleLogin, fetchMe } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { writeAuthToken, writeRefreshToken } from "../lib/storage";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Handle Google redirect tokens
  useEffect(() => {
    const token = searchParams.get("token");
    const refresh = searchParams.get("refresh");
    const status = searchParams.get("status");
    const process = async () => {
      if (token && refresh && status === "ok") {
        try {
          writeAuthToken(token);
          writeRefreshToken(refresh);
          const me = await fetchMe();
          signIn(token, refresh, me);
          navigate("/");
        } catch (err) {
          const message = err instanceof Error ? err.message : "Google sign-in failed.";
          setError(message);
        } finally {
          const url = new URL(window.location.href);
          ["token", "refresh", "status", "provider"].forEach((key) => url.searchParams.delete(key));
          window.history.replaceState({}, "", url.toString());
        }
      }
    };
    process();
  }, [searchParams, signIn, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Please enter the email you signed up with.");
        return;
      }
      setLoading(true);
      try {
        await requestPasswordReset(email.trim());
        setNotice("Check your inbox for a password reset link.");
        setMode("login");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Reset request failed.";
        setError(message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError("Please enter a username and password.");
      return;
    }
    if (mode === "signup") {
      if (!email.trim()) {
        setError("Please enter a valid email.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      const result =
        mode === "signup"
          ? await signup({ username: username.trim(), email: email.trim(), password })
          : await login({ username: username.trim(), password });
      signIn(result.token, result.refresh_token, result.user);
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] flex items-center justify-center px-6">
      <div className="w-full max-w-4xl grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl bg-white/80 p-10 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b2a8c6]">
            ReTone
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-[#3d3854]">
            Sign in to fix the vibe faster.
          </h1>
          <p className="mt-3 text-sm text-[#7d7890]">
            Save your presets, track what works with each person, and unlock more vibe-fixes.
            Email verification is required.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[#6f6a83]">
            <li>- Save your "my voice" presets.</li>
            <li>- Track conversation health per person.</li>
            <li>- Unlock scenarios, quick actions, and more vibes.</li>
          </ul>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex gap-2 rounded-full bg-[#f3f0fb] p-1 text-xs font-semibold text-[#7d7890]">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={
                mode === "login"
                  ? "flex-1 rounded-full bg-white px-4 py-2 text-[#3d3854] shadow"
                  : "flex-1 px-4 py-2"
              }
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={
                mode === "signup"
                  ? "flex-1 rounded-full bg-white px-4 py-2 text-[#3d3854] shadow"
                  : "flex-1 px-4 py-2"
              }
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className={
                mode === "forgot"
                  ? "flex-1 rounded-full bg-white px-4 py-2 text-[#3d3854] shadow"
                  : "flex-1 px-4 py-2"
              }
            >
              Forgot
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode !== "forgot" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="yourname"
                  className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
                />
              </div>
            )}
            {(mode === "signup" || mode === "forgot") && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
                />
              </div>
            )}
            {mode !== "forgot" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
                />
              </div>
            )}
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-full border border-[#e5e7eb] px-4 py-2 text-sm text-[#4a4561]"
                />
              </div>
            )}
            {notice ? <p className="text-sm text-[#6bb38b]">{notice}</p> : null}
            {error ? <p className="text-sm text-[#b9586b]">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#3d3854] px-4 py-3 text-sm font-semibold text-white"
            >
              {loading
                ? "Working..."
                : mode === "signup"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Send reset email"
                    : "Log in"}
            </button>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={async () => {
                try {
                  const { url } = await getGoogleLogin();
                  window.location.href = url;
                } catch (err) {
                  const message = err instanceof Error ? err.message : "Google sign-in failed.";
                  setError(message);
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e5e7eb] px-4 py-3 text-sm font-semibold text-[#3d3854] hover:bg-[#f7f5fb]"
            >
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-xs text-[#9b96aa]">
            By continuing you agree to keep things respectful.{" "}
            <Link to="/" className="text-[#5e78a8] hover:underline">
              Back to app
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
