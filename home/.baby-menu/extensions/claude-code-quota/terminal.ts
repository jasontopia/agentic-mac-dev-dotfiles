// The Claude Code TUI redraws by moving the cursor over unchanged cells, so
// stripping escape codes from the byte stream leaves gaps ("Rese s") wherever a
// character was reused from the previous frame. Replaying the stream onto a
// fixed grid recovers the screen a person would actually read.

const ESC = "\x1b";

export function renderScreen(stream: string, rows: number, columns: number): string[] {
  const grid: string[][] = Array.from({ length: rows }, () => Array(columns).fill(" "));
  let row = 0;
  let col = 0;
  let saved = { row: 0, col: 0 };

  const clampRow = (value: number) => Math.min(rows - 1, Math.max(0, value));
  const clampCol = (value: number) => Math.min(columns - 1, Math.max(0, value));
  const blankRow = () => Array(columns).fill(" ");

  const lineFeed = () => {
    if (row === rows - 1) {
      grid.shift();
      grid.push(blankRow());
    } else {
      row += 1;
    }
  };

  let i = 0;
  while (i < stream.length) {
    const ch = stream[i];

    if (ch === ESC) {
      const next = stream[i + 1];
      if (next === "[") {
        const match = /^\x1b\[([?<>=]?)([0-9;:]*)([ -/]*)([@-~])/.exec(stream.slice(i, i + 64));
        if (!match) {
          i += 2;
          continue;
        }
        const [whole, privateMarker, rawParams, , final] = match;
        const params = rawParams.split(";").map((part) => Number.parseInt(part, 10));
        const n = (index: number, fallback: number) =>
          Number.isFinite(params[index]) && params[index] > 0 ? params[index] : fallback;

        if (!privateMarker) {
          switch (final) {
            case "A": row = clampRow(row - n(0, 1)); break;
            case "B": row = clampRow(row + n(0, 1)); break;
            case "C": col = clampCol(col + n(0, 1)); break;
            case "D": col = clampCol(col - n(0, 1)); break;
            case "E": row = clampRow(row + n(0, 1)); col = 0; break;
            case "F": row = clampRow(row - n(0, 1)); col = 0; break;
            case "G": col = clampCol(n(0, 1) - 1); break;
            case "d": row = clampRow(n(0, 1) - 1); break;
            case "H":
            case "f":
              row = clampRow(n(0, 1) - 1);
              col = clampCol(n(1, 1) - 1);
              break;
            case "K": {
              const mode = Number.isFinite(params[0]) ? params[0] : 0;
              const [from, to] = mode === 1 ? [0, col + 1] : mode === 2 ? [0, columns] : [col, columns];
              for (let c = from; c < to; c++) grid[row][c] = " ";
              break;
            }
            case "J": {
              const mode = Number.isFinite(params[0]) ? params[0] : 0;
              if (mode === 2 || mode === 3) {
                for (let r = 0; r < rows; r++) grid[r] = blankRow();
              } else if (mode === 0) {
                for (let c = col; c < columns; c++) grid[row][c] = " ";
                for (let r = row + 1; r < rows; r++) grid[r] = blankRow();
              } else {
                for (let r = 0; r < row; r++) grid[r] = blankRow();
                for (let c = 0; c <= col; c++) grid[row][c] = " ";
              }
              break;
            }
            // Colors, modes, and everything else do not move text.
          }
        }
        i += whole.length;
        continue;
      }
      if (next === "]") {
        // OSC runs until BEL or ST.
        const bel = stream.indexOf("\x07", i);
        const st = stream.indexOf(`${ESC}\\`, i);
        const ends = [bel === -1 ? Infinity : bel + 1, st === -1 ? Infinity : st + 2];
        const end = Math.min(...ends);
        i = end === Infinity ? stream.length : end;
        continue;
      }
      if (next === "7") saved = { row, col };
      if (next === "8") ({ row, col } = saved);
      // Charset selection such as ESC ( B carries one more byte.
      i += next === "(" || next === ")" ? 3 : 2;
      continue;
    }

    if (ch === "\r") col = 0;
    else if (ch === "\n") lineFeed();
    else if (ch === "\b") col = Math.max(0, col - 1);
    else if (ch >= " ") {
      if (col >= columns) {
        col = 0;
        lineFeed();
      }
      grid[row][col] = ch;
      col += 1;
    }
    i += 1;
  }

  return grid.map((cells) => cells.join("").trimEnd());
}

export type CliUsageWindow = {
  heading: string;
  percentUsed: number;
  resetText?: string;
};

// Reads "Current session" / "Current week (all models)" / "Current week (Fable)"
// sections: a heading, a bar, "N% used" (or "N% left"), then "Resets ...".
export function parseUsagePanel(lines: string[]): CliUsageWindow[] {
  const windows = new Map<string, CliUsageWindow>();
  for (let index = 0; index < lines.length; index++) {
    const heading = lines[index].trim().match(/^Current (session|week(?: \([^)]+\))?)$/);
    if (!heading) continue;

    let percentUsed: number | undefined;
    let resetText: string | undefined;
    for (const line of lines.slice(index + 1, index + 6)) {
      const text = line.trim();
      if (/^Current /.test(text)) break;
      const percent = text.match(/(\d+(?:\.\d+)?)%\s+(used|left)/i);
      if (percent && percentUsed === undefined) {
        const value = Number(percent[1]);
        percentUsed = percent[2].toLowerCase() === "left" ? 100 - value : value;
      }
      const reset = text.match(/^Resets\s+(.+)$/i);
      if (reset) resetText = reset[1].trim();
    }
    if (percentUsed !== undefined) {
      windows.set(heading[1], { heading: heading[1], percentUsed, resetText });
    }
  }
  return [...windows.values()];
}
