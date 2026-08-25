"use client";

import { useActionState, useState } from "react";
import { signIn, signUp } from "./actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState(signIn, undefined);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, undefined);

  const state = mode === "signin" ? signInState : signUpState;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {mode === "signin" ? "Sign in" : "Create an account"}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Save your grades and target unis so they&apos;re ready before you call.
          </p>
        </div>

        <div className="flex rounded-full border border-zinc-300 p-1 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Sign up
          </button>
        </div>

        <form
          action={mode === "signin" ? signInAction : signUpAction}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
              className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {state.error}
            </p>
          )}
          {state?.message && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={signInPending || signUpPending}
            className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
      </main>
    </div>
  );
}
