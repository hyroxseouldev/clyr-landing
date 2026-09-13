import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { messageTemplates } from "@/db/schema";
import {
  DEFAULT_PAYMENT_TEMPLATE,
  validateTemplate,
} from "@/orders/message-template";
import {
  assertSameOrigin,
  readBody,
  replyError,
  requireMaster,
} from "@/orders/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await requireMaster(request);
    const [template] = await getDb()
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.id, "payment-confirmed"));
    return Response.json(
      { body: template?.body ?? DEFAULT_PAYMENT_TEMPLATE, saved: !!template },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return replyError(error);
  }
}
export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireMaster(request);
    const body = validateTemplate((await readBody(request)).body);
    await getDb()
      .insert(messageTemplates)
      .values({ id: "payment-confirmed", body, updated_by: actor.id })
      .onConflictDoUpdate({
        target: messageTemplates.id,
        set: { body, updated_by: actor.id, updated_at: new Date() },
      });
    return Response.json({ ok: true });
  } catch (error) {
    return replyError(error);
  }
}
