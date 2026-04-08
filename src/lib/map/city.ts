export function normalizeCityName(city: string) {
  const normalized = city.trim().toLowerCase();

  if (normalized === "bangalore" || normalized === "bengaluru") {
    return "Bengaluru";
  }

  if (normalized === "chennai" || normalized === "madras") {
    return "Chennai";
  }

  return city.trim();
}

export function getOverpassCityPattern(city: string) {
  const normalized = city.trim().toLowerCase();

  if (normalized === "bangalore" || normalized === "bengaluru") {
    return "Bengaluru|Bangalore";
  }

  if (normalized === "chennai" || normalized === "madras") {
    return "Chennai|Madras";
  }

  return city.trim();
}
