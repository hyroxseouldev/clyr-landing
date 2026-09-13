import { getAuth } from "@/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: Request) {
  if (process.env.AUTH_ENABLED !== "true") {
    return Response.json(
      { code: "AUTH_NOT_ENABLED", message: "휴대폰 인증을 준비 중입니다." },
      { status: 503 },
    );
  }
  let auth: ReturnType<typeof getAuth>;
  try {
    auth = getAuth();
  } catch {
    return Response.json(
      {
        code: "AUTH_NOT_CONFIGURED",
        message: "휴대폰 인증 설정을 확인해 주세요.",
      },
      { status: 503 },
    );
  }
  return auth.handler(request);
}
export { handler as GET, handler as POST };
