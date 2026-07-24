import { getSession } from "@/lib/auth/session";
import { getNotificationSignature } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signature = await getNotificationSignature();

  return Response.json(signature);
}
