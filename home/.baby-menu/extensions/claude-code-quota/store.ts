// Non-component module: the quota store, the bridge call, and pure formatters.
// Keeping these out of components.tsx lets the UI Fast Refresh in place.

const EXTENSION_ID = "claude-code-quota";

export type QuotaWindow = {
  id: "five_hour" | "seven_day" | "seven_day_sonnet" | "seven_day_opus" | "seven_day_scoped" | "extra_usage";
  label: string;
  percentUsed?: number;
  resetText?: string;
  resetAt?: string;
  spentUsd?: number;
  limitUsd?: number;
};

export type ClaudeQuotaSnapshot = {
  source: "oauth" | "cli";
  plan?: string;
  windows: QuotaWindow[];
  claudeCodeSharePercent?: number;
  refreshedAt: string;
  stale: boolean;
};

type QuotaResult =
  | { ok: true; data: ClaudeQuotaSnapshot }
  | { ok: false; error: string; sourceTried: string[] };

export type QuotaState = {
  snapshot: ClaudeQuotaSnapshot | null;
  error: string | null;
  loading: boolean;
};

let state: QuotaState = { snapshot: null, error: null, loading: false };
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getQuotaState(): QuotaState {
  return state;
}

function setState(patch: Partial<QuotaState>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

export async function refreshQuota(force = false): Promise<void> {
  if (state.loading) return;
  setState({ loading: true });
  try {
    const result = await window.babyMenu?.capabilities.invoke<QuotaResult>(EXTENSION_ID, "getQuota", { force });
    if (!result) throw new Error("Claude quota unavailable");
    if (result.ok) {
      setState({ snapshot: result.data, error: null, loading: false });
    } else if (result.error === "Claude sign-in required") {
      // Sign-out must be visible; a remembered number would hide it.
      setState({ snapshot: null, error: result.error, loading: false });
    } else {
      // Keep whatever is already on screen, visibly stale.
      setState({
        snapshot: state.snapshot ? { ...state.snapshot, stale: true } : null,
        error: result.error,
        loading: false,
      });
    }
  } catch (error) {
    setState({
      snapshot: state.snapshot ? { ...state.snapshot, stale: true } : null,
      error: error instanceof Error ? error.message : "Claude quota unavailable",
      loading: false,
    });
  }
}

export function weeklyWindow(snapshot: ClaudeQuotaSnapshot): QuotaWindow | undefined {
  return snapshot.windows.find((w) => w.id === "seven_day" && w.percentUsed !== undefined);
}

export function secondaryWindows(snapshot: ClaudeQuotaSnapshot): QuotaWindow[] {
  const order = ["seven_day_scoped", "seven_day_opus", "seven_day_sonnet", "five_hour", "extra_usage"];
  return snapshot.windows
    .filter((w) => w.id !== "seven_day" && w.percentUsed !== undefined)
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

export type Tone = "live" | "warn" | "danger";

export function toneFor(percentUsed: number): Tone {
  if (percentUsed >= 90) return "danger";
  if (percentUsed >= 75) return "warn";
  return "live";
}

const TONE_TEXT: Record<Tone, string> = {
  live: "text-ink-strong",
  warn: "text-signal-warn",
  danger: "text-signal-danger",
};

export function toneTextClass(tone: Tone): string {
  return TONE_TEXT[tone];
}

export function formatPercent(value: number): string {
  return String(Math.round(value));
}

function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

// OAuth gives a timestamp; the CLI gives its own already-localized text.
export function formatReset(window: QuotaWindow, now = Date.now()): string | null {
  if (window.resetAt) {
    const at = new Date(window.resetAt);
    const remaining = at.getTime() - now;
    if (remaining <= 0) return "resetting now";
    const clock = at
      .toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })
      .toLowerCase();
    return `resets in ${formatDuration(remaining)} · ${clock}`;
  }
  if (window.resetText) return `resets ${window.resetText.replace(/\s*\([^)]*\)$/, "").toLowerCase()}`;
  return null;
}

export function formatUpdated(iso: string, now = Date.now()): string {
  const ms = now - Date.parse(iso);
  return ms < 60_000 ? "just now" : `${formatDuration(ms)} ago`;
}
