# AMOR LAB landing

Next.js 단일 프로젝트입니다. 패키지 매니저는 `pnpm@10.32.1`을 사용합니다.

## 로컬 실행

```sh
pnpm install --frozen-lockfile
cp .env.example .env
# .env에 환경변수 입력
pnpm dev
```

기존 `.env`가 있으면 복사 단계를 생략합니다. 기본 개발 주소는 `http://localhost:3000`입니다.

```sh
pnpm lint
pnpm build
pnpm start
```

## 구조

- `app/`: 페이지, 레이아웃, 전역 스타일
- `src/`: shadcn/ui 컴포넌트, 데이터, 다국어 설정
- `messages/`: 한국어·영어 번역
- `public/`: 이미지, 폰트, 영상
- `supabase/`: 별도로 배포하는 서버 함수와 설정. Next.js 타입 검사 및 ESLint 범위에서 제외됩니다.

## 배포

Next.js 앱의 Root Directory는 저장소 루트(`.`)입니다. 기존 배포 프로젝트가 `apps/amor`를 사용했다면 Vercel 대시보드에서 Root Directory 값을 비워 저장소 루트로 변경해야 합니다. Root Directory는 `vercel.json`으로 지정할 수 없습니다. 프레임워크와 설치·빌드 명령은 루트의 `vercel.json`에 지정되어 있습니다. 기존 환경변수를 배포 환경에도 설정합니다.
