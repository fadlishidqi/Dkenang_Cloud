"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/login";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          className="h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60 focus:bg-white/15"
          defaultValue="wiwit"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60 focus:bg-white/15"
          required
        />
      </div>
      {state.error ? (
        <p className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-md bg-cyan-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Memverifikasi..." : "Masuk"}
      </button>
    </form>
  );
}
