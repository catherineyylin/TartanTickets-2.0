import { randomUUID } from "node:crypto";

export type SensitiveAction =
  | "role_change"
  | "refund"
  | "event_cancellation"
  | "stripe_account_change"
  | "attendee_export";

export interface AuditEntryInput {
  action: SensitiveAction;
  actor: string;
  target: string;
  changes: string;
}

export interface AuditEntry extends AuditEntryInput {
  id: string;
  occurredAt: string;
}

export function createAuditLog(now: () => Date = () => new Date()) {
  const entries: AuditEntry[] = [];

  function record(input: AuditEntryInput): Readonly<AuditEntry> {
    const actor = input.actor.trim();
    const target = input.target.trim();
    const changes = input.changes.trim();

    if (!actor || !target || !changes) {
      throw new Error("Audit entries require an actor, target, and change description.");
    }

    const entry = Object.freeze({
      id: randomUUID(),
      action: input.action,
      actor,
      target,
      changes,
      occurredAt: now().toISOString(),
    });
    entries.push(entry);
    return entry;
  }

  function getEntries(): readonly Readonly<AuditEntry>[] {
    return Object.freeze([...entries]);
  }

  return Object.freeze({ record, getEntries });
}
