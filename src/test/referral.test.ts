import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { resolveReferral, coinsToBRL } from "@/lib/referral";

describe("regras de afiliado", () => {
  it("link de terceiro vira VSSD", () => expect(resolveReferral("OUTRO", null)).toBe("VSSD"));
  it("acesso direto grava VSSD", () => expect(resolveReferral(null, null)).toBe("VSSD"));
  it("10.000 coins = R$ 1,00", () => expect(coinsToBRL(10000)).toBe(1));
  it("100 coins = R$ 0,01", () => expect(coinsToBRL(100)).toBe(0.01));
});
