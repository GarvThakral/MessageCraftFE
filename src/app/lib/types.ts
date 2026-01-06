export type Tier = "FREE" | "STARTER" | "PRO";

export type ToneKey =
  | "professional_formal"
  | "empathetic_warm"
  | "direct_assertive"
  | "diplomatic_tactful"
  | "casual_friendly";

export type TacticalKey =
  | "add_emotional_validation"
  | "remove_emotional_validation"
  | "include_action_items"
  | "exclude_action_items"
  | "add_softeners"
  | "add_strengtheners"
  | "insert_boundaries"
  | "frame_as_question"
  | "frame_as_statement";

export type ScenarioKey =
  | "boundary_setting"
  | "clarifying_question"
  | "accountability_without_blame"
  | "collaborative_proposal"
  | "non_defensive_response";

export type QuickActionKey =
  | "condense"
  | "expand"
  | "cool_down"
  | "add_assertiveness";

export interface MessageCraftRequest {
  text: string;
  audience_style?: string;
  tone_balance?: number;
  user_goal?: string;
}

export interface MessageCraftResponse {
  context: {
    detected_type: string;
    confidence: number;
    rationale: string;
  };
  tone_versions: Record<ToneKey, string>;
  analysis: {
    tone_scores: {
      emotion: number;
      formality: number;
      assertiveness: number;
      clarity: number;
    };
    tone_summary: string;
    misinterpretation_warnings: string[];
    power_dynamics: string;
    urgency: string;
    framework_tags: string[];
  };
  tactical_enhancements: Record<TacticalKey, string>;
  red_flags: {
    manipulative_patterns: string[];
    defensive_phrases: string[];
    assumptions: string[];
    escalation_triggers: string[];
  };
  one_click_scenarios: Record<ScenarioKey, string>;
  quick_actions: Record<QuickActionKey, string>;
  usp: {
    before_clarity_score: number;
    after_clarity_score: number;
    relationship_impact_prediction: number;
    cultural_style: string;
    generation_notes: string;
  };
  explanations: {
    why_it_works: string[];
    change_log: string[];
  };
}

export interface UsageState {
  count: number;
  resetAt: string;
}

export interface ConversationEntry {
  id: string;
  contact: string;
  timestamp: number;
  tone: ToneKey;
  toneScores: MessageCraftResponse["analysis"]["tone_scores"];
  impactPrediction: number;
  clarityScore: number;
}

export interface ConversationSummary {
  healthScore: number;
  suggestion: string;
  avgScores: MessageCraftResponse["analysis"]["tone_scores"];
  trend: "improving" | "steady" | "declining";
}

export interface Preset {
  id: string;
  name: string;
  audienceStyle: string;
  preferredTone: ToneKey;
  toneBalance: number;
  toggles: TacticalKey[];
}
