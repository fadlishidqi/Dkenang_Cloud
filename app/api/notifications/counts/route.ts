import { getSession } from "@/lib/auth/session";
import { getDashboardCounts } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const counts = await getDashboardCounts();

  return Response.json(counts);
}
