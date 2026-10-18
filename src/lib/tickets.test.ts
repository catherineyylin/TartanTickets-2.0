import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQrCodeDataUrl, createTicketStore, type TicketEvent } from "./tickets";

const sampleEvent: TicketEvent = {
  id: "last-seat",
  title: "Last Seat Concert",
  category: "LIVE MUSIC",
  startsAt: new Date("2026-11-05T18:30:00-05:00"),
  location: "Gesling Stadium",
  priceCents: 1200,
  capacity: 10,
  ticketsSold: 6,
  artSymbol: "♫",
};

let now: number;

function createStore(events = [sampleEvent]) {
  return createTicketStore(events, () => now);
}

function buyer(quantity = 1) {
  return {
    eventId: sampleEvent.id,
    quantity,
    buyerName: "Alex Tartan",
    buyerEmail: "alex@example.edu",
  };
}

beforeEach(() => {
  now = new Date("2026-10-18T12:00:00-04:00").getTime();
});

describe("Story 3: buy tickets", () => {
  it("test_story_3_ticket_limit_caps_orders_at_four_seats", () => {
    const store = createStore();

    expect(store.createCheckout(buyer(4)).status).toBe("reserved");
    expect(store.createCheckout(buyer(5))).toEqual({
      status: "invalid",
      reason: "invalid_quantity",
    });
  });

  it("test_story_3_checkout_holds_seats_for_ten_minutes", () => {
    const store = createStore();
    const result = store.createCheckout(buyer(2));

    expect(result.status).toBe("reserved");
    if (result.status !== "reserved") return;

    expect(result.checkout.holdExpiresAt).toBe(now + 10 * 60 * 1000);
    expect(store.getEvents()[0].seatsRemaining).toBe(2);

    now += 10 * 60 * 1000;
    expect(store.getEvents()[0].seatsRemaining).toBe(4);
  });

  it("test_story_3_simulated_payment_issues_a_receipt_and_qr_per_ticket", async () => {
    const store = createStore();
    const reservation = store.createCheckout(
      Object.assign(buyer(2), { priceCents: 1, totalCents: 1 }),
    );
    expect(reservation.status).toBe("reserved");
    if (reservation.status !== "reserved") return;
    expect(reservation.checkout.totalCents).toBe(2400);

    const result = store.completePayment(reservation.checkout.id, "success");

    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;

    expect(result.receipt).toMatchObject({
      buyerName: "Alex Tartan",
      buyerEmail: "alex@example.edu",
      ticketCount: 2,
      simulated: true,
    });
    expect(result.tickets).toHaveLength(2);
    expect(new Set(result.tickets.map((ticket) => ticket.qrToken)).size).toBe(2);
    expect(result.tickets.every((ticket) => /^[a-f0-9]{32}$/.test(ticket.qrToken))).toBe(true);
    const qrCodeDataUrls = await Promise.all(
      result.tickets.map((ticket) => createQrCodeDataUrl(ticket.qrToken)),
    );
    expect(qrCodeDataUrls.every((dataUrl) => dataUrl.startsWith("data:image/png;base64,"))).toBe(true);
    expect(store.getEvents()[0].seatsRemaining).toBe(2);
  });

  it("test_story_3_declined_simulated_payment_releases_held_seats", () => {
    const store = createStore();
    const reservation = store.createCheckout(buyer(3));
    expect(reservation.status).toBe("reserved");
    if (reservation.status !== "reserved") return;

    expect(store.completePayment(reservation.checkout.id, "declined").status).toBe("declined");
    expect(store.getEvents()[0].seatsRemaining).toBe(4);
  });

  it("test_story_3_lost_last_seat_offers_waitlist_and_allows_only_one_of_fifty_buyers", async () => {
    const store = createStore([
      { ...sampleEvent, capacity: 7, ticketsSold: 6 },
    ]);

    const results = await Promise.all(
      Array.from({ length: 50 }, (_, index) =>
        store.createCheckout({
          ...buyer(),
          buyerName: `Buyer ${index + 1}`,
          buyerEmail: `buyer${index + 1}@example.edu`,
        }),
      ),
    );

    expect(results.filter((result) => result.status === "reserved")).toHaveLength(1);
    expect(results.filter((result) => result.status === "sold_out")).toHaveLength(49);
    expect(store.getEvents()[0].seatsRemaining).toBe(0);
  });
});
