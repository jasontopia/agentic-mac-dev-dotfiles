import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";

import type { BabyMenuServerContext } from "@babymenu/contracts";

const run = promisify(execFile);

// CPU percent is rate-derived: os.cpus() reports cumulative tick counters, so a
// single reading says nothing on its own. The baseline is persisted in db rather
// than module scope because module state resets on every code edit and restart,
// and a lost baseline would collapse the next reading to a meaningless number.
const BASELINE_TABLE = "system_usage_cpu_baseline";

// Beyond this gap the tick diff stops describing "now" and becomes a long-window
// average, so we re-baseline instead of reporting it as the current load.
const MAX_WINDOW_MS = 30_000;

type CpuTicks = { busy: number; total: number };

type BaselineRow = {
  busy: number;
  total: number;
  at: number;
  last_percent: number | null;
};

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
  // Activity Monitor's three components of "memory used".
  appBytes: number;
  wiredBytes: number;
  compressedBytes: number;
};

export type UsageSample = {
  at: number;
  cpu: CpuReading;
  memory: MemoryReading;
};

function ensureTable(db: BabyMenuServerContext["db"]): void {
  db.exec(
    `CREATE TABLE IF NOT EXISTS ${BASELINE_TABLE} (
       id INTEGER PRIMARY KEY CHECK (id = 1),
       busy INTEGER NOT NULL,
       total INTEGER NOT NULL,
       at INTEGER NOT NULL,
       last_percent REAL
     )`,
  );
}

function readCpuTicks(): CpuTicks {
  let busy = 0;
  let total = 0;
  for (const cpu of os.cpus()) {
    const { user, nice, sys, irq, idle } = cpu.times;
    busy += user + nice + sys + irq;
    total += user + nice + sys + irq + idle;
  }
  return { busy, total };
}

function readCpu(db: BabyMenuServerContext["db"], at: number): CpuReading {
  const cpus = os.cpus();
  const shape = { cores: cpus.length, model: cpus[0]?.model ?? "cpu" };

  ensureTable(db);
  const ticks = readCpuTicks();
  const previous = db.get<BaselineRow>(
    `SELECT busy, total, at, last_percent FROM ${BASELINE_TABLE} WHERE id = 1`,
  );

  const writeBaseline = (percent: number | null) => {
    db.run(
      `INSERT INTO ${BASELINE_TABLE} (id, busy, total, at, last_percent)
       VALUES (1, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET busy = excluded.busy, total = excluded.total,
         at = excluded.at, last_percent = excluded.last_percent`,
      [ticks.busy, ticks.total, at, percent],
    );
  };

  const totalDelta = previous ? ticks.total - previous.total : 0;
  const busyDelta = previous ? ticks.busy - previous.busy : 0;
  const windowMs = previous ? at - previous.at : 0;

  // No baseline yet, counters went backwards (a reboot), or the window is too
  // wide to call "current". Re-baseline and hand back the last good value as
  // visibly stale rather than inventing a 0 or 100.
  if (!previous || totalDelta <= 0 || busyDelta < 0 || windowMs > MAX_WINDOW_MS) {
    writeBaseline(previous?.last_percent ?? null);
    return { ...shape, percent: previous?.last_percent ?? null, stale: true };
  }

  const percent = clampPercent((busyDelta / totalDelta) * 100);
  writeBaseline(percent);
  return { ...shape, percent, stale: false };
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

// `vm_stat` prints "Pages free:   5311." style lines, plus a header that carries
// the page size. Values are page counts, so everything is scaled by that size.
function parseVmStat(stdout: string): { pageSize: number; pages: Map<string, number> } {
  const pageSize = Number(stdout.match(/page size of (\d+) bytes/)?.[1] ?? 0);
  const pages = new Map<string, number>();
  for (const line of stdout.split("\n")) {
    const match = line.match(/^"?([^":]+)"?:\s+(\d+)\.?\s*$/);
    if (match) pages.set(match[1].trim(), Number(match[2]));
  }
  return { pageSize, pages };
}

async function readMemory(): Promise<MemoryReading> {
  const totalBytes = os.totalmem();

  if (os.platform() !== "darwin") {
    const usedBytes = totalBytes - os.freemem();
    return {
      percent: clampPercent((usedBytes / totalBytes) * 100),
      usedBytes,
      totalBytes,
      appBytes: usedBytes,
      wiredBytes: 0,
      compressedBytes: 0,
    };
  }

  // os.freemem() on macOS only counts genuinely free pages, so it reports ~99%
  // used on a healthy machine. Activity Monitor's "memory used" is
  // app + wired + compressed, which is what a user recognizes.
  const { stdout } = await run("vm_stat", [], { timeout: 5_000 });
  const { pageSize, pages } = parseVmStat(stdout);
  if (!pageSize) throw new Error("vm_stat returned no page size");

  const pagesOf = (key: string) => (pages.get(key) ?? 0) * pageSize;

  const anonymous = pagesOf("Anonymous pages");
  const purgeable = pagesOf("Pages purgeable");
  const appBytes = Math.max(0, anonymous - purgeable);
  const wiredBytes = pagesOf("Pages wired down");
  const compressedBytes = pagesOf("Pages occupied by compressor");
  const usedBytes = appBytes + wiredBytes + compressedBytes;

  return {
    percent: clampPercent((usedBytes / totalBytes) * 100),
    usedBytes,
    totalBytes,
    appBytes,
    wiredBytes,
    compressedBytes,
  };
}

export const actions = {
  async sample(_input: unknown, context: BabyMenuServerContext): Promise<UsageSample> {
    const at = Date.now();
    // Read CPU ticks first so the vm_stat round trip stays outside the window.
    const cpu = readCpu(context.db, at);
    const memory = await readMemory();
    return { at, cpu, memory };
  },
};
