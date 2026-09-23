import type { RefreshableBabyMenuWidget } from "@babymenu/contracts";

import { SystemUsageView } from "./components";
import { refreshUsage } from "./store";

// A live monitor is only interesting while it is on screen, so this rides the
// host's view refresh (paused while the popover is hidden) instead of a
// background task that would wake the machine for nobody.
export const systemUsageWidget: RefreshableBabyMenuWidget = {
  id: "system-usage",
  title: "system usage",
  viewRefreshIntervalMs: 2_000,
  refreshView: () => refreshUsage(),
  render: () => <SystemUsageView />,
};
