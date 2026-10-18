import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EventCatalog from "./event-catalog";
import { getUpcomingEvents } from "../lib/events";

const events = getUpcomingEvents(new Date("2026-10-18T12:00:00-04:00"));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Story 3: buy tickets in the event browser", () => {
  it("test_story_3_buyer_can_make_a_simulated_purchase_and_view_the_receipt", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        Response.json({
          status: "reserved",
          checkout: { id: "checkout-1", holdExpiresAt: Date.now() + 600_000, totalCents: 2400 },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          status: "completed",
          receipt: {
            buyerName: "Alex Tartan",
            buyerEmail: "alex@example.edu",
            ticketCount: 2,
            simulated: true,
          },
          tickets: [
            { id: "ticket-1", qrToken: "a".repeat(32), qrCodeDataUrl: "data:image/png;base64,AA==" },
            { id: "ticket-2", qrToken: "b".repeat(32), qrCodeDataUrl: "data:image/png;base64,AQ==" },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(<EventCatalog initialEvents={events} />);
    const fallFest = screen.getByRole("article", { name: /CMU Fall Fest/i });
    fireEvent.click(within(fallFest).getByRole("button", { name: /buy tickets/i }));

    fireEvent.change(screen.getByLabelText("Number of tickets"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Alex Tartan" } });
    fireEvent.change(screen.getByLabelText("Email for your simulated receipt"), {
      target: { value: "alex@example.edu" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reserve seats" }));

    expect(await screen.findByText(/Seats held for 10 minutes/i)).toBeInTheDocument();
    expect(screen.getByText("$24.00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simulated payment" }));

    expect(await screen.findByText(/Simulated receipt/i)).toBeInTheDocument();
    expect(screen.getByText(/Nothing was actually emailed/i)).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: /Ticket QR code/i })).toHaveLength(2);
  });

  it("test_story_3_buy_button_prevents_duplicate_checkout_clicks", async () => {
    let resolveReservation!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveReservation = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<EventCatalog initialEvents={events} />);
    const fallFest = screen.getByRole("article", { name: /CMU Fall Fest/i });
    fireEvent.click(within(fallFest).getByRole("button", { name: /buy tickets/i }));
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Alex Tartan" } });
    fireEvent.change(screen.getByLabelText("Email for your simulated receipt"), {
      target: { value: "alex@example.edu" },
    });

    const reserveButton = screen.getByRole("button", { name: "Reserve seats" });
    fireEvent.click(reserveButton);
    fireEvent.click(reserveButton);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(reserveButton).toBeDisabled();

    resolveReservation(
      Response.json({
        status: "reserved",
        checkout: { id: "checkout-1", holdExpiresAt: Date.now() + 600_000, totalCents: 1200 },
      }),
    );
    await waitFor(() => expect(screen.getByText(/Seats held for 10 minutes/i)).toBeInTheDocument());
  });

  it("test_story_3_checkout_that_sells_out_offers_the_waitlist", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ status: "sold_out" }));
    vi.stubGlobal("fetch", fetchMock);

    render(<EventCatalog initialEvents={events} />);
    const fallFest = screen.getByRole("article", { name: /CMU Fall Fest/i });
    fireEvent.click(within(fallFest).getByRole("button", { name: /buy tickets/i }));
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Alex Tartan" } });
    fireEvent.change(screen.getByLabelText("Email for your simulated receipt"), {
      target: { value: "alex@example.edu" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reserve seats" }));

    expect(await screen.findByText(/This event just sold out/i)).toBeInTheDocument();
    expect(within(fallFest).getByRole("button", { name: "Join waitlist" })).toBeDisabled();
  });
});
