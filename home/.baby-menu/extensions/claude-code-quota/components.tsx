import { useSyncExternalStore } from "react";
import { Badge, Button, Progress, StatusDot } from "@babymenu/ui";

import {
  formatPercent,
  formatReset,
  formatUpdated,
  getQuotaState,
  refreshQuota,
  secondaryWindows,
  subscribe,
  toneFor,
  toneTextClass,
  weeklyWindow,
  type QuotaWindow,
} from "./store";

// Components only in this module so Fast Refresh can hot-swap the UI in place.

function Header({ plan, status }: { plan?: string; status: "live" | "stale" | "error" | "loading" }) {
  return (
    <div className="flex items-center justify-between text-xxs uppercase tracking-caps text-ink-label">
      <span>claude code · weekly</span>
      <span className="flex items-center gap-2">
        {plan ? <Badge tone="neutral">{plan}</Badge> : null}
        {status === "live" ? (
          <span className="flex items-center gap-1.5 text-signal-live">
            <StatusDot tone="live" /> live
          </span>
        ) : status === "stale" ? (
          <span className="flex items-center gap-1.5 text-signal-warn">
            <StatusDot tone="warn" /> stale
          </span>
        ) : status === "loading" ? (
          <span className="flex items-center gap-1.5 text-ink-soft">
            <StatusDot tone="muted" pulse /> syncing
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-signal-danger">
            <StatusDot tone="danger" /> error
          </span>
        )}
      </span>
    </div>
  );
}

function SecondaryRow({ window }: { window: QuotaWindow }) {
  const used = window.percentUsed ?? 0;
  const tone = toneFor(used);
  const reset = formatReset(window);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-ink">{window.label}</span>
        <span className={`shrink-0 tabular-nums ${toneTextClass(tone)}`}>
          {formatPercent(used)}
          <span className="text-ink-soft">% used</span>
        </span>
      </div>
      <Progress value={used} tone={tone} />
      {reset ? <span className="text-xxs text-ink-soft">{reset}</span> : null}
    </div>
  );
}

export function ClaudeQuotaView() {
  const { snapshot, error, loading } = useSyncExternalStore(subscribe, getQuotaState);

  if (!snapshot) {
    const signIn = error === "Claude sign-in required";
    return (
      <div className="flex flex-col gap-3">
        <Header status={loading ? "loading" : error ? "error" : "loading"} />
        {error ? (
          <div className="flex flex-col gap-1">
            <span className="text-md text-ink-strong">{signIn ? "sign in to claude code" : "quota unavailable"}</span>
            <span className="text-sm text-ink-muted">
              {signIn ? "run claude in a terminal and use /login" : error.replace(/^Claude quota unavailable:?\s*/, "") || "no local claude credentials or cli found"}
            </span>
          </div>
        ) : (
          <span className="text-md text-ink-muted">reading claude usage...</span>
        )}
        {error ? (
          <div>
            <Button size="sm" onClick={() => void refreshQuota(true)} disabled={loading}>
              retry
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  const weekly = weeklyWindow(snapshot);
  const others = secondaryWindows(snapshot);
  const status = snapshot.stale ? "stale" : "live";

  return (
    <div className="flex flex-col gap-3">
      <Header plan={snapshot.plan} status={loading ? "loading" : status} />

      {weekly?.percentUsed !== undefined ? (
        <div className={`flex flex-col gap-2 ${snapshot.stale ? "opacity-60" : ""}`}>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-light tracking-value tabular-nums ${toneTextClass(toneFor(weekly.percentUsed))}`}
            >
              {formatPercent(weekly.percentUsed)}
              <span className="ml-0.5 text-sm text-ink-soft">% used</span>
            </span>
            <span className="text-sm text-ink-muted">all models</span>
          </div>
          <Progress value={weekly.percentUsed} tone={toneFor(weekly.percentUsed)} />
          <span className="text-xs text-ink-muted">{formatReset(weekly) ?? "reset time unknown"}</span>
        </div>
      ) : (
        <span className="text-md text-ink-muted">no weekly limit reported for this account</span>
      )}

      {others.length ? (
        <div className={`flex flex-col gap-3 ${snapshot.stale ? "opacity-60" : ""}`}>
          {others.map((window) => (
            <SecondaryRow key={`${window.id}:${window.label}`} window={window} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-line-faint pt-2 text-xxs uppercase tracking-caps text-ink-label">
        <span className="truncate">
          {snapshot.claudeCodeSharePercent !== undefined
            ? `claude code ${formatPercent(snapshot.claudeCodeSharePercent)}% of week's usage`
            : `via ${snapshot.source}`}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span>{formatUpdated(snapshot.refreshedAt)}</span>
          <Button size="sm" variant="ghost" onClick={() => void refreshQuota(true)} disabled={loading}>
            refresh
          </Button>
        </span>
      </div>
      {snapshot.stale ? (
        <span className="text-xxs text-signal-warn">claude usage did not respond - showing the last sync</span>
      ) : null}
    </div>
  );
}
