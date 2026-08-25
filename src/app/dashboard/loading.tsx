function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-muted ${className ?? ""}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <main className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <Pulse className="h-8 w-72" />
          <Pulse className="h-4 w-96 max-w-full" />
        </header>

        <div className="flex flex-col gap-10">
          <Pulse className="h-14 w-full rounded-xl" />
          <div className="flex flex-col gap-3">
            <Pulse className="h-5 w-40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
