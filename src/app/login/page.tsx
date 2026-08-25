"use client";

import { useActionState, useState } from "react";
import { signIn, signUp } from "./actions";
import { Card, buttonClasses, inputClasses, labelClasses } from "@/components/ui";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState(signIn, undefined);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, undefined);

  const state = mode === "signin" ? signInState : signUpState;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Card className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in" : "Create an account"}
          </h1>
          <p className="text-sm text-muted">
            Save your grades and target unis so they&apos;re ready before you call.
          </p>
        </div>

        <div className="flex rounded-full border border-border bg-surface-muted p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signin" ? "bg-accent text-accent-foreground" : "text-muted"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signup" ? "bg-accent text-accent-foreground" : "text-muted"
            }`}
          >
            Sign up
          </button>
        </div>

        <form
          action={mode === "signin" ? signInAction : signUpAction}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClasses}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className={labelClasses}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
              className={inputClasses}
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
            className={buttonClasses("primary", "w-full")}
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
      </Card>
    </div>
  );
}
