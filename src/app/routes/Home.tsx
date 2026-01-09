import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ChevronDown,
  MessageCircle,
  Sparkles,
  Lightbulb,
  Copy,
  Lock,
  Wand2,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { jsPDF } from "jspdf";

import {
  createConversationEntry,
  createDodoCheckoutLink,
  fetchConversations,
  fetchMessageCraft,
  resendVerification,
} from "../lib/api";
import { buildSummary } from "../lib/conversation";
import { checkFeatureAccess, getToneLimit, TIERS } from "../lib/tiers";
import type {
  ConversationEntry,
  MessageCraftResponse,
  Preset,
  QuickActionKey,
  ScenarioKey,
  TacticalKey,
  ToneKey,
} from "../lib/types";
import { readPresets, writePresets } from "../lib/storage";
import { classNames } from "../lib/utils";
import { useTierState } from "../hooks/useTier";
import UpgradeModal, { type UpgradeReason } from "../components/UpgradeModal";
import UsageBanner from "../components/UsageBanner";
import { useAuth } from "../hooks/useAuth";

const toneOptions: Array<{ key: ToneKey; label: string; description: string }> = [
  {
    key: "professional_formal",
    label: "Professional / Formal",
    description: "Crisp, respectful, business-ready clarity.",
  },
  {
    key: "empathetic_warm",
    label: "Empathetic / Warm",
    description: "Validating and emotionally attuned.",
  },
  {
    key: "direct_assertive",
    label: "Direct / Assertive",
    description: "Clear boundaries with confident intent.",
  },
  {
    key: "diplomatic_tactful",
    label: "Diplomatic / Tactful",
    description: "Balanced, cooperative, and face-saving.",
  },
  {
    key: "casual_friendly",
    label: "Casual / Friendly",
    description: "Relaxed and easy to read.",
  },
];

const tacticalOptions: Array<{ key: TacticalKey; label: string }> = [
  { key: "add_emotional_validation", label: "Add emotional validation" },
  { key: "remove_emotional_validation", label: "Remove emotional validation" },
  { key: "include_action_items", label: "Include action items" },
  { key: "exclude_action_items", label: "Exclude action items" },
  { key: "add_softeners", label: "Add strategic softeners" },
  { key: "add_strengtheners", label: "Add strengtheners" },
  { key: "insert_boundaries", label: "Insert boundaries" },
  { key: "frame_as_question", label: "Frame as a question" },
  { key: "frame_as_statement", label: "Frame as a statement" },
];

const scenarioOptions: Array<{ key: ScenarioKey; label: string }> = [
  { key: "boundary_setting", label: "Make this a boundary-setting message" },
  { key: "clarifying_question", label: "Turn this into a clarifying question" },
  { key: "accountability_without_blame", label: "Add accountability without blame" },
  { key: "collaborative_proposal", label: "Make this a collaborative proposal" },
  { key: "non_defensive_response", label: "Convert to non-defensive response" },
];

const quickActionOptions: Array<{ key: QuickActionKey; label: string }> = [
  { key: "condense", label: "Too long -> auto-condense" },
  { key: "expand", label: "Too short -> expand with warmth" },
  { key: "cool_down", label: "Seems angry -> cool down" },
  { key: "add_assertiveness", label: "Too passive -> add assertiveness" },
];

const audienceOptions = ["Neutral", "Gen Z", "Millennial", "Boomer"];

const goalOptions = [
  "De-escalate tension",
  "Clarify expectations",
  "Make a request",
  "Repair trust",
  "Set boundaries",
];

const EXAMPLE_MESSAGES = [
  "You never listen to me!",
  "I don't see what the big deal is.",
  "Why can't you just understand?",
];

const POWER_LABELS: Record<string, string> = {
  speaker_has_leverage: "You hold leverage",
  balanced: "Balanced",
  other_has_leverage: "They hold leverage",
};

const DEMO_EXAMPLES = [
  {
    input: "I hate you, this is exhausting.",
    output: "I'm really upset right now. Can we pause and talk when I'm calmer?",
  },
  {
    input: "You never listen to me.",
    output: "I feel unheard lately. Can we slow down and really talk this through?",
  },
  {
    input: "Stop being so dramatic.",
    output: "I want to understand you, but I need us to keep this calm.",
  },
];

