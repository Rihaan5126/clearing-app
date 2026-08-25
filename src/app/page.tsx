import Link from "next/link";
import { ClipboardList, PhoneCall, Search } from "lucide-react";
import { Button, Card } from "@/components/ui";

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
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, var(--accent-soft), transparent)",
          }}
        />
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            No UCAS login, ever — access isn&apos;t gated on your status
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Clearing, without the panic.
          </h1>
          <p className="max-w-xl text-base text-muted text-balance">
            Live vacancy data, your grades matched against what&apos;s open, and a
            phone script ready before you dial &mdash; whether you&apos;re holding a
            firm place, waiting to hear back, or already self-releasing.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button as={Link} href="/dashboard" variant="primary" className="px-8">
              Browse vacancies
            </Button>
            <Button as={Link} href="/profile" variant="secondary" className="px-8">
              Set up my profile
            </Button>
          </div>
        </div>
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
