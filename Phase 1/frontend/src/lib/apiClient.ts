import { getAnonId } from "./anonId";

// Minimal fetch wrapper for talking to the InterviewOS backend. Every call
// attaches X-Anon-Id automatically so Phase 2+ features don't have to
// remember to do it themselves — see anonId.ts for why this header exists.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "X-Anon-Id": getAnonId(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.error ? `${body.message}: ${body.error}` : body.message;
    throw new Error(detail || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}
