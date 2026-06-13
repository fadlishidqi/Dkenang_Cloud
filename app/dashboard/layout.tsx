import { logoutAction } from "@/app/actions/login";
import { getSession } from "@/lib/auth/session";
import { DashboardNav } from "./nav";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,_rgba(45,212,191,0.16),_transparent_30%),linear-gradient(135deg,_#050505_0%,_#111827_50%,_#030712_100%)] text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-white/10 p-6 backdrop-blur-xl lg:block">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">
              DKenang
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal text-white">
              Cloud & Notes
            </h1>
          </div>
          <DashboardNav />
        </aside>
        <section className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mb-6 lg:hidden">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">
              DKenang
            </p>
            <DashboardNav orientation="horizontal" />
          </div>
          <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-400">
                Signed in as {session?.username ?? "admin"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                Dashboard
              </h2>
            </div>
            <form action={logoutAction}>
              <button className="h-10 w-full rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-zinc-100 backdrop-blur-xl transition hover:bg-white/15 sm:w-auto">
                Logout
              </button>
            </form>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
