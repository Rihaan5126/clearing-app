import Image from "next/image";
import Link from "next/link";
import { ClipboardList, PhoneCall, Search } from "lucide-react";
import { Card } from "@/components/ui";

const FEATURES = [
  {
    icon: Search,
    title: "Browse live vacancies",
    body: "See every university we track in one place, with vacancy status, subject filters, and a one-tap number to call.",
  },
  {
    icon: ClipboardList,
    title: "Save your grades once",
    body: "Add your results, top 3 target universities, and backup courses. We match them against what's actually open.",
  },
  {
    icon: PhoneCall,
    title: "Walk into the call ready",
    body: "Generate a short script covering who you are, your grades, and a fallback ask if the course is full — edit it, then save it per university.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate flex min-h-[85vh] items-center overflow-hidden">
        <Image
          src="/campus/durham-castle.jpg"
          alt="Durham Castle, part of Durham University's campus"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,14,0.55) 0%, rgba(8,8,14,0.72) 55%, rgba(8,8,14,0.88) 100%)",
          }}
        />

        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
            No UCAS login, ever — access isn&apos;t gated on your status
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            Clearing, without the panic.
          </h1>
          <p className="max-w-xl text-base text-balance text-white/80">
            Live vacancy data, your grades matched against what&apos;s open, and a
            phone script ready before you dial &mdash; whether you&apos;re holding a
            firm place, waiting to hear back, or already self-releasing.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-8 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Browse vacancies
            </Link>
            <Link
              href="/profile"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Set up my profile
            </Link>
          </div>
        </div>

        <a
          href="https://commons.wikimedia.org/wiki/File:Durham_Castle_from_the_courtyard.jpg"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-4 text-xs text-white/50 hover:text-white/80"
        >
          Durham Castle, Christophe Meneboeuf (CC BY-SA 4.0)
        </a>
      </section>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 py-16 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="flex flex-col gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="text-sm text-muted">{body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
