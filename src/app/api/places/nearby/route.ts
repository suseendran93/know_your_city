import { NextRequest, NextResponse } from "next/server";
import { getNearbyPlaces } from "@/lib/map";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  const radius = Number(request.nextUrl.searchParams.get("radius") ?? "1500");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "20");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "Valid 'lat' and 'lng' query parameters are required." }, { status: 400 });
  }

  try {
    const places = await getNearbyPlaces(lat, lng, radius, limit);

    return NextResponse.json({ places });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch nearby places.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
