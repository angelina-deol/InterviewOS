// Anonymous visitor ID
// ---------------------
// InterviewOS has no login system (per the PRD's MVP scope), but it does run
// on a public URL, so each browser needs its own private data. This module
// generates a random ID once per browser and persists it in localStorage.
// Every API call attaches it via the X-Anon-Id header (see apiClient.ts),
// and the backend uses it to scope all sessions/questions to that visitor.
//
// This is NOT authentication: there's no password, no login screen, and no
// way to recover access if the visitor clears their browser storage or
// switches devices. That tradeoff is intentional — it keeps the "no
// accounts" promise while still giving each visitor their own space.

const STORAGE_KEY = "interviewos_anon_id";

export function getAnonId(): string {
  if (typeof window === "undefined") {
    // Server-side render has no localStorage; callers on the server should
    // not need an anon ID (all data calls happen client-side).
    throw new Error("getAnonId() can only be called in the browser");
  }

  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
