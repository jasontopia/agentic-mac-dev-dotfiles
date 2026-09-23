import { useSyncExternalStore } from "react";
import { Progress, Sparkline, StatusDot } from "@babymenu/ui";

import {
  formatGiB,
  formatPercent,
  getUsageState,
  subscribe,
  toneFor,
  toneTextClass,
} from "./store";

// Components only in this module so Fast Refresh can hot-swap the UI in place.

function MetricLabel({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-baseline justify-between text-xxs uppercase tracking-caps text-ink-label">
      <span>{label}</span>
      <span className="truncate pl-2 text-ink-soft">{detail}</span>
    </div>
  );
}

function Metric({
  label,
  detail,
  percent,
  history,
  pending,
}: {
  label: string;
  detail: string;
  percent: number | null;
  history: number[];
  pending: boolean;
}) {
  const tone = percent === null ? "live" : toneFor(percent);

  return (
    <div className="flex flex-col gap-2">
      <MetricLabel label={label} detail={detail} />
      <div className="flex items-baseline gap-2">
        {percent === null ? (
          <span className="text-3xl font-light tracking-value text-ink-soft">--</span>
        ) : (
          <span
            className={`text-3xl font-light tracking-value ${toneTextClass(tone)} ${
              pending ? "opacity-50" : ""
            }`}
          >
            {formatPercent(percent)}
            <span className="ml-0.5 text-sm text-ink-soft">%</span>
          </span>
        )}
      </div>
      <Progress value={percent ?? 0} tone={tone} />
      <div className="h-[22px]">
        {history.length > 1 ? (
          <Sparkline data={history} width={228} height={22} tone="live" area />
        ) : null}
      </div>
    </div>
  );
}

export function SystemUsageView() {
  const state = useSyncExternalStore(subscribe, getUsageState);
  const { sample, error } = state;

  if (!sample) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xxs uppercase tracking-caps text-ink-label">system usage</span>
        <span className="text-md text-ink-muted">
          {error ? `unavailable - ${error}` : "sampling..."}
        </span>
      </div>
    );
  }

  const { cpu, memory } = sample;
  // The first tick after launch, a code edit, or a long-closed popover has no
  // usable tick baseline yet; say so instead of showing a confident wrong number.
  const cpuPending = cpu.stale || cpu.percent === null;
  const degraded = Boolean(error) || cpuPending;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xxs uppercase tracking-caps text-ink-label">system usage</span>
        <span
          className={`flex items-center gap-1.5 text-xxs uppercase tracking-caps ${
            degraded ? "text-ink-soft" : "text-signal-live"
          }`}
        >
          <StatusDot tone={degraded ? "muted" : "live"} pulse={!degraded} />
          {error ? "stale" : cpuPending ? "warming up" : "live"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Metric
          label="cpu"
          detail={`${cpu.cores} cores`}
          percent={cpu.percent}
          history={state.cpuHistory}
          pending={cpuPending}
        />
        <Metric
          label="memory"
          detail={`${formatGiB(memory.usedBytes)} / ${formatGiB(memory.totalBytes)}`}
          percent={memory.percent}
          history={state.memoryHistory}
          pending={Boolean(error)}
        />
      </div>

      <div className="flex items-center justify-between border-t border-line-faint pt-2 text-xxs uppercase tracking-caps text-ink-label">
        <span className="truncate">{cpu.model}</span>
        <span className="shrink-0 pl-2">
          app {formatGiB(memory.appBytes)} · wired {formatGiB(memory.wiredBytes)} · comp{" "}
          {formatGiB(memory.compressedBytes)}
        </span>
      </div>
    </div>
  );
}
