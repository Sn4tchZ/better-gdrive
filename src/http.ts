/**
 * Drop-in replacement for `globalThis.fetch` (tests, proxies, custom clients).
 */
export type FetchLike = typeof globalThis.fetch;
