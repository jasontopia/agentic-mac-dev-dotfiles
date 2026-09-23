import { execFile } from "node:child_process";
import { access, mkdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import os from "node:os";
import path from "node:path";

import type { BabyMenuServerContext } from "@babymenu/contracts";

import { parseUsagePanel, renderScreen } from "./terminal";

type WindowId =
  | "five_hour"
  | "seven_day"
  | "seven_day_sonnet"
  | "seven_day_opus"
  | "seven_day_scoped"
  | "extra_usage";

export type QuotaWindow = {
  id: WindowId;
  label: string;
  // Canonical axis is percent USED (0-100); remaining is always 100 - percentUsed.
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
  // Share of this week's usage that came from Claude Code rather than chat or
  // cowork. Only the OAuth API reports it.
  claudeCodeSharePercent?: number;
  refreshedAt: string;
  stale: boolean;
};

export type QuotaResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; sourceTried: string[] };

const SNAPSHOT_TABLE = "claude_code_quota_snapshot";
const USAGE_URL = "https://api.anthropic.com/api/oauth/usage";
const KEYCHAIN_SERVICE = "Claude Code-credentials";
const REQUEST_TIMEOUT_MS = 10_000;
const CLI_TIMEOUT_MS = 15_000;
// Popover opens re-run refreshView; this keeps quick reopen bursts off the API.
const FRESH_FOR_MS = 60_000;

const UNAVAILABLE = "Claude quota unavailable";
const SIGN_IN_REQUIRED = "Claude sign-in required";

// ---------------------------------------------------------------------------
// Snapshot persistence (no credentials are ever stored here)

type SnapshotRow = { json: string; saved_at: number };

function loadSnapshot(db: BabyMenuServerContext["db"]): { snapshot: ClaudeQuotaSnapshot; savedAt: number } | null {
  db.exec(
    `CREATE TABLE IF NOT EXISTS ${SNAPSHOT_TABLE} (
       id INTEGER PRIMARY KEY CHECK (id = 1),
       json TEXT NOT NULL,
       saved_at INTEGER NOT NULL
     )`,
  );
  const row = db.get<SnapshotRow>(`SELECT json, saved_at FROM ${SNAPSHOT_TABLE} WHERE id = 1`);
  if (!row) return null;
  try {
    return { snapshot: JSON.parse(row.json) as ClaudeQuotaSnapshot, savedAt: row.saved_at };
  } catch {
    return null;
  }
}

function saveSnapshot(db: BabyMenuServerContext["db"], snapshot: ClaudeQuotaSnapshot): void {
  db.run(
    `INSERT INTO ${SNAPSHOT_TABLE} (id, json, saved_at) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json = excluded.json, saved_at = excluded.saved_at`,
    [JSON.stringify(snapshot), Date.now()],
  );
}

// ---------------------------------------------------------------------------
// Credentials

type Credential = {
  source: "keychain" | "file";
  accessToken: string;
  expiresAt?: number;
  scopes: string[];
  plan?: string;
};

