import LandingPageClient from './page-client';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <LandingPageClient initialNowMs={Date.now()} />;
}
