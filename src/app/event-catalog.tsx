"use client";

import { useRef, useState } from "react";
import type { EventListing } from "../lib/events";

interface EventWithAvailability extends EventListing {
  seatsRemaining: number;
}

interface CheckoutSummary {
  id: string;
  eventId: string;
  quantity: number;
  totalCents: number;
  holdExpiresAt: number;
}

interface PurchaseReceipt {
  buyerName: string;
  buyerEmail: string;
  ticketCount: number;
  simulated: true;
}

interface PurchasedTicket {
  id: string;
  qrToken: string;
  qrCodeDataUrl: string;
}

interface PurchaseDetails {
  receipt: PurchaseReceipt;
  tickets: PurchasedTicket[];
}

interface EventCatalogProps {
  initialEvents: EventWithAvailability[];
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const eventDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});

const eventTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

export default function EventCatalog({ initialEvents }: EventCatalogProps) {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [checkout, setCheckout] = useState<CheckoutSummary | null>(null);
  const [purchase, setPurchase] = useState<PurchaseDetails | null>(null);
  const [soldOutEventId, setSoldOutEventId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestInProgress = useRef(false);

  function startBuying(event: EventWithAvailability) {
    setSelectedEventId(event.id);
    setQuantity(1);
    setBuyerName("");
    setBuyerEmail("");
    setCheckout(null);
    setPurchase(null);
    setSoldOutEventId(null);
    setErrorMessage("");
  }

  async function reserveSeats(event: EventWithAvailability) {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    setBusy(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          quantity,
          buyerName,
          buyerEmail,
        }),
      });
      const result = await response.json();

      if (result.status === "sold_out") {
        setSoldOutEventId(event.id);
        setEvents((current) =>
          current.map((item) =>
            item.id === event.id ? { ...item, seatsRemaining: 0 } : item,
          ),
        );
        return;
      }

      if (!response.ok) {
        setErrorMessage(result.error ?? "Could not reserve these seats. Please try again.");
        return;
      }

      setCheckout(result.checkout as CheckoutSummary);
    } catch {
      setErrorMessage("We could not reach the server. Check your connection and try again.");
    } finally {
      requestInProgress.current = false;
      setBusy(false);
    }
  }

  async function completeSimulatedPayment() {
    if (!checkout || requestInProgress.current) return;
    requestInProgress.current = true;
    setBusy(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/checkout/${checkout.id}/payment`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error ?? "Could not complete this simulated payment.");
        setCheckout(null);
        return;
      }

      setPurchase({ receipt: result.receipt, tickets: result.tickets });
      setEvents((current) =>
        current.map((event) =>
          event.id === checkout.eventId
            ? { ...event, seatsRemaining: Math.max(0, event.seatsRemaining - checkout.quantity) }
            : event,
        ),
      );
      setCheckout(null);
    } catch {
      setErrorMessage("We could not reach the server. Check your connection and try again.");
    } finally {
      requestInProgress.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="event-grid">
      {events.map((event, index) => {
        const titleId = `event-${event.id}`;
        const soldOut = event.seatsRemaining === 0;
        const buyingThisEvent = selectedEventId === event.id;

        return (
          <article
            className={`event-card${soldOut ? " event-card-sold-out" : ""}`}
            key={event.id}
            aria-labelledby={titleId}
          >
            <div className={`event-art event-art-${index % 3}`} aria-hidden="true">
              <span className="event-art-shape" />
              <span className="event-art-symbol">{event.artSymbol}</span>
              <span className="event-category">{event.category}</span>
            </div>
            <div className="event-content">
              <h3 id={titleId}>{event.title}</h3>
              <p className="event-date">
                {eventDateFormatter.format(event.startsAt)}
                <span aria-hidden="true"> · </span>
                {eventTimeFormatter.format(event.startsAt)}
              </p>
              <p className="event-location">
                <svg aria-hidden="true" viewBox="0 0 20 20">
                  <path d="M10 18s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
                  <circle cx="10" cy="8" r="2" />
                </svg>
                {event.location}
              </p>
              <div className="event-details">
                <span className="event-price">
                  {event.priceCents === 0
                    ? "Free"
                    : priceFormatter.format(event.priceCents / 100)}
                </span>
                {soldOut ? (
                  <span className="seats-remaining sold-out-label">Sold out</span>
                ) : (
                  <span className="seats-remaining">{event.seatsRemaining} seats remaining</span>
                )}
              </div>

              {purchase && buyingThisEvent ? (
                <div className="purchase-receipt" aria-live="polite">
                  <h4>Simulated receipt</h4>
                  <p>
                    {purchase.receipt.ticketCount} ticket
                    {purchase.receipt.ticketCount === 1 ? "" : "s"} for{" "}
                    {purchase.receipt.buyerName}
                  </p>
                  <p className="receipt-note">
                    Receipt for {purchase.receipt.buyerEmail}. Nothing was actually emailed.
                  </p>
                  <div className="qr-ticket-list">
                    {purchase.tickets.map((ticket, ticketIndex) => (
                      <div className="qr-ticket" key={ticket.id}>
                        <img
                          src={ticket.qrCodeDataUrl}
                          alt={`Ticket QR code ${ticketIndex + 1}`}
                          width="144"
                          height="144"
                        />
                        <span>Ticket {ticketIndex + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : buyingThisEvent && checkout ? (
                <div className="checkout-panel" aria-live="polite">
                  <p className="hold-message">Seats held for 10 minutes.</p>
                  <p className="checkout-total">
                    Order total: <strong>{priceFormatter.format(checkout.totalCents / 100)}</strong>
                  </p>
                  <p className="receipt-note">
                    This is a simulation. No payment will be taken.
                  </p>
                  <button
                    className="buy-button"
                    type="button"
                    disabled={busy}
                    onClick={completeSimulatedPayment}
                  >
                    {event.priceCents === 0 ? "Claim free tickets" : "Simulated payment"}
                  </button>
                </div>
              ) : soldOutEventId === event.id ? (
                <div className="checkout-panel" role="status">
                  <p className="checkout-error">This event just sold out.</p>
                  <button className="waitlist-button" type="button" disabled>
                    Join waitlist
                  </button>
                </div>
              ) : buyingThisEvent ? (
                <form
                  className="checkout-form"
                  onSubmit={(submitEvent) => {
                    submitEvent.preventDefault();
                    void reserveSeats(event);
                  }}
                >
                  <label>
                    Number of tickets
                    <select
                      value={quantity}
                      onChange={(changeEvent) => setQuantity(Number(changeEvent.target.value))}
                    >
                      {Array.from(
                        { length: Math.min(4, event.seatsRemaining) },
                        (_, seatIndex) => seatIndex + 1,
                      ).map((seats) => (
                        <option key={seats} value={seats}>{seats}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Your name
                    <input
                      autoComplete="name"
                      maxLength={100}
                      required
                      value={buyerName}
                      onChange={(changeEvent) => setBuyerName(changeEvent.target.value)}
                    />
                  </label>
                  <label>
                    Email for your simulated receipt
                    <input
                      autoComplete="email"
                      maxLength={254}
                      required
                      type="email"
                      value={buyerEmail}
                      onChange={(changeEvent) => setBuyerEmail(changeEvent.target.value)}
                    />
                  </label>
                  {errorMessage && <p className="checkout-error" role="alert">{errorMessage}</p>}
                  <button className="buy-button" type="submit" disabled={busy}>
                    {busy ? "Reserving seats…" : "Reserve seats"}
                  </button>
                </form>
              ) : soldOut ? (
                <button className="waitlist-button" type="button" disabled>
                  Join waitlist
                </button>
              ) : (
                <button
                  className="buy-button"
                  type="button"
                  onClick={() => startBuying(event)}
                >
                  Buy tickets
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
