import "server-only";
import { getAuth } from "@/auth/server";
import { assertMaster, OrderError, verifiedPhone } from "./policy";

export async function principal(request: Request) {
  try {
    return (
      (await getAuth().api.getSession({ headers: request.headers }))?.user ??
      null
    );
  } catch {
    throw new OrderError(
      503,
      "인증 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    );
  }
}
export async function requireMaster(request: Request) {
  const user = await principal(request);
  assertMaster(user, process.env.ADMIN_USER_ID);
  return user!;
}
export async function requirePhone(request: Request) {
  const user = await principal(request);
  verifiedPhone(user);
  return user!;
}
export function assertSameOrigin(request: Request) {
  if (
    request.headers.get("origin") !==
    new URL(process.env.BETTER_AUTH_URL || request.url).origin
  )
    throw new OrderError(403, "허용되지 않은 요청입니다.");
}
export function replyError(error: unknown) {
  return Response.json(
    {
      ok: false,
      message:
        error instanceof OrderError
          ? error.message
          : "주문 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    },
    {
      status: error instanceof OrderError ? error.status : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
export async function readBody(
  request: Request,
): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length")) > 12000)
    throw new OrderError(413, "요청 내용이 너무 깁니다.");
  const text = await request.text();
  if (text.length > 12000)
    throw new OrderError(413, "요청 내용이 너무 깁니다.");
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new OrderError(400, "잘못된 요청입니다.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new OrderError(400, "잘못된 요청입니다.");
  return value;
}
