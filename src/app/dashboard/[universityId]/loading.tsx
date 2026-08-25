function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-muted ${className ?? ""}`} />;
}

export default function UniversityDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <main className="flex flex-col gap-8">
        <Pulse className="h-4 w-32" />
        <header className="flex flex-col gap-3">
          <Pulse className="h-8 w-64 max-w-full" />
          <Pulse className="h-3 w-40" />
          <Pulse className="h-4 w-56" />
        </header>
        <Pulse className="h-16 w-full rounded-xl" />
        <Pulse className="h-72 w-full rounded-2xl" />
      </main>
    </div>
  );
}