function run(file: string, args: string[], timeout: number): Promise<{ stdout: string; code: number }> {
  return new Promise((resolve) => {
    execFile(file, args, { timeout, maxBuffer: 8 * 1024 * 1024, killSignal: "SIGKILL" }, (error, stdout) => {
      const code = error ? (typeof error.code === "number" ? error.code : -1) : 0;
      resolve({ stdout: String(stdout ?? ""), code });
    });
  });
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function planLabel(oauth: Record<string, unknown>): string | undefined {
  const subscription = typeof oauth.subscriptionType === "string" ? oauth.subscriptionType : undefined;
  if (!subscription) return undefined;
  // rateLimitTier looks like "default_claude_max_5x"; the multiplier is the useful part.
  const tier = typeof oauth.rateLimitTier === "string" ? oauth.rateLimitTier.match(/(\d+x)$/)?.[1] : undefined;
  return tier ? `${subscription} ${tier}` : subscription;
}

function parseCredential(raw: string, source: Credential["source"]): Credential | null {
  let json: Record<string, unknown> | undefined;
  try {
    json = asRecord(JSON.parse(raw));
  } catch {
    return null;
  }
  if (!json) return null;
  const oauth = asRecord(json.claudeAiOauth) ?? json;
  const token = oauth.accessToken ?? oauth.access_token ?? json.accessToken ?? json.access_token;
  if (typeof token !== "string" || !token) return null;
  const expiresAt = typeof oauth.expiresAt === "number" ? oauth.expiresAt : undefined;
  const scopes = Array.isArray(oauth.scopes) ? oauth.scopes.filter((s): s is string => typeof s === "string") : [];
  return { source, accessToken: token, expiresAt, scopes, plan: planLabel(oauth) };
}

async function readCredentials(): Promise<Credential[]> {
  const found: Credential[] = [];

  if (os.platform() === "darwin") {
    const { stdout, code } = await run(
      "/usr/bin/security",
      ["find-generic-password", "-s", KEYCHAIN_SERVICE, "-w"],
      REQUEST_TIMEOUT_MS,
    );
    const credential = code === 0 ? parseCredential(stdout.trim(), "keychain") : null;
    if (credential) found.push(credential);
  }

  try {
    const raw = await readFile(path.join(os.homedir(), ".claude", ".credentials.json"), "utf8");
    const credential = parseCredential(raw, "file");
    if (credential) found.push(credential);
  } catch {
    // Absent file is the normal macOS case.
  }

  const now = Date.now();
  const usable = found.filter((c) => c.expiresAt === undefined || c.expiresAt > now);
  // The Keychain is the item Claude Code refreshes in place, so on macOS it wins
  // outright; everything else is ordered by the latest expiry.
  return usable.sort((a, b) => {
    if (a.source !== b.source && (a.source === "keychain" || b.source === "keychain")) {
      return a.source === "keychain" ? -1 : 1;
    }
    return (b.expiresAt ?? 0) - (a.expiresAt ?? 0);
  });
}

// ---------------------------------------------------------------------------
// OAuth usage API

function percent(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : undefined;
}

function isoOrUndefined(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return Number.isNaN(Date.parse(value)) ? undefined : new Date(value).toISOString();
}

function minorToMajor(value: unknown): number | undefined {
  const money = asRecord(value);
  if (!money || typeof money.amount_minor !== "number") return undefined;
  const exponent = typeof money.exponent === "number" ? money.exponent : 2;
  return money.amount_minor / 10 ** exponent;
}

const MODEL_WINDOWS: Array<{ key: string; id: WindowId; label: string }> = [
  { key: "five_hour", id: "five_hour", label: "session" },
  { key: "seven_day", id: "seven_day", label: "week" },
  { key: "seven_day_sonnet", id: "seven_day_sonnet", label: "week · sonnet" },
  { key: "seven_day_opus", id: "seven_day_opus", label: "week · opus" },
];

export function parseUsageResponse(body: unknown): Omit<ClaudeQuotaSnapshot, "source" | "plan" | "refreshedAt" | "stale"> | null {
  const root = asRecord(body);
  if (!root) return null;
  const windows: QuotaWindow[] = [];

  for (const { key, id, label } of MODEL_WINDOWS) {
    const entry = asRecord(root[key]);
    const used = percent(entry?.utilization);
    // A null window means the account has no such limit; it is not 0% used.
    if (!entry || used === undefined) continue;
    windows.push({ id, label, percentUsed: used, resetAt: isoOrUndefined(entry.resets_at) });
  }

  // Model-scoped weekly limits (currently Fable) arrive only in `limits`.
  if (Array.isArray(root.limits)) {
    for (const item of root.limits) {
      const limit = asRecord(item);
      if (limit?.kind !== "weekly_scoped") continue;
      const name = asRecord(asRecord(limit.scope)?.model)?.display_name;
      const used = percent(limit.percent);
      if (typeof name !== "string" || used === undefined) continue;
      const label = `week · ${name.toLowerCase()}`;
      if (windows.some((w) => w.label === label)) continue;
      windows.push({ id: "seven_day_scoped", label, percentUsed: used, resetAt: isoOrUndefined(limit.resets_at) });
    }
  }

  const spend = asRecord(root.spend);
  if (spend?.enabled === true) {
    const spentUsd = minorToMajor(spend.used);
    const limitUsd = minorToMajor(spend.limit);
    windows.push({ id: "extra_usage", label: "extra usage", percentUsed: percent(spend.percent), spentUsd, limitUsd });
  }

  if (!windows.some((w) => w.id === "seven_day" || w.id === "five_hour")) return null;

  const breakdown = asRecord(root.seven_day_breakdown);
  const claudeCodeRow = Array.isArray(breakdown?.rows)
    ? breakdown.rows.map(asRecord).find((row) => row?.key === "claude_code")
    : undefined;

  return { windows, claudeCodeSharePercent: percent(claudeCodeRow?.percent) };
}

type OAuthOutcome =
  | { kind: "ok"; snapshot: ClaudeQuotaSnapshot }
  | { kind: "rejected" }
  | { kind: "transient"; reason: string }
  | { kind: "unparseable" };

async function fetchOAuthUsage(credential: Credential): Promise<OAuthOutcome> {
  let response: Response;
  try {
    response = await fetch(USAGE_URL, {
      headers: {
        Authorization: `Bearer ${credential.accessToken}`,
        "anthropic-beta": "oauth-2025-04-20",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return { kind: "transient", reason: timedOut ? "timed out" : "network error" };
  }

  if (response.status === 401 || response.status === 403) return { kind: "rejected" };
  if (!response.ok) return { kind: "transient", reason: `http ${response.status}` };

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { kind: "unparseable" };
  }
  const parsed = parseUsageResponse(body);
  if (!parsed) return { kind: "unparseable" };

  return {
    kind: "ok",
    snapshot: {
      source: "oauth",
      plan: credential.plan,
      ...parsed,
      refreshedAt: new Date().toISOString(),
      stale: false,
    },
  };
}

// ---------------------------------------------------------------------------
// Claude CLI /usage probe

const CLI_CANDIDATES = [
  path.join(os.homedir(), ".local", "bin", "claude"),
  path.join(os.homedir(), ".claude", "local", "claude"),
  "/opt/homebrew/bin/claude",
  "/usr/local/bin/claude",
];

// A packaged app launched from Finder gets a minimal PATH without Homebrew, so
// PATH is checked first and then the documented install locations.
async function findClaudeCli(): Promise<string | null> {
  const fromPath = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean).map((dir) => path.join(dir, "claude"));
  for (const candidate of [...fromPath, ...CLI_CANDIDATES]) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next location.
    }
  }
  return null;
}

