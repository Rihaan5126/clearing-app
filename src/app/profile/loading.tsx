function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-muted ${className ?? ""}`} />;
}

export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <main className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <Pulse className="h-8 w-40" />
          <Pulse className="h-4 w-72 max-w-full" />
        </header>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Pulse key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
