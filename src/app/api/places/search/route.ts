import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/map";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const city = request.nextUrl.searchParams.get("city")?.trim();
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Number(limitParam ?? "8");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required." }, { status: 400 });
  }
  if (!city) {
    return NextResponse.json({ error: "Query parameter 'city' is required." }, { status: 400 });
  }

  try {
    const places = await searchPlaces(query, city, Number.isNaN(limit) ? 8 : limit);

    return NextResponse.json({ places });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search places.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
