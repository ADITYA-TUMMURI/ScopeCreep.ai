import PrdInputHub from "./PrdInputHub";
import DevChatSimulator from "./DevChatSimulator";
import WatchdogAlertsFeed from "./WatchdogAlertsFeed";

/**
 * DashboardLayout — Master 3-column grid wrapper.
 *
 * Arranges the three functional panes side-by-side on large screens
 * and stacks them vertically on mobile. Each pane fills the available
 * viewport height minus the navbar chrome.
 *
 * Grid columns:
 *   1. PRD Input Hub         — scope baseline entry
 *   2. Dev Chat Simulator    — mock developer communication feed
 *   3. Watchdog Alerts Feed  — real-time creep alert stream
 */
export default function DashboardLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 lg:p-6 h-[calc(100vh-65px)] overflow-hidden">
      <PrdInputHub />
      <DevChatSimulator />
      <WatchdogAlertsFeed />
    </div>
  );
}
