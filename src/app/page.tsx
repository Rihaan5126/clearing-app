export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            UK Clearing Helper
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Live vacancies, your grades, and a phone script ready before you
            dial.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="/profile"
            className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Set up my profile
          </a>
          <a
            href="/dashboard"
            className="flex h-12 w-full items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Browse vacancies
          </a>
        </div>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
          No UCAS login required. Every feature here is available whether
          you&apos;re holding a firm place, waiting to hear back, or already
          self-releasing.
        </p>
      </main>
    </div>
  );
}
