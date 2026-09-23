import type { RefreshableBabyMenuWidget } from "@babymenu/contracts";

import { ClaudeQuotaView } from "./components";
import { refreshQuota } from "./store";

// Quota moves slowly, so five minutes is plenty while the popover is open; the
// host also refreshes once on every open, and the server caches for a minute
// so quick reopen bursts do not hit the API.
export const claudeCodeQuotaWidget: RefreshableBabyMenuWidget = {
  id: "claude-code-quota",
  title: "claude code · weekly",
  viewRefreshIntervalMs: 300_000,
  refreshView: () => refreshQuota(),
  render: () => <ClaudeQuotaView />,
};
