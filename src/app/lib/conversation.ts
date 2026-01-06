import type {
  ConversationEntry,
  ConversationSummary,
  MessageCraftResponse,
  ToneKey,
} from "./types";
import { readHistory, writeHistory } from "./storage";

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function addConversationEntry(entry: ConversationEntry): void {
  const history = readHistory();
  history.unshift(entry);
  writeHistory(history.slice(0, 200));
}

export function getConversationEntries(contact?: string): ConversationEntry[] {
  const history = readHistory();
  if (!contact) return history;
  return history.filter((entry) => entry.contact === contact);
}

export function buildSummary(entries: ConversationEntry[]): ConversationSummary {
  if (!entries.length) {
    return {
      healthScore: 0,
      suggestion: "Start a conversation to see insights.",
      avgScores: { emotion: 0, formality: 0, assertiveness: 0, clarity: 0 },
      trend: "steady",
    };
  }

  const emotions = entries.map((entry) => entry.toneScores.emotion);
  const formality = entries.map((entry) => entry.toneScores.formality);
  const assertiveness = entries.map((entry) => entry.toneScores.assertiveness);
  const clarity = entries.map((entry) => entry.toneScores.clarity);

  const avgScores = {
    emotion: Math.round(average(emotions)),
    formality: Math.round(average(formality)),
    assertiveness: Math.round(average(assertiveness)),
    clarity: Math.round(average(clarity)),
  };

  const healthScore = Math.round(
    average(entries.map((entry) => (entry.clarityScore + entry.impactPrediction) / 2)),
  );

  let suggestion = "Your balance looks healthy. Keep it steady.";
  if (avgScores.assertiveness < 35) {
    suggestion = "You tend to be apologetic with this person - try being more direct.";
  } else if (avgScores.emotion < 35) {
    suggestion = "You lean analytical here. Add a warmer opener for connection.";
  } else if (avgScores.emotion > 70 && avgScores.clarity < 50) {
    suggestion = "High emotion, low clarity. Try naming one clear request.";
  }

  const latest = entries.slice(0, 5).map((entry) => entry.clarityScore);
  const previous = entries.slice(5, 10).map((entry) => entry.clarityScore);
  const previousAvg = previous.length ? average(previous) : average(latest);
  const trendValue = average(latest) - previousAvg;

  const trend: ConversationSummary["trend"] =
    trendValue > 4 ? "improving" : trendValue < -4 ? "declining" : "steady";

  return { healthScore, suggestion, avgScores, trend };
}

export function createEntry(
  response: MessageCraftResponse,
  contact: string,
  tone: ToneKey,
): ConversationEntry {
  return {
    id: crypto.randomUUID(),
    contact,
    timestamp: Date.now(),
    tone,
    toneScores: response.analysis.tone_scores,
    impactPrediction: response.usp.relationship_impact_prediction,
    clarityScore: response.usp.after_clarity_score,
  };
}
