import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 p-4 text-zinc-900 sm:p-6">
      <section className="w-full max-w-md">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xl sm:p-8">
          <div className="mb-6 sm:mb-8">
            <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-zinc-900 text-xl font-bold text-white sm:mb-6 sm:size-12 sm:text-2xl">D</div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
              DKenang
            </p>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
              Personal Cloud & Notes
            </h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">
              Kelola file dan catatan Anda dalam satu tempat yang aman dan rapi.
            </p>
          </div>
          <LoginForm />
          <p className="mt-8 text-center text-xs text-zinc-400 font-medium">
            &copy; {new Date().getFullYear()} DKenang. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
