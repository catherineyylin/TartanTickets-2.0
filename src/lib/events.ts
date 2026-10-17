export interface EventListing {
  id: string;
  title: string;
  category: string;
  startsAt: Date;
  location: string;
  priceCents: number;
  capacity: number;
  ticketsSold: number;
  artSymbol: string;
}

const eventListings: EventListing[] = [
  {
    id: "fall-fest",
    title: "CMU Fall Fest",
    category: "LIVE MUSIC",
    startsAt: new Date("2026-11-05T18:30:00-05:00"),
    location: "Gesling Stadium",
    priceCents: 1200,
    capacity: 120,
    ticketsSold: 78,
    artSymbol: "♫",
  },
  {
    id: "film-festival",
    title: "CMU Film Festival",
    category: "FILM & CULTURE",
    startsAt: new Date("2026-11-14T19:00:00-05:00"),
    location: "McConomy Auditorium",
    priceCents: 800,
    capacity: 80,
    ticketsSold: 80,
    artSymbol: "✳",
  },
  {
    id: "robotics-open-house",
    title: "Robotics Open House",
    category: "TECH & INNOVATION",
    startsAt: new Date("2026-11-21T13:00:00-05:00"),
    location: "Robotics Institute",
    priceCents: 0,
    capacity: 200,
    ticketsSold: 82,
    artSymbol: "✴",
  },
];

export function getUpcomingEvents(now = new Date()) {
  return eventListings
    .filter((event) => event.startsAt.getTime() > now.getTime())
    .map((event) => ({
      ...event,
      seatsRemaining: Math.max(0, event.capacity - event.ticketsSold),
    }))
    .sort((first, second) => first.startsAt.getTime() - second.startsAt.getTime());
}
