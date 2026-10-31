import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const [{ data: profile }, { data: isAdmin }] = await Promise.all([
        supabase.from("profiles").select("full_name, plan, plan_expires_at").eq("id", u.user.id).maybeSingle(),
        supabase.rpc("is_admin"),
      ]);
      const plan = profile?.plan_expires_at && new Date(profile.plan_expires_at) > new Date() ? profile.plan : "free";
      return {
        id: u.user.id,
        email: u.user.email ?? "",
        name: profile?.full_name || u.user.email?.split("@")[0] || "Parceiro",
        plan: plan || "free",
        isAdmin: !!isAdmin,
      };
    },
  });
}
