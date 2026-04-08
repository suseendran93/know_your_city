import { DEFAULT_REQUEST_TIMEOUT_MS } from "./constants";

type JsonRequestOptions = RequestInit & {
  timeoutMs?: number;
};

export async function fetchJson<T>(url: string, options: JsonRequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, headers, ...restOptions } = options;

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      Accept: "application/json",
      ...headers
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getAppIdentityHeaders() {
  const contactEmail = process.env.APP_CONTACT_EMAIL;

  return {
    "Accept-Language": "en",
    "User-Agent": contactEmail
      ? `KnowYourCity/0.1 (${contactEmail})`
      : "KnowYourCity/0.1"
  };
}
