import { TIKTOK_URL } from "@/components/site/nav-links";
import { buttonClasses } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { NEXT_LIVE } from "@/content/home";
import type { NextLive } from "@/lib/data/public";
import { formatLiveDate } from "@/lib/format";

export function NextLiveCard({ live }: { live: NextLive | null }) {
  return (
    <section className="mx-auto max-w-[1200px] px-4 pb-[4.5rem] sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-borda bg-superficie px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-1.5">
          <Eyebrow>{NEXT_LIVE.eyebrow}</Eyebrow>
          <span className="font-titulo text-[1.625rem] font-bold">
            {live ? formatLiveDate(live.startsAt) : NEXT_LIVE.placeholder}
          </span>
          <span className="text-[0.9375rem] text-texto-discreto">
            {live?.title ?? NEXT_LIVE.text}
          </span>
        </div>
        <a
          href={live?.url ?? TIKTOK_URL}
          className={buttonClasses("claro")}
          rel="noopener noreferrer"
          target="_blank"
        >
          {NEXT_LIVE.cta}
        </a>
      </div>
    </section>
  );
}
