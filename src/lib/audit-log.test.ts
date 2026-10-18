import { describe, expect, it } from "vitest";
import { createAuditLog, type SensitiveAction } from "./audit-log";

describe("SEC-21 sensitive action auditing", () => {
  it("writes who, what changed, and when for each sensitive action", () => {
    let now = new Date("2026-10-18T19:00:00.000Z");
    const auditLog = createAuditLog(() => now);
    const actions: SensitiveAction[] = [
      "role_change",
      "refund",
      "event_cancellation",
      "stripe_account_change",
      "attendee_export",
    ];

    for (const action of actions) {
      auditLog.record({
        action,
        actor: "Alex Tartan",
        target: "CMU Fall Fest",
        changes: `Recorded ${action} for CMU Fall Fest`,
      });
      now = new Date(now.getTime() + 1000);
    }

    const entries = auditLog.getEntries();

    expect(entries).toHaveLength(actions.length);
    expect(entries.map((entry) => entry.action)).toEqual(actions);
    expect(entries[0]).toMatchObject({
      actor: "Alex Tartan",
      target: "CMU Fall Fest",
      changes: "Recorded role_change for CMU Fall Fest",
      occurredAt: "2026-10-18T19:00:00.000Z",
    });
    expect(entries[4].occurredAt).toBe("2026-10-18T19:00:04.000Z");
    expect(Object.isFrozen(entries[0])).toBe(true);
    expect(Object.isFrozen(entries)).toBe(true);
  });
});
