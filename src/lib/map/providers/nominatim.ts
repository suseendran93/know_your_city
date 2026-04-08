import { NOMINATIM_BASE_URL } from "@/lib/map/constants";
import { normalizeCityName } from "@/lib/map/city";
import { fetchJson, getAppIdentityHeaders } from "@/lib/map/request";
import type { PlaceResult } from "@/types/location";

type NominatimAddress = {
  city?: string;
  state?: string;
  country?: string;
};

type NominatimSearchResult = {
  place_id: number;
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: NominatimAddress;
};

function mapPlace(result: NominatimSearchResult): PlaceResult {
  const primaryName = result.name ?? result.display_name.split(",")[0]?.trim() ?? "Unknown place";

  return {
    id: String(result.place_id),
    name: primaryName,
    fullAddress: result.display_name,
    lat: Number(result.lat),
    lng: Number(result.lon),
    category: result.type,
    city: result.address?.city,
    state: result.address?.state,
    country: result.address?.country
  };
}

export async function searchPlaces(query: string, city: string, limit = 8) {
  const scopedQuery = `${query}, ${normalizeCityName(city)}, India`;
  const params = new URLSearchParams({
    q: scopedQuery,
    format: "jsonv2",
    addressdetails: "1",
    limit: String(limit)
  });

  const results = await fetchJson<NominatimSearchResult[]>(
    `${NOMINATIM_BASE_URL}/search?${params.toString()}`,
    {
      headers: getAppIdentityHeaders(),
      next: { revalidate: 3600 }
    }
  );

  return results.map(mapPlace);
}
