import { prisma } from "@/lib/prisma";

// pg needs the Node.js runtime (not Edge), and the ping must hit the DB every
// time rather than being cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vercel Cron automatically sends `Authorization: Bearer $CRON_SECRET` when
  // the CRON_SECRET env var is set. Reject anything else so the endpoint can't
  // be triggered by random traffic.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, ranAt: new Date().toISOString() });
  } catch (error) {
    console.error("keep-alive ping failed", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
