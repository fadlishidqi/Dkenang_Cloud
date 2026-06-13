import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(135deg,_#09090b_0%,_#111827_48%,_#020617_100%)] px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
              DKenang
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white">
              Personal Cloud Storage & Notes
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Masuk ke ruang pribadi untuk mengelola file, catatan, dan pencarian global.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
