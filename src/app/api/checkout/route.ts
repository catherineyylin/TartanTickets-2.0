import { getTicketStore } from "../../../lib/tickets";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please enter valid checkout details." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Please enter valid checkout details." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  if (
    typeof input.eventId !== "string" ||
    typeof input.buyerName !== "string" ||
    typeof input.buyerEmail !== "string" ||
    typeof input.quantity !== "number"
  ) {
    return Response.json({ error: "Please enter valid checkout details." }, { status: 400 });
  }

  const result = getTicketStore().createCheckout({
    eventId: input.eventId,
    quantity: input.quantity,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
  });

  if (result.status === "reserved") return Response.json(result, { status: 201 });
  if (result.status === "sold_out") return Response.json(result, { status: 409 });
  if (result.reason === "event_not_found") {
    return Response.json({ error: "Event not found." }, { status: 404 });
  }
  if (result.reason === "invalid_quantity") {
    return Response.json({ error: "Choose between 1 and 4 tickets." }, { status: 400 });
  }
  return Response.json({ error: "Enter your name and a valid email address." }, { status: 400 });
}
