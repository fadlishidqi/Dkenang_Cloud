"use client";

import { useState, useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-bold text-zinc-700" htmlFor="username">
          Username
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          className="h-11 bg-zinc-50 border-zinc-200 focus:bg-white"
          placeholder="Masukkan username"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-zinc-700" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="h-11 bg-zinc-50 border-zinc-200 focus:bg-white pr-10"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {state.error ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs text-destructive font-bold text-center leading-relaxed">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full font-bold shadow-md"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Memverifikasi...
          </>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  );
}
