import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderAlertSettings } from "@/db/schema";
import { validateOrderAlert } from "@/orders/admin-alert";
import { OrderError } from "@/orders/policy";
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
    const [settings] = await getDb()
      .select()
      .from(orderAlertSettings)
      .where(eq(orderAlertSettings.id, "new-order"));
    if (!settings) throw new OrderError(503, "알림 설정을 준비 중입니다.");
    return Response.json(
      {
        settings: {
          enabled: settings.enabled,
          recipient: settings.recipient,
          body: settings.body,
          revision: settings.revision,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return replyError(e);
  }
}
export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireMaster(request);
    const input = await readBody(request);
    const values = validateOrderAlert(input);
    if (typeof input.revision !== "string")
      throw new OrderError(400, "설정을 다시 불러와 주세요.");
    const revision = crypto.randomUUID();
    const saved = await getDb()
      .update(orderAlertSettings)
      .set({
        ...values,
        revision,
        updated_by: actor.id,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(orderAlertSettings.id, "new-order"),
          eq(orderAlertSettings.revision, input.revision),
        ),
      )
      .returning({ id: orderAlertSettings.id });
    if (!saved.length)
      throw new OrderError(
        409,
        "다른 곳에서 설정이 변경되었습니다. 저장된 설정을 다시 불러와 주세요.",
      );
    return Response.json({ ok: true, settings: { ...values, revision } });
  } catch (e) {
    return replyError(e);
  }
}
