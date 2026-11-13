import { NextResponse } from "next/server";
import { resolveAtlasTreeUrl } from "@/lib/atlasTree";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url")?.trim() ?? "";

  if (!url) {
    return NextResponse.json({ ok: false, hashes: [], masteryEffects: {}, count: 0 }, { status: 400 });
  }

  const decoded = await resolveAtlasTreeUrl(url);
  if (!decoded) {
    return NextResponse.json({ ok: false, hashes: [], masteryEffects: {}, count: 0 });
  }

  return NextResponse.json({
    ok: true,
    hashes: decoded.hashes,
    masteryEffects: decoded.masteryEffects,
    count: decoded.hashes.length,
  });
}
