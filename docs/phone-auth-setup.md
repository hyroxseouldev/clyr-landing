# 주문·마스터·문자 운영 가이드

## 현재 구성

- 인증: Better Auth. 주문자는 SOLAPI 휴대폰 OTP, 마스터는 이메일·비밀번호.
- 저장: Neon PostgreSQL + Drizzle. 주문·문자 템플릿·발송 상태·처리 이력을 Neon에 저장합니다.
- `/ko/order`, `/en/order`: 휴대폰 인증 후 무통장 입금 주문. 금액과 계좌는 서버 기준이며 주문 요청 ID로 재시도 중복을 방지합니다.
- `/ko/lookup`, `/en/lookup`: 인증된 휴대폰의 주문만 조회합니다. 기존 이관 주문도 같은 번호로 조회할 수 있습니다.
- `/admin`: 외부 리다이렉트 없는 주문 마스터. 서버의 `ADMIN_USER_ID`에 등록된 계정만 접근합니다. 이메일이 같다는 이유만으로 관리자 권한을 부여하지 않습니다. 공개 이메일 회원가입은 차단합니다.

Neon 프로젝트 `amorlab` (`still-truth-25013404`, Singapore, PostgreSQL 17)의 `development`와 `production`에 마이그레이션을 적용했습니다. 기존 AMOR 주문 8건의 ID·상태·일시를 유지해 양쪽에 이관했습니다. 이관으로 고객 문자를 보내지는 않습니다. 마스터 이메일은 `admin@amorlab.kr`이며 비밀번호는 DB에 해시로 저장합니다.

## 입금 확인 → 문자

1. 마스터 로그인 후 **입금 확인 자동 문자**를 펼칩니다.
2. 예시 문구를 검토·수정하고 **템플릿 저장**을 누릅니다. 처음에는 저장된 템플릿이 없으므로 입금 확인 전에 저장해야 합니다.
3. 실제 계좌 입금을 확인한 뒤 주문의 **입금 확인**을 누릅니다.
4. 확인 창에서 처리하면 주문 상태와 문자 발송 대기 기록이 같은 DB 트랜잭션으로 저장됩니다. 이후 SOLAPI LMS를 발송합니다.

치환 항목: `{{이름}}`, `{{프로그램}}`, `{{기간}}`, `{{금액}}`, `{{주문번호}}`. 미리보기는 예시 주문입니다. 최대 600자, 치환 결과 1,900 UTF-8 바이트 이내입니다. 저장된 문구의 사본을 주문별로 보관하므로 템플릿을 수정해도 기존 발송 대기 문구는 바뀌지 않습니다.

- **발송 접수 완료**: SOLAPI가 접수를 수락한 상태입니다. 휴대폰 도착 여부는 SOLAPI 발송 내역에서 확인하세요.
- **발송 실패 / 발송 대기**: 마스터에서 재발송할 수 있습니다. 입금 확인 상태는 유지됩니다.
- **결과 불명 / 접수 중 장기 지속**: 네트워크 중단 또는 프로세스 종료 가능성이 있습니다. 중복 발송을 막기 위해 자동 재시도하지 않습니다. SOLAPI에서 해당 주문번호(`customFields.orderId`)의 발송 결과를 확인한 뒤 운영자가 처리해야 합니다.
- 입금 확인·취소는 `pending` 주문에만 적용됩니다. 동시 확인과 중복 클릭은 한 번만 처리됩니다. 취소 버튼은 실제 은행 환불을 실행하지 않습니다.
- 템플릿 저장과 조회는 문자를 보내지 않습니다. 입금 확인과 재발송은 실제 발송 요금이 발생합니다.

## 환경변수 및 배포

`.env.local`은 개발 DB와 로컬 `http://localhost:3010`을 사용합니다. 운영 연결과 관리자 ID는 `.env.neon-production.local`에 별도 저장했습니다. 두 파일 모두 Git 제외 대상입니다. 운영 파일은 Next.js가 자동으로 로드하지 않습니다.

Vercel 운영 환경에 다음 항목을 설정하고 새 코드를 배포해야 운영 사이트가 전환됩니다. 이번 작업에서 Vercel 설정·배포는 실행하지 않았습니다.

