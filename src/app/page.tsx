import { getUpcomingEvents } from "../lib/events";

export const dynamic = "force-dynamic";

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

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function EventsPage() {
  const events = getUpcomingEvents();

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Tartan Tickets home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>Tartan Tickets</span>
        </a>
        <p className="header-note">Made for the moments that bring us together.</p>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            YOUR CMU EVENT GUIDE
          </p>
          <h1 id="page-title">Find your next<br />favorite thing.</h1>
          <p className="hero-description">
            Campus nights, big ideas, and everything in between. See what&apos;s
            happening around Carnegie Mellon.
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="art-sun" />
          <span className="art-orbit art-orbit-one" />
          <span className="art-orbit art-orbit-two" />
          <span className="art-ticket">
            <span className="ticket-stripe" />
            <span className="ticket-line ticket-line-one" />
            <span className="ticket-line ticket-line-two" />
            <span className="ticket-stub" />
          </span>
          <span className="art-star art-star-one">✳</span>
          <span className="art-star art-star-two">✦</span>
          <span className="art-sparkle">✧</span>
        </div>
      </section>

      <section className="events-section" aria-labelledby="events-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-eyebrow">PICK YOUR NEXT PLAN</p>
            <h2 id="events-title">Coming up on campus</h2>
          </div>
          <p className="event-count">
            {events.length} {events.length === 1 ? "event" : "events"}
          </p>
        </div>

        {events.length > 0 ? (
          <div className="event-grid">
            {events.map((event, index) => {
              const titleId = `event-${event.id}`;
              const soldOut = event.seatsRemaining === 0;

              return (
                <article
                  className={`event-card${soldOut ? " event-card-sold-out" : ""}`}
                  key={event.id}
                  aria-labelledby={titleId}
                >
                  <div className={`event-art event-art-${index % 3}`} aria-hidden="true">
                    <span className="event-art-shape" />
                    <span className="event-art-symbol">
                      {event.artSymbol}
                    </span>
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
                        <span className="seats-remaining">
                          {event.seatsRemaining} seats remaining
                        </span>
                      )}
                    </div>
                    {soldOut ? (
                      <button className="waitlist-button" type="button" disabled>
                        Join waitlist
                      </button>
                    ) : (
                      <p className="availability-note">
                        <span aria-hidden="true">✦</span> Seats are waiting for you
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">✳</span>
            <h3>No upcoming events yet.</h3>
            <p>Check back soon — there&apos;s always something around the corner.</p>
          </div>
        )}
      </section>

      <footer className="site-footer">
        <span className="footer-mark" aria-hidden="true">✳</span>
        <span>A little more campus, a little less scrolling.</span>
        <span className="footer-campus">PITTSBURGH, PA</span>
      </footer>
    </main>
  );
}
