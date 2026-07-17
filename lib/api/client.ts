// Single entry point for talking to the FastAPI backend.
//
// Every request goes through here: it prefixes the base URL
// (NEXT_PUBLIC_API_URL), performs the request, normalises error handling and
// returns typed data. This is also where the admin auth token will be attached
// later on.

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined. Check your .env.local file.",
  );
}

/** Error carrying the HTTP status and the message the API returned in `detail`. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Performs a request against the API and returns the parsed JSON body.
 * The generic `T` tells TypeScript the expected shape of the response.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // A FormData body (image uploads) must set its own multipart Content-Type,
  // including the boundary fetch generates — forcing JSON here would corrupt it.
  const isFormData = init?.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    // The API returns errors in the shape { "detail": "message" }.
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // No JSON body — keep the status text.
    }
    throw new ApiError(response.status, detail);
  }

  // 204 No Content (e.g. a DELETE) has no body to parse.
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