| 변수 | 설정 |
| --- | --- |
| `AUTH_ENABLED` | `true` |
| `BETTER_AUTH_URL` | 운영의 정확한 HTTPS origin, 예: `https://www.amorlab.kr` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32`로 생성한 고정 비밀키 |
| `DATABASE_URL` | 해당 환경의 Neon pooled URL |
| `DATABASE_URL_UNPOOLED` | 같은 브랜치의 direct URL, 마이그레이션용 |
| `ADMIN_USER_ID` | 해당 DB에 만들어진 마스터 계정 ID, 운영 파일 참조 |
| `SOLAPI_API_KEY`, `SOLAPI_API_SECRET` | 랜딩 전용 `AMORLAB Landing` 키 |
| `SOLAPI_SENDER_NUMBER` | SOLAPI 승인 발신번호, 숫자만 |

SOLAPI 랜딩 키 만료일은 2027-09-13입니다. 동적 배포 IP를 위해 모든 IP를 허용하며 기존 모바일앱 `AMORLAB` 키는 유지했습니다. 비밀키는 `NEXT_PUBLIC_` 환경변수나 소스 코드에 넣지 마세요.

주문과 인증 런타임은 Supabase를 사용하지 않습니다. 기존 이미지 URL은 Supabase Storage를 계속 가리킬 수 있습니다. 원본 주문과 Edge Functions는 삭제·변경하지 않았습니다. 전환 전 구 사이트에서 추가 주문이 발생했다면 최종 이관을 다시 실행해야 하며, 이관 스크립트는 기존 Neon 주문을 덮어쓰지 않습니다. 기존 주문의 상태가 원본에서 변경됐다면 별도 대조가 필요합니다. 구 Edge Functions를 종료할 때는 공유 프로젝트의 다른 테넌트 영향을 먼저 확인하세요.

## 개발 명령

```sh
pnpm dev --port 3010
pnpm db:generate
pnpm db:migrate
pnpm test:auth
pnpm test:orders
pnpm lint
pnpm build
```

`db:migrate`는 direct 연결만 사용합니다. 빌드·시작 시 자동 마이그레이션하지 않습니다. 변경은 개발 브랜치에서 검증한 뒤 운영에 적용합니다.

`pnpm exec tsx scripts/import-legacy-orders.ts [--production]`은 로컬에 보관된 기존 Supabase 서버 키로 AMOR 테넌트만 읽어서 이관합니다. 원본을 수정하지 않습니다. `scripts/provision-master.ts`는 프로세스 환경의 `MASTER_EMAIL`, `MASTER_PASSWORD`로 신규 마스터를 생성하고 해당 환경 파일에 관리자 ID를 기록합니다. 기존 계정의 암호는 자동 변경하지 않습니다.

테스트는 격리된 PostgreSQL(PGlite)과 가짜 문자 전송기를 사용합니다. 실제 문자 도착은 검증하지 않습니다. 휴대폰 인증은 번호 소유 확인이며 통신사 CI/DI 본인확인 서비스는 아닙니다.

## 무통장 입금 계좌 관리

`/admin`의 **무통장 입금 정보**에서 은행명·계좌번호·예금주를 수정합니다.
`bank_settings` 테이블에 저장하며 마스터 계정만 변경할 수 있습니다.
공개 주문 화면은 `/api/bank-account`에서 현재 계좌를 읽습니다. 저장 충돌은
revision으로 차단하고, 주문 작성 중 계좌가 변경되면 새로고침 후 재확인하도록 안내합니다.
새 주문에는 서버의 계좌 정보를 복사해 저장하므로 이후 계좌를 변경해도 기존 주문의
입금 안내는 유지됩니다. 주문 조회와 마스터 주문 목록에서도 해당 계좌를 확인할 수 있습니다.
`0003` 마이그레이션은 기존 안내 계좌를 초기값으로 추가합니다.

## 모바일 프로그램 이용권 연결

입금 확인 트랜잭션에서 Neon `order_grants`와 안내 문자 요청을 함께 저장합니다.
서버가 Supabase `upsert_amor_landing_grant` RPC를 호출하면
`amor_landing_grants`에 주문번호 기준으로 대기 이용권이 생성됩니다.
프로그램 ID는 랜딩과 AMOR 앱에 동일한 ID를 사용합니다.

- 서버 환경변수: `MOBILE_SUPABASE_URL`, `MOBILE_SUPABASE_SERVICE_ROLE_KEY`.
  앱 프로젝트 `sburksnwmywzytpctjws`, AMOR tenant `8e4f2364-ddd7-4e65-8238-6951d67b4c42`.
  키는 클라이언트에 노출하지 않습니다. 로컬에는 설정했으며 Vercel 환경변수 설정과 배포는 별도입니다.
- 가입 전: 대기 상태로 보관. 앱의 **문자 인증 + AMOR 온보딩 완료** 후 인증된 번호와
  프로필 번호가 일치하면 DB 트리거가 기존 `program_entitlements`에 지급합니다.
  `user_metadata`나 번호 입력만으로는 지급하지 않습니다.
- 이미 가입·인증한 회원: 발급 요청 즉시 지급됩니다. 새 프로그램은 수령 시점부터
  구매한 개월 수만큼 지급하며, 같은 프로그램 재구매는 기존 이용권의 종료일 뒤로 연장합니다.
  무기한 이용권이 있다면 이를 유지하고 주문 수령 기록만 남깁니다.
- `source_landing_order_id`는 신규 이용권의 출처이며, 모든 신규/연장 주문은
  `amor_landing_grants.entitlement_id`로 대상 이용권을 추적합니다.
- 네트워크 오류는 동일 주문번호로 최대 3회 시도합니다. 지속 실패는 입금 완료를 유지하고
  마스터에 발급 실패로 표시합니다. **발급 재시도**로 복구할 수 있습니다.
  중단된 처리의 잠금은 3분 후 재시도할 수 있습니다. 백그라운드 스케줄러는 아직 없습니다.
- 마스터의 **수령 상태 확인**으로 앱 수령 상태를 동기화합니다. 수령 대기는 앱 가입 전
  정상 상태이며, 지급 완료일/기간을 표시합니다.
- 안내 문자는 앱 DB의 대기 이용권 생성 또는 지급 성공 뒤 발송합니다.
  기존 SOLAPI의 실패/결과 불명 처리 규칙을 유지합니다.
- 기존에 입금 확인된 주문은 소급 발급하지 않습니다. 테스트에서도 실주문 상태 변경이나
  실제 SMS 발송을 하지 않습니다.
- 기존 `entitlement_auto_grants`의 운영 흐름은 별개입니다. 새 큐는 RLS를 켜고
  anon/authenticated 접근과 RPC 실행을 차단했습니다. RLS 정책 없음 INFO는
  서비스 전용 테이블의 의도된 차단입니다.

마이그레이션: Supabase `20260913152700`, `20260913153311`; Neon `0004`.
검증: `pnpm test:mobile-grants`, `pnpm test:orders`, `pnpm test:auth`, `pnpm build`.
새 회원 대기/인증 완료/기존 회원/재구매/중복 요청/권한 차단은 격리 PostgreSQL 테스트로 확인합니다.
실제 Supabase에서는 지급·재요청을 트랜잭션 내부에서 검증하고 ROLLBACK하여 운영 데이터를 보존합니다.
