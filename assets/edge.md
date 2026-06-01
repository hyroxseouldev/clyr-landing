amor: 8e4f2364-ddd7-4e65-8238-6951d67b4c42

anonkey:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidXJrc253bX
  l3enl0cGN0andzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDA4MDQsImV4cCI6MjA4NzUxNjgwNH0.A
  amszIdA3WYnGWl-vx1fjI70-QZM-59Ap8MzLAmNB8g

  주문 생성 API

  const SUPABASE_URL = "https://sburksnwmywzytpctjws.supabase.co";
  const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

  await fetch(`${SUPABASE_URL}/functions/v1/create-guest-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      tenantId: "8e4f2364-ddd7-4e65-8238-6951d67b4c42",
      buyerName: "홍길동",
      buyerPhone: "010-1234-5678",
      orderPayload: {
        programName: "AMOR 프로그램",
        storeName: "AMOR 랜딩",
        monthlyPriceKrw: 99000,
        durationMonths: 3,
      },
    }),
  });

  성공 응답:

  {
    "ok": true,
    "orderId": "..."
  }

  주문 조회 API

  await fetch(`${SUPABASE_URL}/functions/v1/lookup-guest-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      tenantId: "8e4f2364-ddd7-4e65-8238-6951d67b4c42",
      buyerName: "홍길동",
      buyerPhone: "010-1234-5678",
    }),
  });

  성공 응답:

  {
    "ok": true,
    "orders": [
      {
        "id": "...",
        "status": "pending",
        "order_payload": {
          "programName": "AMOR 프로그램",
          "monthlyPriceKrw": 99000,
          "durationMonths": 3
        },
        "created_at": "...",
        "confirmed_at": null,
        "canceled_at": null
      }
    ]
  }

  중요한 점: Edge Function은 verify_jwt: true로 배포했습니다. 그래서 정적 HTML에서
  Authorization: Bearer <anon key> 헤더가 필요합니다. 이 anon key는 브라우저에 노출
  가능한 공개 키이고, service role key는 절대 HTML에 넣으면 안 됩니다.

  보안 advisor에서 guest_orders에 “RLS enabled no policy” info가 떴는데, 이건 의도한
  상태입니다. 클라이언트가 테이블을 직접 못 치게 하고 Edge Function service role만 접
  근하게 만든 구조입니다.