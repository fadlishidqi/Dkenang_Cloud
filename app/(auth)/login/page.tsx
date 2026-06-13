import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-zinc-900">
      <section className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl">
          <div className="mb-8">
            <div className="size-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-2xl font-bold mb-6">D</div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
              DKenang
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
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