const PTY_ROWS = 80;
const PTY_COLUMNS = 120;

// `expect` ships with macOS and gives the TUI a real pty. The pty is sized
// tall enough that the usage panel is not clipped behind a scroll indicator.
// Claude Code asks to trust any new directory; the probe runs in an empty
// extension-owned directory, so accepting that prompt grants access to nothing.
function probeScript(cli: string): string {
  const quoted = `{${cli}}`;
  return String.raw`
set timeout 12
log_user 1
spawn -noecho ${quoted} --allowed-tools ""
stty rows ${PTY_ROWS} columns ${PTY_COLUMNS} < $spawn_out(slave,name)
set sent 0
expect {
  -re {safety} { sleep 0.3; send -- "\033\[B"; sleep 0.3; send -- "\r"; exp_continue }
  -re {(?i)(not logged in|please run /login|invalid api key|oauth token has expired)} { exit 3 }
  -re {cycle} {
    if {!$sent} { set sent 1; sleep 0.6; send -- "/usage"; sleep 0.5; send -- "\r" }
    exp_continue
  }
  -re {(Usage credits|Extra usage)} { if {$sent} { expect -timeout 1 NO_MATCH } else { exp_continue } }
  timeout { if {!$sent} { exit 4 } }
}
exit 0
`;
}

type CliOutcome =
  | { kind: "ok"; snapshot: ClaudeQuotaSnapshot }
  | { kind: "missing" }
  | { kind: "signed-out" }
  | { kind: "failed"; reason: string };

