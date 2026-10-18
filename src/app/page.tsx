import EventCatalog from "./event-catalog";
import { getTicketStore } from "../lib/tickets";

export const dynamic = "force-dynamic";

export default function EventsPage() {
  const events = getTicketStore().getEvents();

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
          <EventCatalog initialEvents={events} />
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
