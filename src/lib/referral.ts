import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_SPONSOR_CODE = "VSSD";
export const AGGRESSIVE_HUNT_MODE = true;
export const MAIN_SITE = "https://queridodante.site";
const KEY = "aff_ref_code";
const PIXEL_KEY = "aff_pixel_done";
const RETENTION_MS = 2000;

/** Decide qual código fica salvo, dado o que veio na URL. */
export function resolveReferral(incoming: string | null, stored: string | null): string {
  if (AGGRESSIVE_HUNT_MODE) return DEFAULT_SPONSOR_CODE;
  return (incoming || stored || DEFAULT_SPONSOR_CODE).toUpperCase();
}

export function getReferralCode(): string {
  if (typeof window === "undefined") return DEFAULT_SPONSOR_CODE;
  return sessionStorage.getItem(KEY) || DEFAULT_SPONSOR_CODE;
}

export function mainSiteUrl(): string {
  return `${MAIN_SITE}?ref=${encodeURIComponent(getReferralCode())}`;
}

export function runReferralHunter() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const incoming = url.searchParams.get("ref") || url.searchParams.get("aff");
  const code = resolveReferral(incoming, sessionStorage.getItem(KEY));
  sessionStorage.setItem(KEY, code);

  if (url.searchParams.has("ref") || url.searchParams.has("aff")) {
    url.searchParams.delete("ref");
    url.searchParams.delete("aff");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }

  if (sessionStorage.getItem(PIXEL_KEY)) return;
  sessionStorage.setItem(PIXEL_KEY, "1");
  let session = sessionStorage.getItem("aff_session");
  if (!session) {
    session = crypto.randomUUID();
    sessionStorage.setItem("aff_session", session);
  }
  void (async () => {
    try {
      const { data } = await supabase.rpc("track_affiliate_visit", {
        p_code: DEFAULT_SPONSOR_CODE,
        p_ip_hash: "",
        p_session: session!,
      });
      const visitId = (data as { visit_id?: string } | null)?.visit_id;
      if (!visitId) return;
      setTimeout(() => {
        void supabase.rpc("confirm_visit_retention", { p_visit_id: visitId });
      }, RETENTION_MS);
    } catch {
      /* pixel silencioso */
    }
  })();
}

/** 100 Coins = R$ 0,01 → 10.000 Coins = R$ 1,00 */
export function coinsToBRL(coins: number): number {
  return coins / 10000;
}
export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 4 });

export const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  dante_plus: "Plus",
  dante_premium: "Premium",
  dante_premium_plus: "Premium+",
};
