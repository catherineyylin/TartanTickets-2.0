import { createQrCodeDataUrl, getTicketStore } from "../../../../../lib/tickets";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ checkoutId: string }> },
) {
  const { checkoutId } = await params;
  const result = getTicketStore().completePayment(checkoutId, "success");

  if (result.status === "not_found") {
    return Response.json({ error: "Checkout not found." }, { status: 404 });
  }
  if (result.status === "expired") {
    return Response.json({ error: "Your seat hold expired. Please start checkout again." }, { status: 409 });
  }
  if (result.status === "already_completed") {
    return Response.json({ error: "This checkout has already been completed." }, { status: 409 });
  }
  if (result.status !== "completed") {
    return Response.json({ error: "This checkout has already been completed." }, { status: 409 });
  }

  const tickets = await Promise.all(
    result.tickets.map(async (ticket) => ({
      ...ticket,
      qrCodeDataUrl: await createQrCodeDataUrl(ticket.qrToken),
    })),
  );

  return Response.json({ ...result, tickets });
}
