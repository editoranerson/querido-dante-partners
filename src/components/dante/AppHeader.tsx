import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LogOut, Shield, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/session";
import { mainSiteUrl, PLAN_LABEL } from "@/lib/referral";

export function AppHeader() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary font-display font-bold text-primary-foreground shadow-glow">D</span>
          <span className="hidden font-display text-sm font-semibold sm:block">Dante Partners</span>
        </Link>
        <nav className="ml-4 flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard" activeProps={{ className: "text-primary" }}><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Painel</span></Link>
          </Button>
          {me?.isAdmin && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin" activeProps={{ className: "text-primary" }}><Shield className="h-4 w-4" /><span className="hidden sm:inline">Admin</span></Link>
            </Button>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a href={mainSiteUrl()} className="hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:flex">
            <ArrowLeft className="h-3 w-3" /> Voltar ao Querido Dante
          </a>
          {me && (
            <>
              <Badge className="bg-accent text-accent-foreground">{PLAN_LABEL[me.plan] ?? me.plan}</Badge>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold uppercase" title={me.email}>
                {me.name.slice(0, 1)}
              </span>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair"><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border py-6 text-center text-xs text-muted-foreground">
      <a href={mainSiteUrl()} className="inline-flex items-center gap-1 hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Voltar ao Querido Dante
      </a>
    </footer>
  );
}
