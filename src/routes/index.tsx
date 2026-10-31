import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Coins, Sparkles, Ticket, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mainSiteUrl } from "@/lib/referral";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dante Partners — Seja embaixador do Querido Dante" },
      { name: "description", content: "Indique o Querido Dante, ganhe Coins, multiplique com raspadinhas e saque via Pix." },
      { property: "og:title", content: "Dante Partners — Seja embaixador do Querido Dante" },
      { property: "og:description", content: "Indique, ganhe Coins e saque via Pix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: TrendingUp, t: "Métricas em tempo real", d: "Visitas, cadastros, assinaturas e créditos de IA." },
  { icon: Ticket, t: "Raspadinhas", d: "Multiplicadores de até vários x nos seus ganhos." },
  { icon: Coins, t: "Saque via Pix", d: "Converta seus Coins em reais quando quiser." },
];

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary font-display font-bold text-primary-foreground">D</span>
          <span className="font-display font-semibold">Dante Partners</span>
        </div>
        <a href={mainSiteUrl()} className="text-xs text-muted-foreground hover:text-foreground">Voltar ao Querido Dante</a>
      </header>
      <section className="relative mx-auto max-w-4xl px-5 pb-20 pt-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" /> Programa de Embaixadores
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-6xl">
          Indique o Dante. <span className="text-gradient">Ganhe de verdade.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Cada visita, cadastro e assinatura vira Coins na sua conta. Multiplique com raspadinhas e saque via Pix.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="hero" size="lg"><Link to="/auth">Entrar no painel <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
      <section className="relative mx-auto grid max-w-5xl gap-4 px-5 pb-24 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.t} className="rounded-2xl border border-border bg-card p-6">
            <f.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-display font-semibold">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
