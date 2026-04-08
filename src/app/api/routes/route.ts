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
    const rawMessage = error instanceof Error ? error.message : "Failed to fetch route.";
    const message = mapRouteError(rawMessage);

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function mapRouteError(message: string) {
  if (message.includes("Missing OPENROUTESERVICE_API_KEY")) {
    return "Routing service is not configured. Add OPENROUTESERVICE_API_KEY in environment variables.";
  }

  if (message.includes("status 401") || message.includes("status 403")) {
    return "Routing service authorization failed. Verify your OpenRouteService API key.";
  }

  if (message.includes("status 406")) {
    return "Routing service rejected the request format. Please retry with a different place pair.";
  }

  if (message.includes("status 429")) {
    return "Routing service rate limit reached. Please wait and try again.";
  }

  if (message.includes("status 5")) {
    return "Routing service is temporarily unavailable. Please try again shortly.";
  }

  return message;
}
