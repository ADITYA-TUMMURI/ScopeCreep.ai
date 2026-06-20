/**
 * Telemetry Manager for ScopeCreep.ai
 * Parameterizes and centralizes tracking behavior for Pendo and Novus.ai telemetry.
 */

const TELEMETRY_ENABLED = import.meta.env.VITE_TELEMETRY_ENABLED !== "false";

export function trackEvent(name, payload = {}) {
  if (!TELEMETRY_ENABLED) {
    console.log(`[Telemetry - DISABLED] Event: ${name}`, payload);
    return;
  }

  // Pendo tracking
  if (typeof window.pendo !== "undefined" && window.pendo.track) {
    try {
      window.pendo.track(name, payload);
      console.log(`[Telemetry - Pendo] Event: ${name}`, payload);
    } catch (err) {
      console.error("[Telemetry - Pendo Error]", err);
    }
  }

  // Novus tracking
  if (typeof window.novus !== "undefined" && window.novus.track) {
    try {
      window.novus.track(name, payload);
      console.log(`[Telemetry - Novus] Event: ${name}`, payload);
    } catch (err) {
      console.error("[Telemetry - Novus Error]", err);
    }
  }
}

export function trackAgent(type, payload = {}) {
  if (!TELEMETRY_ENABLED) return;

  if (typeof window.pendo !== "undefined" && window.pendo.trackAgent) {
    try {
      window.pendo.trackAgent(type, payload);
      console.log(`[Telemetry - Pendo Agent] Type: ${type}`, payload);
    } catch (err) {
      console.error("[Telemetry - Pendo Agent Error]", err);
    }
  }
}
