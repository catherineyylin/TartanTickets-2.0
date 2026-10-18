import { randomBytes, randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { getUpcomingEvents, type EventListing } from "./events";

export interface TicketEvent extends EventListing {}

export interface CheckoutRequest {
  eventId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
}

interface HeldCheckout {
  id: string;
  eventId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  totalCents: number;
  holdExpiresAt: number;
  status: "held" | "completed" | "declined" | "expired";
}

export interface CheckoutSummary {
  id: string;
  eventId: string;
  quantity: number;
  totalCents: number;
  holdExpiresAt: number;
}

export interface IssuedTicket {
  id: string;
  qrToken: string;
}

export interface SimulatedReceipt {
  buyerName: string;
  buyerEmail: string;
  ticketCount: number;
  simulated: true;
}

export function createQrCodeDataUrl(token: string) {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 192,
  });
}

export type CheckoutCreation =
  | { status: "reserved"; checkout: CheckoutSummary }
  | { status: "sold_out"; eventId: string }
  | { status: "invalid"; reason: "invalid_quantity" | "invalid_buyer" | "event_not_found" };

export type PaymentCompletion =
  | {
      status: "completed";
      receipt: SimulatedReceipt;
      tickets: IssuedTicket[];
      eventId: string;
      quantity: number;
    }
  | { status: "declined" | "expired" | "not_found" | "already_completed" };

export function createTicketStore(events: TicketEvent[], now: () => number = Date.now) {
  const inventory = new Map(events.map((event) => [event.id, { ...event }]));
  const checkouts = new Map<string, HeldCheckout>();

  function releaseExpiredHolds() {
    const currentTime = now();
    for (const checkout of checkouts.values()) {
      if (checkout.status === "held" && checkout.holdExpiresAt <= currentTime) {
        checkout.status = "expired";
      }
    }
  }

  function getEvents() {
    releaseExpiredHolds();
    return [...inventory.values()]
      .map((event) => ({
        ...event,
        seatsRemaining: Math.max(
          0,
          event.capacity -
            event.ticketsSold -
            [...checkouts.values()]
              .filter(
                (checkout) => checkout.eventId === event.id && checkout.status === "held",
              )
              .reduce((total, checkout) => total + checkout.quantity, 0),
        ),
      }))
      .sort((first, second) => first.startsAt.getTime() - second.startsAt.getTime());
  }

  function createCheckout(request: CheckoutRequest): CheckoutCreation {
    releaseExpiredHolds();

    if (!Number.isInteger(request.quantity) || request.quantity < 1 || request.quantity > 4) {
      return { status: "invalid", reason: "invalid_quantity" };
    }

    const buyerName = request.buyerName.trim();
    const buyerEmail = request.buyerEmail.trim();
    if (
      buyerName.length < 1 ||
      buyerName.length > 40 ||
      buyerEmail.length > 40 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)
    ) {
      return { status: "invalid", reason: "invalid_buyer" };
    }

    const event = inventory.get(request.eventId);
    if (!event) return { status: "invalid", reason: "event_not_found" };

    const reservedSeats = [...checkouts.values()]
      .filter((checkout) => checkout.eventId === event.id && checkout.status === "held")
      .reduce((total, checkout) => total + checkout.quantity, 0);
    if (event.capacity - event.ticketsSold - reservedSeats < request.quantity) {
      return { status: "sold_out", eventId: event.id };
    }

    const checkout: HeldCheckout = {
      id: randomUUID(),
      eventId: event.id,
      quantity: request.quantity,
      buyerName,
      buyerEmail,
      totalCents: event.priceCents * request.quantity,
      holdExpiresAt: now() + 10 * 60 * 1000,
      status: "held",
    };
    checkouts.set(checkout.id, checkout);

    return {
      status: "reserved",
      checkout: {
        id: checkout.id,
        eventId: checkout.eventId,
        quantity: checkout.quantity,
        totalCents: checkout.totalCents,
        holdExpiresAt: checkout.holdExpiresAt,
      },
    };
  }

  function completePayment(checkoutId: string, outcome: "success" | "declined"): PaymentCompletion {
    releaseExpiredHolds();

    const checkout = checkouts.get(checkoutId);
    if (!checkout) return { status: "not_found" };
    if (checkout.status === "expired") return { status: "expired" };
    if (checkout.status === "declined") return { status: "declined" };
    if (checkout.status === "completed") return { status: "already_completed" };

    if (outcome === "declined") {
      checkout.status = "declined";
      return { status: "declined" };
    }

    const event = inventory.get(checkout.eventId);
    if (!event) return { status: "not_found" };
    checkout.status = "completed";
    event.ticketsSold += checkout.quantity;

    return {
      status: "completed",
      receipt: {
        buyerName: checkout.buyerName,
        buyerEmail: checkout.buyerEmail,
        ticketCount: checkout.quantity,
        simulated: true,
      },
      tickets: Array.from({ length: checkout.quantity }, () => ({
        id: randomUUID(),
        qrToken: randomBytes(16).toString("hex"),
      })),
      eventId: checkout.eventId,
      quantity: checkout.quantity,
    };
  }

  return { createCheckout, completePayment, getEvents };
}

type TicketStore = ReturnType<typeof createTicketStore>;
const globalForTickets = globalThis as typeof globalThis & { tartanTicketStore?: TicketStore };

export function getTicketStore() {
  globalForTickets.tartanTicketStore ??= createTicketStore(getUpcomingEvents());
  return globalForTickets.tartanTicketStore;
}
