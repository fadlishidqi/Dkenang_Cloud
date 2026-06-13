import { logoutAction } from "@/app/actions/login";
import { NotificationWatcher } from "@/components/notification-watcher";
import { Toaster } from "@/components/ui/toaster";
import { getSession } from "@/lib/auth/session";
import { DashboardNav } from "./nav";
import { RefreshButton } from "./refresh-button";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <main className="min-h-dvh overflow-x-hidden bg-zinc-50/50 text-zinc-900">
      <NotificationWatcher />
      <Toaster />
      <div className="flex min-h-dvh">
        <aside className="hidden w-64 border-r border-zinc-200 bg-white p-6 lg:block">
          <div className="flex items-center gap-2 px-2">
            <div className="size-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold">D</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                DKenang
              </p>
              <h1 className="text-sm font-bold tracking-tight text-zinc-900">
                Cloud & Notes
              </h1>
            </div>
          </div>
          <div className="mt-8">
            <DashboardNav />
          </div>
        </aside>
        <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
          <div className="mb-6 lg:hidden">
             <div className="mb-4 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold">D</div>
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                DKenang
              </p>
            </div>
            <DashboardNav orientation="horizontal" />
          </div>
          <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-zinc-500">
                Signed in as <span className="font-medium text-zinc-900">{session?.username ?? "admin"}</span>
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Dashboard
              </h2>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <RefreshButton />
              <form action={logoutAction} className="min-w-0 flex-1 sm:flex-none">
                <button className="h-9 w-full rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 sm:w-auto">
                  Logout
                </button>
              </form>
            </div>
          </header>
          <div className="mt-6">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
