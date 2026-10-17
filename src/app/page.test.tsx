import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EventsPage from "./page";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-16T12:00:00-04:00"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Story 1: browse events", () => {
  it("shows upcoming events with their date, location, price, and seats remaining", () => {
    render(<EventsPage />);

    const event = screen.getByRole("article", { name: /CMU Fall Fest/i });
    expect(within(event).getByText(/November 5, 2026/)).toBeInTheDocument();
    expect(within(event).getByText(/Gesling Stadium/)).toBeInTheDocument();
    expect(within(event).getByText("$12.00")).toBeInTheDocument();
    expect(within(event).getByText("42 seats remaining")).toBeInTheDocument();
  });

  it("shows Join waitlist instead of Buy for a sold-out event", () => {
    render(<EventsPage />);

    const event = screen.getByRole("article", { name: /CMU Film Festival/i });
    expect(within(event).getByText("Sold out")).toBeInTheDocument();
    expect(within(event).getByRole("button", { name: "Join waitlist" })).toBeInTheDocument();
    expect(within(event).queryByRole("button", { name: /buy/i })).not.toBeInTheDocument();
  });

  it("does not allow the display-only waitlist button to change state", () => {
    render(<EventsPage />);

    const event = screen.getByRole("article", { name: /CMU Film Festival/i });
    expect(within(event).getByRole("button", { name: "Join waitlist" })).toBeDisabled();
  });
});
