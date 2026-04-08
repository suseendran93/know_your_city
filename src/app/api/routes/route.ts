import { NextRequest, NextResponse } from "next/server";
import { getRoute } from "@/lib/map";

type RouteRequestBody = {
  city?: string;
  start?: {
    lat?: number;
    lng?: number;
  };
  end?: {
    lat?: number;
    lng?: number;
  };
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RouteRequestBody;
  const city = body.city?.trim();
  const startLat = body.start?.lat;
  const startLng = body.start?.lng;
  const endLat = body.end?.lat;
  const endLng = body.end?.lng;

  if (
    !city ||
    typeof startLat !== "number" ||
    typeof startLng !== "number" ||
    typeof endLat !== "number" ||
    typeof endLng !== "number"
  ) {
    return NextResponse.json(
      { error: "Valid city and start/end coordinates are required in the request body." },
      { status: 400 }
    );
  }

  try {
    const route = await getRoute(
      { lat: startLat, lng: startLng },
      { lat: endLat, lng: endLng }
    );

    return NextResponse.json({ route });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch route.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
