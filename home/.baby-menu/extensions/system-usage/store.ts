// Everything in this module is deliberately NOT a React component: the store,
// the fetch, and the pure format helpers. Keeping them out of components.tsx is
// what lets that file Fast Refresh in place while you iterate on the UI.

const EXTENSION_ID = "system-usage";
const HISTORY_LIMIT = 48;

export type CpuReading = {
  percent: number | null;
  stale: boolean;
  cores: number;
  model: string;
};

export type MemoryReading = {
  percent: number;
  usedBytes: number;
  totalBytes: number;
  appBytes: number;
  wiredBytes: number;
  compressedBytes: number;
};

export type UsageSample = {
  at: number;
  cpu: CpuReading;
  memory: MemoryReading;
};

export type UsageState = {
  sample: UsageSample | null;
  cpuHistory: number[];
  memoryHistory: number[];
  error: string | null;
};

let state: UsageState = { sample: null, cpuHistory: [], memoryHistory: [], error: null };
let inFlight = false;

const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUsageState(): UsageState {
  return state;
}

function setState(next: UsageState): void {
  state = next;
  for (const listener of listeners) listener();
}

function appendHistory(history: number[], value: number): number[] {
  return [...history, value].slice(-HISTORY_LIMIT);
}

export async function refreshUsage(): Promise<void> {
  // The host owns the refresh cadence; this guard only keeps a slow sample from
  // overlapping the next tick.
  if (inFlight) return;
  inFlight = true;
  try {
    const sample = await window.babyMenu?.capabilities.invoke<UsageSample>(
      EXTENSION_ID,
      "sample",
    );
    if (!sample) throw new Error("bridge unavailable");
    setState({
      sample,
      // A warming-up cpu reading has no number yet, so it contributes no point
      // rather than a fake zero that would dent the sparkline.
      cpuHistory:
        sample.cpu.percent === null || sample.cpu.stale
          ? state.cpuHistory
          : appendHistory(state.cpuHistory, sample.cpu.percent),
      memoryHistory: appendHistory(state.memoryHistory, sample.memory.percent),
      error: null,
    });
  } catch (error) {
    // Keep the last good sample on screen and let the view mark it stale.
    setState({ ...state, error: error instanceof Error ? error.message : "sample failed" });
  } finally {
    inFlight = false;
  }
}

export type Tone = "live" | "warn" | "danger";

export function toneFor(percent: number): Tone {
  if (percent >= 90) return "danger";
  if (percent >= 70) return "warn";
  return "live";
}

// Complete class strings only, so the Tailwind scan can find them.
const TONE_TEXT: Record<Tone, string> = {
  live: "text-ink-strong",
  warn: "text-signal-warn",
  danger: "text-signal-danger",
};

export function toneTextClass(tone: Tone): string {
  return TONE_TEXT[tone];
}

export function formatPercent(percent: number): string {
  return percent >= 99.5 ? "100" : percent.toFixed(percent < 10 ? 1 : 0);
}

export function formatGiB(bytes: number): string {
  const gib = bytes / 1024 ** 3;
  return `${gib >= 10 ? Math.round(gib) : gib.toFixed(1)}g`;
}
