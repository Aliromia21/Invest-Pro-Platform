
export function toMediaUrl(maybeUrl?: string | null): string {
  const v = (maybeUrl ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;

  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const base = (apiBase ?? "").trim();

 
  const origin = base
    ? base.replace(/\/?api\/?$/i, "")
    : window.location.origin;

  if (v.startsWith("/")) return `${origin}${v}`;
  return `${origin}/${v}`;
}