async function probeCli(rootDir: string): Promise<CliOutcome> {
  if (os.platform() !== "darwin") return { kind: "missing" };
  const cli = await findClaudeCli();
  if (!cli) return { kind: "missing" };

  const probeDir = path.join(rootDir, "claude-code-quota", "cli-probe");
  await mkdir(probeDir, { recursive: true });

  // Inherited CLAUDE_CODE_* markers would make the probe act like a child session.
  const env: NodeJS.ProcessEnv = { TERM: "xterm-256color" };
  for (const [key, value] of Object.entries(process.env)) {
    if (key === "CLAUDECODE" || key.startsWith("CLAUDE_CODE_")) continue;
    env[key] = value;
  }
  env.TERM = "xterm-256color";

  const result = await new Promise<{ stdout: string; code: number }>((resolve) => {
    execFile(
      "/usr/bin/expect",
      ["-c", probeScript(cli)],
      { cwd: probeDir, env, timeout: CLI_TIMEOUT_MS, killSignal: "SIGKILL", maxBuffer: 16 * 1024 * 1024 },
      (error, stdout) => {
        const code = error ? (typeof error.code === "number" ? error.code : -1) : 0;
        resolve({ stdout: String(stdout ?? ""), code });
      },
    );
  });

  if (result.code === 3) return { kind: "signed-out" };

  const screen = renderScreen(result.stdout, PTY_ROWS, PTY_COLUMNS);
  const panel = parseUsagePanel(screen);
  if (!panel.length) {
    const text = screen.join("\n");
    if (/update (is )?(required|available)|claude update/i.test(text)) {
      return { kind: "failed", reason: "claude cli needs an update" };
    }
    return { kind: "failed", reason: result.code === -1 ? "cli probe timed out" : "usage panel not found" };
  }

  const windows: QuotaWindow[] = panel.map((entry) => {
    if (entry.heading === "session") {
      return { id: "five_hour", label: "session", percentUsed: entry.percentUsed, resetText: entry.resetText };
    }
    const scope = entry.heading.match(/^week \((.+)\)$/)?.[1];
    if (!scope || scope === "all models") {
      return { id: "seven_day", label: "week", percentUsed: entry.percentUsed, resetText: entry.resetText };
    }
    const lower = scope.toLowerCase();
    const id: WindowId = lower === "sonnet" ? "seven_day_sonnet" : lower === "opus" ? "seven_day_opus" : "seven_day_scoped";
    return { id, label: `week · ${lower}`, percentUsed: entry.percentUsed, resetText: entry.resetText };
  });

  const planLine = screen.find((line) => /·\s*Claude (Pro|Max|Team|Enterprise)/i.test(line));
  const plan = planLine?.match(/Claude (Pro|Max|Team|Enterprise)/i)?.[1].toLowerCase();

  return {
    kind: "ok",
    snapshot: { source: "cli", plan, windows, refreshedAt: new Date().toISOString(), stale: false },
  };
}

// ---------------------------------------------------------------------------
// Resolution

let inFlight: Promise<QuotaResult<ClaudeQuotaSnapshot>> | null = null;

async function resolveQuota(context: BabyMenuServerContext, force: boolean): Promise<QuotaResult<ClaudeQuotaSnapshot>> {
  const previous = loadSnapshot(context.db);
  if (!force && previous && Date.now() - previous.savedAt < FRESH_FOR_MS) {
    return { ok: true, data: { ...previous.snapshot, stale: false } };
  }

  const sourceTried: string[] = [];
  const staleOr = (error: string): QuotaResult<ClaudeQuotaSnapshot> =>
    previous ? { ok: true, data: { ...previous.snapshot, stale: true } } : { ok: false, error, sourceTried };

  let rejected = false;
  let transient: string | null = null;

  for (const credential of await readCredentials()) {
    sourceTried.push(`oauth:${credential.source}`);
    const outcome = await fetchOAuthUsage(credential);
    if (outcome.kind === "ok") {
      saveSnapshot(context.db, outcome.snapshot);
      return { ok: true, data: outcome.snapshot };
    }
    if (outcome.kind === "rejected") {
      rejected = true;
      continue;
    }
    if (outcome.kind === "transient") {
      // The token was fine but the service or network was not; another token
      // or a CLI launch would hit the same wall, so keep last-good data instead.
      transient = outcome.reason;
      break;
    }
  }

  if (transient) return staleOr(`${UNAVAILABLE}: ${transient}`);

  sourceTried.push("cli");
  const cli = await probeCli(context.rootDir);
  if (cli.kind === "ok") {
    saveSnapshot(context.db, cli.snapshot);
    return { ok: true, data: cli.snapshot };
  }
  if (cli.kind === "signed-out" || (cli.kind === "missing" && rejected)) {
    // Only here have every token and the CLI failed to authenticate; a stored
    // snapshot must not hide that from the user.
    return { ok: false, error: SIGN_IN_REQUIRED, sourceTried };
  }
  return staleOr(cli.kind === "failed" ? `${UNAVAILABLE}: ${cli.reason}` : UNAVAILABLE);
}

export const actions = {
  async getQuota(input: unknown, context: BabyMenuServerContext): Promise<QuotaResult<ClaudeQuotaSnapshot>> {
    const force = asRecord(input)?.force === true;
    // Coalesce overlapping calls (popover open + manual refresh) into one probe.
    inFlight ??= resolveQuota(context, force).finally(() => {
      inFlight = null;
    });
    return inFlight;
  },
};