export default function Home() {
  const { user, token, isAuthenticated, signOut } = useAuth();
  const { tier, usage, remaining, canRun, updateUsage } = useTierState(token);
  const [toneValue, setToneValue] = useState(50);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<MessageCraftResponse | null>(null);
  const [activeRewrite, setActiveRewrite] = useState("");
  const [activeLabel, setActiveLabel] = useState("No output yet");
  const [activeTone, setActiveTone] = useState<ToneKey>("professional_formal");
  const [activeScenario, setActiveScenario] = useState<ScenarioKey | null>(null);
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionKey | null>(null);
  const [activeTactical, setActiveTactical] = useState<TacticalKey | null>(null);
  const [audienceStyle, setAudienceStyle] = useState("Gen Z");
  const [userGoal, setUserGoal] = useState(goalOptions[0]);
  const [contactName, setContactName] = useState("General");
  const [batchMode, setBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<
    Array<{ input: string; response: MessageCraftResponse }>
  >([]);
  const [presets, setPresets] = useState<Preset[]>(readPresets());
  const [presetName, setPresetName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [error, setError] = useState("");
  const [verificationNotice, setVerificationNotice] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const [billingCycle] = useState<"weekly" | "monthly">("weekly");
  const [conversationEntries, setConversationEntries] = useState<ConversationEntry[]>([]);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [demoInput, setDemoInput] = useState("");
  const [demoOutput, setDemoOutput] = useState("");

  const toneLimit = getToneLimit(tier);
  const allowFullAnalysis = checkFeatureAccess("full_analysis", tier);
  const allowRedFlags = checkFeatureAccess("red_flags", tier);
  const allowQuickActions = checkFeatureAccess("quick_actions", tier);
  const allowConversation = checkFeatureAccess("conversation_tracking", tier);
  const allowInsights = checkFeatureAccess("advanced_insights", tier);
  const allowScenarios = checkFeatureAccess("scenarios", tier);
  const allowPresets = checkFeatureAccess("custom_presets", tier);
  const allowBatchMode = checkFeatureAccess("batch_mode", tier);
  const allowClipboard = checkFeatureAccess("export_clipboard", tier);
  const lockedLabel = tier === "FREE" ? "Starter" : "Pro";
  const displayInputValue = isAuthenticated ? input : demoInput;
  const displayOutputValue = isAuthenticated ? activeRewrite : demoOutput;
  const displayActiveLabel = isAuthenticated ? activeLabel : "Demo mode";

  const usageNotice = useMemo(() => {
    if (tier === "FREE" && usage.count >= TIERS.FREE.weeklyLimit) {
      return "You've used today's free translation. Upgrade to Starter for 25/week at $1.99.";
    }
    if (tier === "STARTER" && usage.count >= 20) {
      return "You're a power user. Upgrade to Pro for unlimited translations.";
    }
    return "";
  }, [tier, usage.count]);

  const mapConversationEntry = (entry: {
    id: string;
    contact: string;
    tone_key: string;
    tone_scores: MessageCraftResponse["analysis"]["tone_scores"];
    impact_prediction: number;
    clarity_before: number;
    clarity_after: number;
    created_at: string;
  }): ConversationEntry => {
    const timestamp = Date.parse(entry.created_at);
    const resolvedTone =
      toneOptions.find((tone) => tone.key === entry.tone_key)?.key || "professional_formal";
    return {
      id: entry.id,
      contact: entry.contact,
      timestamp: Number.isNaN(timestamp) ? Date.now() : timestamp,
      tone: resolvedTone,
      toneScores: entry.tone_scores,
      impactPrediction: entry.impact_prediction,
      clarityScore: entry.clarity_after,
    };
  };

  const refreshConversations = async () => {
    if (!allowConversation) {
      setConversationEntries([]);
      return;
    }
    try {
      const data = await fetchConversations();
      setConversationEntries(data.entries.map(mapConversationEntry));
    } catch {
      // Keep existing entries if the backend is unavailable.
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadConversations = async () => {
      if (!allowConversation) {
        setConversationEntries([]);
        return;
      }
      try {
        const data = await fetchConversations();
        if (cancelled) return;
        setConversationEntries(data.entries.map(mapConversationEntry));
      } catch {
        if (!cancelled) {
          setConversationEntries([]);
        }
      }
    };
    loadConversations();
    return () => {
      cancelled = true;
    };
  }, [allowConversation, tier]);

  const filteredEntries = useMemo(() => {
    if (!contactName.trim()) return [];
    return conversationEntries.filter((entry) => entry.contact === contactName);
  }, [conversationEntries, contactName]);
  const conversationSummary = useMemo(
    () => buildSummary(filteredEntries),
    [filteredEntries],
  );

  const contacts = useMemo(() => {
    const unique = new Set(conversationEntries.map((entry) => entry.contact));
    return Array.from(unique);
  }, [conversationEntries]);

  useEffect(() => {
    if (!response) return;
    const defaultTone = toneOptions[0].key;
    setActiveTone(defaultTone);
    setActiveScenario(null);
    setActiveQuickAction(null);
    setActiveTactical(null);
    setActiveLabel(toneOptions[0].label);
    setActiveRewrite(response.tone_versions[defaultTone]);
  }, [response]);

  useEffect(() => {
    writePresets(presets);
  }, [presets]);

  useEffect(() => {
    if (isAuthenticated) {
      setDemoInput("");
      setDemoOutput("");
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) {
          fn();
        }
      }, delay);
      timers.push(id);
    };

    const typeText = (
      text: string,
      setter: (value: string) => void,
      speed: number,
      onDone: () => void,
    ) => {
      let index = 0;
      const tick = () => {
        if (cancelled) return;
        index += 1;
        setter(text.slice(0, index));
        if (index < text.length) {
          schedule(tick, speed);
        } else {
          onDone();
        }
      };
      schedule(tick, speed);
    };

    const runExample = (exampleIndex: number) => {
      const example = DEMO_EXAMPLES[exampleIndex % DEMO_EXAMPLES.length];
      setDemoInput("");
      setDemoOutput("");

      let inputDone = false;
      let outputDone = false;
      const handleDone = () => {
        if (inputDone && outputDone) {
          schedule(() => runExample(exampleIndex + 1), 1200);
        }
      };

      typeText(example.input, setDemoInput, 28, () => {
        inputDone = true;
        handleDone();
      });
      typeText(example.output, setDemoOutput, 32, () => {
        outputDone = true;
        handleDone();
      });
    };

    runExample(0);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoginPromptOpen(false);
    }
  }, [isAuthenticated]);

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find((item) => item.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    setAudienceStyle(preset.audienceStyle);
    setToneValue(preset.toneBalance);
    setActiveTone(preset.preferredTone);
  };

  const handleSavePreset = () => {
    if (!allowPresets) {
      setUpgradeReason("feature_locked");
      return;
    }
    if (!presetName.trim()) return;
    const newPreset: Preset = {
      id: crypto.randomUUID(),
      name: presetName.trim(),
      audienceStyle,
      preferredTone: activeTone,
      toneBalance: toneValue,
      toggles: activeTactical ? [activeTactical] : [],
    };
    setPresets((prev) => [newPreset, ...prev]);
    setPresetName("");
  };

  const ensureContactAllowed = () => {
    if (!allowConversation) return true;
    if (!contactName.trim()) return false;
    if (tier === "PRO") return true;
    const uniqueContacts = new Set(conversationEntries.map((entry) => entry.contact));
    if (!uniqueContacts.has(contactName) && uniqueContacts.size >= TIERS[tier].conversationMemory) {
      setUpgradeReason("feature_locked");
      return false;
    }
    return true;
  };

  const applyTone = (toneKey: ToneKey) => {
    if (!response) return;
    setActiveTone(toneKey);
    setActiveScenario(null);
    setActiveQuickAction(null);
    setActiveTactical(null);
    setActiveLabel(toneOptions.find((tone) => tone.key === toneKey)?.label || "Tone");
    setActiveRewrite(response.tone_versions[toneKey]);
  };

  const applyTactical = (key: TacticalKey) => {
    if (!response) return;
    setActiveTactical(key);
    setActiveScenario(null);
    setActiveQuickAction(null);
    setActiveLabel(tacticalOptions.find((item) => item.key === key)?.label || "Tactical");
    setActiveRewrite(response.tactical_enhancements[key]);
  };

  const applyScenario = (key: ScenarioKey) => {
    if (!response) return;
    if (!allowScenarios) {
      setUpgradeReason("feature_locked");
      return;
    }
    setActiveScenario(key);
    setActiveQuickAction(null);
    setActiveTactical(null);
    setActiveLabel(scenarioOptions.find((item) => item.key === key)?.label || "Scenario");
    setActiveRewrite(response.one_click_scenarios[key]);
  };

  const applyQuickAction = (key: QuickActionKey) => {
    if (!response) return;
    if (!allowQuickActions) {
      setUpgradeReason("feature_locked");
      return;
    }
    setActiveQuickAction(key);
    setActiveScenario(null);
    setActiveTactical(null);
    setActiveLabel(quickActionOptions.find((item) => item.key === key)?.label || "Action");
    setActiveRewrite(response.quick_actions[key]);
  };

  const copyToClipboard = async () => {
    if (!isAuthenticated) {
      openLoginPrompt();
      return;
    }
    if (!activeRewrite || !allowClipboard) {
      setUpgradeReason("feature_locked");
      return;
    }
    await navigator.clipboard.writeText(activeRewrite);
  };

  const runMessageCraft = async (mode: "logic" | "emotion") => {
    if (!isAuthenticated) {
      openLoginPrompt();
      return;
    }
    if (user && user.email_verified === false) {
      setError("Verify your email to use MessageCraft Pro.");
      return;
    }

    if (!input.trim()) {
      setError("Please enter a message.");
      return;
    }

    if (!canRun) {
      setUpgradeReason("limit_reached");
      return;
    }

    if (!ensureContactAllowed()) return;

    const preferredToneValue = mode === "logic" ? 80 : 25;
    setToneValue(preferredToneValue);
    setIsLoading(true);
    setError("");
    setBatchResults([]);

    try {
      if (batchMode && allowBatchMode) {
        const messages = input
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean);

        if (!messages.length) {
          setError("Add multiple lines for batch mode.");
          return;
        }

        if (Number.isFinite(remaining) && messages.length > remaining) {
          setUpgradeReason("limit_reached");
          return;
        }

        const results: Array<{ input: string; response: MessageCraftResponse }> = [];
        let latestMeta: MessageCraftResponse["meta"] | null = null;
        const entryTone = toneOptions[0].key;
        for (const message of messages) {
          const result = await fetchMessageCraft({
            text: message,
            audience_style: audienceStyle,
            tone_balance: preferredToneValue,
            user_goal: userGoal,
          });
          latestMeta = result.meta;
          results.push({ input: message, response: result });
        }

        setBatchResults(results);
        setResponse(results[results.length - 1]?.response || null);
        if (latestMeta) {
          updateUsage(latestMeta.count, latestMeta.reset_at);
        }
        if (latestMeta && tier === "FREE") {
          if (latestMeta.count >= TIERS.FREE.weeklyLimit) {
            setUpgradeReason("limit_reached");
          } else if (latestMeta.count === 3) {
            setUpgradeReason("result_moment");
          }
        }

        if (allowConversation && contactName.trim()) {
          try {
            for (const item of results) {
              await createConversationEntry({
                contact: contactName.trim(),
                input_text: item.input,
                output_text: item.response.tone_versions[entryTone],
                tone_key: entryTone,
                tone_scores: item.response.analysis.tone_scores,
                impact_prediction: item.response.usp.relationship_impact_prediction,
                clarity_before: item.response.usp.before_clarity_score,
                clarity_after: item.response.usp.after_clarity_score,
              });
            }
            await refreshConversations();
          } catch (err) {
            const message = err instanceof Error ? err.message : "Conversation save failed.";
            setError(message);
          }
        }
      } else {
        const result = await fetchMessageCraft({
          text: input.trim(),
          audience_style: audienceStyle,
          tone_balance: preferredToneValue,
          user_goal: userGoal,
        });
        setResponse(result);
        if (result.meta) {
          updateUsage(result.meta.count, result.meta.reset_at);
        }

        if (allowConversation && contactName.trim()) {
          try {
            const entryTone = toneOptions[0].key;
            await createConversationEntry({
              contact: contactName.trim(),
              input_text: input.trim(),
              output_text: result.tone_versions[entryTone],
              tone_key: entryTone,
              tone_scores: result.analysis.tone_scores,
              impact_prediction: result.usp.relationship_impact_prediction,
              clarity_before: result.usp.before_clarity_score,
              clarity_after: result.usp.after_clarity_score,
            });
            await refreshConversations();
          } catch (err) {
            const message = err instanceof Error ? err.message : "Conversation save failed.";
            setError(message);
          }
        }

        const nextCount = result.meta?.count ?? usage.count + 1;
        if (tier === "FREE" && nextCount >= TIERS.FREE.weeklyLimit) {
          setUpgradeReason("limit_reached");
        } else if (tier === "FREE" && nextCount === 3) {
          setUpgradeReason("result_moment");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      if (message.toLowerCase().includes("limit")) {
        setUpgradeReason("limit_reached");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (reason: UpgradeReason) => {
    setUpgradeReason(reason);
  };

  const openLoginPrompt = () => {
    setLoginPromptOpen(true);
  };

  const handlePlanSelect = async (plan: "STARTER" | "PRO") => {
    if (!isAuthenticated) {
      setError("Please sign in to change your plan.");
      return;
    }
    try {
      const result = await createDodoCheckoutLink(plan);
      window.location.href = result.checkout_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed.";
      setError(message);
    }
  };

  const handleModeSelect = (action: () => void) => {
    action();
    setModeMenuOpen(false);
  };

  const handleLockedMode = () => {
    setModeMenuOpen(false);
    handleUpgrade("feature_locked");
  };

  const toggleBatchMode = () => {
    if (!allowBatchMode) {
      setUpgradeReason("feature_locked");
      return;
    }
    setBatchMode((prev) => !prev);
  };

  const downloadReport = () => {
    if (!allowInsights) {
      setUpgradeReason("feature_locked");
      return;
    }
    if (!filteredEntries.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("MessageCraft Pro Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Contact: ${contactName}`, 14, 30);
    doc.text(`Health score: ${conversationSummary.healthScore}`, 14, 38);
    doc.text(`Trend: ${conversationSummary.trend}`, 14, 46);
    doc.text("Recent insights:", 14, 58);
    doc.text(conversationSummary.suggestion, 14, 66, { maxWidth: 180 });
    doc.save("messagecraft-report.pdf");
  };

  const handleResendVerification = async () => {
    if (!isAuthenticated) return;
    setVerificationError("");
    setVerificationNotice("");
    setVerificationLoading(true);
    try {
      await resendVerification();
      setVerificationNotice("Verification email sent. Check your inbox.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend verification.";
      setVerificationError(message);
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7]">
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow">
            <Wand2 className="h-5 w-5 text-[#d96a94]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3d3854]">MessageCraft Pro</p>
            <p className="text-xs text-[#9b96aa]">Communication optimization</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm text-[#7d7890]">
          <Link to="/pricing" className="hover:text-[#3d3854]">
            Pricing
          </Link>
          {isAuthenticated && (
            <Link to="/account" className="hover:text-[#3d3854]">
              Account
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9b96aa]">Hi, {user?.username}</span>
              <button
                onClick={signOut}
                className="rounded-full border border-[#e5e7eb] px-4 py-2 text-xs font-semibold text-[#7d7890]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-[#3d3854] px-4 py-2 text-xs font-semibold text-white"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={() => handleUpgrade("feature_locked")}
            className="rounded-full bg-[#3d3854] px-4 py-2 text-xs font-semibold text-white"
          >
            Upgrade
          </button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16">
        {isAuthenticated && user && user.email_verified === false && (
          <div className="rounded-2xl border border-[#f1d4df] bg-white/80 px-5 py-4 text-sm text-[#6f6a83] shadow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[#3d3854]">Verify your email to unlock the app.</p>
                <p className="text-xs text-[#9b96aa]">
                  We sent a verification link to {user.email || "your email"}.
                </p>
              </div>
              <button
                onClick={handleResendVerification}
                disabled={verificationLoading}
                className="rounded-full border border-[#e5e7eb] px-4 py-2 text-xs font-semibold text-[#7d7890]"
              >
                {verificationLoading ? "Sending..." : "Resend email"}
              </button>
            </div>
            {verificationNotice ? (
              <p className="mt-2 text-xs text-[#6bb38b]">{verificationNotice}</p>
            ) : null}
            {verificationError ? (
              <p className="mt-2 text-xs text-[#b9586b]">{verificationError}</p>
            ) : null}
          </div>
        )}
        {isAuthenticated ? (
          <UsageBanner
            used={usage.count}
            limit={TIERS[tier].weeklyLimit}
            resetAt={usage.resetAt}
            notice={usageNotice || undefined}
            periodLabel={tier === "FREE" ? "today" : "this week"}
            onUpgrade={() => handleUpgrade("limit_reached")}
          />
        ) : (
          <div className="rounded-2xl bg-white/70 px-5 py-3 text-sm text-[#6f6a83] shadow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>Sign in to unlock your daily free translation.</span>
              <Link
                to="/auth"
                className="rounded-full bg-[#3d3854] px-4 py-2 text-xs font-semibold text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}

        <section className="flex flex-col items-center justify-center px-4 py-6 text-center">
          <div className="flex gap-4 mb-10">
            <button className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <Heart className="w-6 h-6 text-[#ec6b95]" />
            </button>
            <button className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <MessageCircle className="w-6 h-6 text-[#b999d4]" />
            </button>
            <button className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="w-6 h-6 text-[#6bb3d9]" />
            </button>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-[#3d3854] mb-4">
            MessageCraft Pro
          </h1>
          <p className="text-lg text-[#7d7890] max-w-2xl leading-relaxed">
            Transform any message into the perfect version for its context. Instant tone
            optimization, smart analysis, and real-world communication strategy.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#9b96aa] font-medium">Tone Meter</span>
                <span className="text-sm text-[#9b96aa] font-medium">Neutral</span>
              </div>
              <div className="relative mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toneValue}
                  onChange={(e) => setToneValue(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer tone-slider"
                  style={{
                    background: `linear-gradient(to right, #e77ba0 0%, #7ba0d9 ${toneValue}%, #cbd5e1 ${toneValue}%, #cbd5e1 100%)`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#ec6b95]" />
                  <span className="text-sm text-[#9b96aa]">Emotional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#f0b347]" />
                  <span className="text-sm text-[#9b96aa]">Logical</span>
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✍️</span>
                  <h2 className="text-lg font-semibold text-[#4a4561]">Your Message</h2>
                </div>
                <textarea
                  value={displayInputValue}
                  onChange={(e) => {
                    if (!isAuthenticated) {
                      openLoginPrompt();
                      return;
                    }
                    setInput(e.target.value);
                  }}
                  onFocus={() => {
                    if (!isAuthenticated) {
                      openLoginPrompt();
                    }
                  }}
                  readOnly={!isAuthenticated}
                  placeholder="Paste or type your message..."
                  className="w-full h-36 p-4 bg-[#fafbfc] rounded-xl border border-[#e5e7eb] resize-none focus:outline-none focus:ring-2 focus:ring-[#d96a94]/30 text-[#4a4561] placeholder:text-[#b5b2c3]"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {EXAMPLE_MESSAGES.map((example) => (
                    <button
                      key={example}
                      onClick={() => setInput(example)}
                      className="text-xs text-[#5e78a8] hover:text-[#4a5f88] hover:underline"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <h2 className="text-lg font-semibold text-[#4a4561]">Optimized Output</h2>
                  </div>
                  {allowClipboard && (
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 text-xs text-[#7d7890] hover:text-[#3d3854]"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  )}
                </div>
                <div
                  className="w-full min-h-[144px] p-4 bg-[#fafbfc] rounded-xl border border-[#e5e7eb]"
                  onClick={() => {
                    if (!isAuthenticated) {
                      openLoginPrompt();
                    }
                  }}
                >
                  {displayOutputValue ? (
                    <p className="text-[#7d7890]">{displayOutputValue}</p>
                  ) : (
                    <p className="text-[#b5b2c3] italic">
                      Your optimized message will appear here.
                    </p>
                  )}
                  {tier === "FREE" && displayOutputValue && (
                    <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#d1c8e3]">
                      Crafted with MessageCraft
                    </p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#9b96aa]">
                  <span>Active mode</span>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={!response}
                      onClick={() => setModeMenuOpen((prev) => !prev)}
                      className={classNames(
                        "flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
                        response
                          ? "border-[#e5e7eb] bg-white text-[#6f6a83]"
                          : "border-[#f0eef5] bg-[#faf9fc] text-[#c2bccf]",
                      )}
                    >
                      {displayActiveLabel}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {modeMenuOpen && response ? (
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#e5e7eb] bg-white p-3 text-xs text-[#6f6a83] shadow-xl z-10">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#b2a8c6]">
                          Tone versions
                        </p>
                        <div className="mt-2 space-y-1">
                          {toneOptions.map((tone, index) => {
                            const locked = index + 1 > toneLimit;
                            return (
                              <button
                                key={tone.key}
                                type="button"
                                onClick={() =>
                                  locked
                                    ? handleLockedMode()
                                    : handleModeSelect(() => applyTone(tone.key))
                                }
                                className={classNames(
                                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left",
                                  locked
                                    ? "text-[#c2bccf]"
                                    : "hover:bg-[#f8f4fb] text-[#6f6a83]",
                                )}
                              >
                                <span>{tone.label}</span>
                                {locked && (
                                  <span className="flex items-center gap-1 text-[11px] text-[#d66c92]">
                                    <Lock className="h-3 w-3" /> {lockedLabel}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[#b2a8c6]">
                          Tactical enhancements
                        </p>
                        <div className="mt-2 space-y-1">
                          {tacticalOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => handleModeSelect(() => applyTactical(option.key))}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[#6f6a83] hover:bg-[#f8f4fb]"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>

                        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[#b2a8c6]">
                          Quick actions
                        </p>
                        <div className="mt-2 space-y-1">
                          {quickActionOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() =>
                                allowQuickActions
                                  ? handleModeSelect(() => applyQuickAction(option.key))
                                  : handleLockedMode()
                              }
                              className={classNames(
                                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left",
                                allowQuickActions
                                  ? "hover:bg-[#f8f4fb] text-[#6f6a83]"
                                  : "text-[#c2bccf]",
                              )}
                            >
                              <span>{option.label}</span>
                              {!allowQuickActions && (
                                <span className="flex items-center gap-1 text-[11px] text-[#d66c92]">
                                  <Lock className="h-3 w-3" /> {lockedLabel}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[#b2a8c6]">
                          One-click scenarios
                        </p>
                        <div className="mt-2 space-y-1">
                          {scenarioOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() =>
                                allowScenarios
                                  ? handleModeSelect(() => applyScenario(option.key))
                                  : handleLockedMode()
                              }
                              className={classNames(
                                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left",
                                allowScenarios
                                  ? "hover:bg-[#f8f4fb] text-[#6f6a83]"
                                  : "text-[#c2bccf]",
                              )}
                            >
                              <span>{option.label}</span>
                              {!allowScenarios && (
                                <span className="flex items-center gap-1 text-[11px] text-[#d66c92]">
                                  <Lock className="h-3 w-3" /> {lockedLabel}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => runMessageCraft("logic")}
                disabled={isLoading}
                className={classNames(
                  "bg-gradient-to-r from-[#6bb3d9] to-[#5ea3cc] hover:from-[#7bc3e9] hover:to-[#6eb3dc] text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2",
                  (!isAuthenticated || !canRun || isLoading) && "opacity-60",
                )}
              >
                <Lightbulb className="w-5 h-5" />
                <span className="font-medium">Make it clearer</span>
              </button>
              <button
                onClick={() => runMessageCraft("emotion")}
                disabled={isLoading}
                className={classNames(
                  "bg-gradient-to-r from-[#e77ba0] to-[#d96a94] hover:from-[#e98bb0] hover:to-[#e17aa4] text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2",
                  (!isAuthenticated || !canRun || isLoading) && "opacity-60",
                )}
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">Make it warmer</span>
              </button>
            </div>
            <p className="text-center text-xs text-[#9b96aa]">
              Clear = direct, structured. Warm = empathetic, softer tone.
            </p>
            {isLoading ? (
              <p className="text-center text-sm text-[#7d7890]">Crafting your response...</p>
            ) : null}
            {error ? <p className="text-center text-sm text-[#b9586b]">{error}</p> : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white/80 p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-[#4a4561]">Context Settings</h3>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                Audience style
              </label>
              <select
                value={audienceStyle}
                onChange={(event) => setAudienceStyle(event.target.value)}
                className="mt-2 w-full rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm text-[#4a4561]"
              >
                {audienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                Primary goal
              </label>
              <select
                value={userGoal}
                onChange={(event) => setUserGoal(event.target.value)}
                className="mt-2 w-full rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm text-[#4a4561]"
              >
                {goalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                Who is this for?
              </label>
              <input
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                placeholder="Partner, manager, client..."
                className="mt-2 w-full rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm text-[#4a4561]"
              />
              <p className="mt-2 text-xs text-[#9b96aa]">
                Used to track tone patterns and conversation health for that person.
              </p>

              {contacts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {contacts.map((contact) => (
                    <button
                      key={contact}
                      onClick={() => setContactName(contact)}
                      className="rounded-full bg-[#f3f0fb] px-3 py-1 text-xs text-[#7d7890]"
                    >
                      {contact}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                  Batch mode
                </span>
                <button
                  onClick={toggleBatchMode}
                  className={classNames(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    batchMode ? "bg-[#3d3854] text-white" : "bg-[#f3f0fb] text-[#7d7890]",
                  )}
                >
                  {batchMode ? "On" : "Off"}
                </button>
              </div>
              {!allowBatchMode && (
                <p className="mt-2 text-xs text-[#b2a8c6]">
                  Batch mode is a Pro feature.
                </p>
              )}

              <div className="mt-6 rounded-xl bg-[#f8f4fb] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                    Tone presets
                  </p>
                  {!allowPresets && (
                    <span className="flex items-center gap-1 text-xs text-[#d66c92]">
                      <Lock className="h-3 w-3" /> Pro
                    </span>
                  )}
                </div>
                <select
                  value={selectedPreset}
                  onChange={(event) => handlePresetSelect(event.target.value)}
                  className="mt-3 w-full rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-xs text-[#4a4561]"
                >
                  <option value="">Select a preset</option>
                  {presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex gap-2">
                  <input
                    value={presetName}
                    onChange={(event) => setPresetName(event.target.value)}
                    placeholder="Save current settings"
                    className="w-full rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-xs text-[#4a4561]"
                  />
                  <button
                    onClick={handleSavePreset}
                    className="rounded-full bg-[#3d3854] px-3 py-2 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-[#4a4561]">Conversation Health</h3>
              <p className="mt-1 text-xs text-[#9b96aa]">
                {allowConversation
                  ? conversationSummary.suggestion
                  : "Upgrade to unlock conversation memory."}
              </p>
              {allowConversation && filteredEntries.length > 0 ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[#7d7890]">
                    <span>Health score</span>
                    <span>{conversationSummary.healthScore}/100</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#f0eef5]">
                    <div
                      className="h-2 rounded-full bg-[#7ba0d9]"
                      style={{ width: `${conversationSummary.healthScore}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-[#7d7890]">
                    Trend: {conversationSummary.trend}
                  </p>
                  {allowInsights ? (
                    <div className="mt-4 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={filteredEntries
                            .slice(0, 8)
                            .reverse()
                            .map((entry, index) => ({
                              name: index + 1,
                              clarity: entry.clarityScore,
                            }))}
                        >
                          <XAxis dataKey="name" hide />
                          <Tooltip
                            contentStyle={{
                              background: "#ffffff",
                              borderRadius: "12px",
                              border: "1px solid #e5e7eb",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="clarity"
                            stroke="#7ba0d9"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-[#b2a8c6]">
                      Upgrade to Pro for detailed dashboards.
                    </p>
                  )}
                  {allowInsights ? (
                    <button
                      onClick={downloadReport}
                      className="mt-4 w-full rounded-full border border-[#e5e7eb] px-3 py-2 text-xs text-[#7d7890]"
                    >
                      Download report (PDF)
                    </button>
                  ) : null}
                </div>
              ) : null}
              {!allowConversation && (
                <button
                  onClick={() => handleUpgrade("feature_locked")}
                  className="mt-4 w-full rounded-full border border-[#e5e7eb] px-3 py-2 text-xs text-[#7d7890]"
                >
                  Unlock memory
                </button>
              )}
            </div>
          </div>
        </section>

        {batchResults.length > 0 && (
          <section className="rounded-2xl bg-white/80 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#4a4561]">Batch Results</h3>
            <div className="mt-4 space-y-4">
              {batchResults.map((result, index) => (
                <div key={index} className="rounded-xl border border-[#e5e7eb] p-4">
                  <p className="text-xs font-semibold text-[#9b96aa]">Original</p>
                  <p className="text-sm text-[#4a4561]">{result.input}</p>
                  <p className="mt-2 text-xs font-semibold text-[#9b96aa]">Professional</p>
                  <p className="text-sm text-[#7d7890]">
                    {result.response.tone_versions.professional_formal}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {response && (
          <section className="rounded-3xl bg-white/80 p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#3d3854]">
                  MessageCraft Intelligence
                </h2>
                <p className="text-sm text-[#7d7890]">
                  Context: {response.context.detected_type} ({
                    Math.round(response.context.confidence * 100)
                  }
                  %)
                </p>
                <p className="mt-1 text-xs text-[#9b96aa]">{response.context.rationale}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#f8f4fb] px-4 py-2 text-xs text-[#7d7890]">
                  Positive response: {response.usp.relationship_impact_prediction}%
                </span>
                <span className="rounded-full bg-[#f8f4fb] px-4 py-2 text-xs text-[#7d7890]">
                  Clarity {response.usp.before_clarity_score} to {response.usp.after_clarity_score}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {toneOptions.map((tone, index) => {
                const locked = index + 1 > toneLimit;
                return (
                  <button
                    key={tone.key}
                    onClick={() => (locked ? handleUpgrade("feature_locked") : applyTone(tone.key))}
                    className={classNames(
                      "rounded-2xl border p-4 text-left transition",
                      locked
                        ? "border-[#f0eef5] bg-[#faf9fc] text-[#c2bccf]"
                        : "border-[#e5e7eb] bg-white hover:shadow-md",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{tone.label}</h3>
                      {locked && (
                        <span className="flex items-center gap-1 text-xs text-[#d66c92]">
                          <Lock className="h-3 w-3" /> {lockedLabel}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs">{tone.description}</p>
                    {!locked && (
                      <p className="mt-3 text-xs text-[#7d7890]">
                        {response.tone_versions[tone.key]}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#4a4561]">Tone analysis</h3>
                  <p className="mt-1 text-xs text-[#7d7890]">
                    {allowFullAnalysis ? response.analysis.tone_summary : "Basic tone analysis."}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#7d7890]">
                    {Object.entries(response.analysis.tone_scores).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{key}</span>
                          <span>{value}/100</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-[#f0eef5]">
                          <div
                            className="h-2 rounded-full bg-[#6bb3d9]"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#7d7890]">
                    <span className="rounded-full bg-[#f8f4fb] px-3 py-1">
                      Power: {POWER_LABELS[response.analysis.power_dynamics] || response.analysis.power_dynamics}
                    </span>
                    <span className="rounded-full bg-[#f8f4fb] px-3 py-1">
                      Urgency: {response.analysis.urgency}
                    </span>
                    <span className="rounded-full bg-[#f8f4fb] px-3 py-1">
                      Culture: {response.usp.cultural_style}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#7d7890]">
                    {response.analysis.framework_tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#e5e7eb] px-3 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#7d7890]">{response.usp.generation_notes}</p>
                </div>

                <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#4a4561]">Misinterpretation risks</h3>
                  {allowFullAnalysis ? (
                    <ul className="mt-2 space-y-2 text-xs text-[#7d7890]">
                      {response.analysis.misinterpretation_warnings.length ? (
                        response.analysis.misinterpretation_warnings.map((warning, index) => (
                          <li key={index}>- {warning}</li>
                        ))
                      ) : (
                        <li>No major risks detected.</li>
                      )}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-[#b2a8c6]">
                      Upgrade to unlock misinterpretation warnings.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#4a4561]">Tactical enhancements</h3>
                  <div className="mt-3 grid gap-2">
                    {tacticalOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => applyTactical(option.key)}
                        className={classNames(
                          "rounded-full border px-4 py-2 text-left text-xs",
                          activeTactical === option.key
                            ? "border-[#d96a94] bg-[#ffe2eb] text-[#7a3652]"
                            : "border-[#e5e7eb] text-[#7d7890]",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#4a4561]">Quick actions</h3>
                  {allowQuickActions ? (
                    <div className="mt-3 grid gap-2">
                      {quickActionOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => applyQuickAction(option.key)}
                          className={classNames(
                            "rounded-full border px-4 py-2 text-left text-xs",
                            activeQuickAction === option.key
                              ? "border-[#6bb3d9] bg-[#d9ebf6] text-[#35546b]"
                              : "border-[#e5e7eb] text-[#7d7890]",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[#b2a8c6]">
                      Upgrade to unlock quick actions.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                <h3 className="text-sm font-semibold text-[#4a4561]">Red flag scan</h3>
                {allowRedFlags ? (
                  <div className="mt-2 text-xs text-[#7d7890]">
                    <p>Manipulative patterns: {response.red_flags.manipulative_patterns.join(", ") || "None"}</p>
                    <p>Defensive phrases: {response.red_flags.defensive_phrases.join(", ") || "None"}</p>
                    <p>Assumptions: {response.red_flags.assumptions.join(", ") || "None"}</p>
                    <p>
                      Escalation triggers: {response.red_flags.escalation_triggers.join(", ") || "None"}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-[#b2a8c6]">
                    Upgrade to unlock red-flag detection.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                <h3 className="text-sm font-semibold text-[#4a4561]">One-click scenarios</h3>
                {allowScenarios ? (
                  <div className="mt-3 grid gap-2">
                    {scenarioOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => applyScenario(option.key)}
                        className={classNames(
                          "rounded-full border px-4 py-2 text-left text-xs",
                          activeScenario === option.key
                            ? "border-[#a28ad7] bg-[#ece5fb] text-[#4b3a77]"
                            : "border-[#e5e7eb] text-[#7d7890]",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-[#b2a8c6]">
                    Upgrade to unlock one-click scenarios.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-4">
              <h3 className="text-sm font-semibold text-[#4a4561]">Why this works</h3>
              <ul className="mt-2 space-y-2 text-xs text-[#7d7890]">
                {response.explanations.why_it_works.map((item, index) => (
                  <li key={index}>- {item}</li>
                ))}
              </ul>
              <h4 className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#9b96aa]">
                Changes applied
              </h4>
              <ul className="mt-2 space-y-2 text-xs text-[#7d7890]">
                {response.explanations.change_log.map((item, index) => (
                  <li key={index}>- {item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      {loginPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-[#3d3854]">Sign in to unlock MessageCraft</h2>
            <p className="mt-2 text-sm text-[#7d7890]">
              Create a free account to use your daily translation and save conversation history.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-full bg-[#3d3854] px-5 py-2 text-sm font-semibold text-white"
              >
                Sign in / Create account
              </Link>
              <button
                onClick={() => setLoginPromptOpen(false)}
                className="rounded-full border border-[#e5e7eb] px-5 py-2 text-sm font-semibold text-[#7d7890]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        open={upgradeReason !== null}
        reason={upgradeReason || "feature_locked"}
        currentTier={tier}
        billingCycle={billingCycle}
        onClose={() => setUpgradeReason(null)}
        onSelectPlan={handlePlanSelect}
      />

      <style>{`
        .tone-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          border: 3px solid #7ba0d9;
        }

        .tone-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          border: 3px solid #7ba0d9;
        }
      `}</style>
    </div>
  );
}
