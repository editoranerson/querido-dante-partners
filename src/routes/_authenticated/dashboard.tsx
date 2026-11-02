import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Eye, UserCheck, Crown, Bot, Coins, Zap, Ticket, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScratchCard } from "@/components/dante/ScratchCard";
import { MAIN_SITE, brl, coinsToBRL } from "@/lib/referral";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Painel do Embaixador — Dante Partners" }, { name: "description", content: "Suas métricas, links, raspadinhas e saques." }] }),
  component: Dashboard,
});

type Stats = { visits: number; retained: number; signups: number; active_subs: number; credits: number; scratch_expires_at: string | null };
type Scratch = { active: boolean; plan: string; accumulates: boolean; free_left: number; price: number; used: number; limit: number; multiplier: number; extra?: number };

const SOURCE_LABEL: Record<string, string> = {
  visit_batch: "Visitas",
  referral_signup: "Cadastros",
  referral_subscription: "Assinaturas",
  referral_credits: "Lotes de créditos",
  referral_dantes: "Dantes ganhos",
  scratch: "Raspadinhas",
  redemption: "Resgates",
  admin_adjust: "Ajuste admin",
  retention: "Saldo retido",
  retention_in: "Repasse recebido",
  wallet_transfer: "Transferência recebida",
};

function Dashboard() {
  const qc = useQueryClient();
  const account = useQuery({
    queryKey: ["aff-account"],
    queryFn: async () => (await supabase.rpc("check_affiliate_account")).data as { referral_code: string; coins: number; is_blocked: boolean } | null,
  });
  const become = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("ensure_affiliate_account");
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Agora você é embaixador!"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (account.isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!account.data)
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-gradient-card p-8 text-center">
        <Crown className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Torne-se embaixador</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ative sua conta de parceiro e comece a ganhar Coins.</p>
        <Button variant="hero" className="mt-6" onClick={() => become.mutate()} disabled={become.isPending}>Ativar minha conta</Button>
      </div>
    );

  const acc = account.data;
  return (
    <div className="space-y-8">
      {acc.is_blocked && <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm">Sua conta de embaixador está bloqueada. Fale com o suporte.</div>}
      <Metrics coins={acc.coins} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Links code={acc.referral_code} />
        <ScratchModule />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><Statement /></div>
        <Withdraw coins={acc.coins} />
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-border bg-card p-5 ${className}`}>{children}</section>;
}
function Title({ icon: I, children }: { icon: typeof Eye; children: React.ReactNode }) {
  return <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold"><I className="h-4 w-4 text-primary" />{children}</h2>;
}

function useCountdown(iso: string | null) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

function Metrics({ coins }: { coins: number }) {
  const stats = useQuery({ queryKey: ["aff-stats"], queryFn: async () => (await supabase.rpc("affiliate_my_stats")).data as Stats | null });
  const scratch = useQuery({ queryKey: ["scratch-status"], queryFn: async () => (await supabase.rpc("affiliate_scratch_status")).data as Scratch | null });
  const s = stats.data;
  const mult = Number(scratch.data?.multiplier ?? 1);
  const left = useCountdown(s?.scratch_expires_at ?? null);
  const items = [
    { icon: Eye, label: "Total de visitas", value: s?.visits ?? 0, sub: `${s?.retained ?? 0} retidas` },
    { icon: UserCheck, label: "Cadastros confirmados", value: s?.signups ?? 0 },
    { icon: Crown, label: "Assinaturas ativas", value: s?.active_subs ?? 0 },
    { icon: Bot, label: "Créditos de IA gerados", value: s?.credits ?? 0 },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-primary/30 bg-gradient-card p-6 shadow-glow md:col-span-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Coins className="h-4 w-4 text-primary" /> Saldo disponível</p>
        <p className="mt-2 font-display text-4xl font-bold">{coins.toLocaleString("pt-BR")} <span className="text-lg text-muted-foreground">Coins</span></p>
        <p className="mt-1 text-sm text-success">≈ {brl(coinsToBRL(coins))}</p>
        <p className="mt-1 text-xs text-muted-foreground">10.000 Coins = R$ 1,00</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Zap className="h-4 w-4 text-primary" /> Multiplicador ativo</p>
        <p className="mt-2 font-display text-4xl font-bold text-gradient">{mult.toFixed(1)}x</p>
        {left ? <Badge className="mt-2 bg-accent text-accent-foreground">Expira em {left}</Badge> : <p className="mt-2 text-xs text-muted-foreground">Raspe um bilhete para ativar</p>}
      </div>
      {items.map((m) => (
        <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
          <m.icon className="h-4 w-4 text-primary" />
          <p className="mt-3 text-xs text-muted-foreground">{m.label}</p>
          <p className="font-display text-2xl font-semibold">{Number(m.value).toLocaleString("pt-BR")}</p>
          {m.sub && <p className="text-xs text-muted-foreground">{m.sub}</p>}
        </div>
      ))}
    </div>
  );
}

function Links({ code }: { code: string }) {
  const links = [
    { label: "Link principal", url: `${MAIN_SITE}?ref=${code}` },
    { label: "Planos", url: `${MAIN_SITE}/planos?ref=${code}` },
    { label: "Chat com Dante", url: `${MAIN_SITE}/chat?ref=${code}` },
    { label: "Biblioteca", url: `${MAIN_SITE}/biblioteca?ref=${code}` },
  ];
  const copy = (u: string) => navigator.clipboard.writeText(u).then(() => toast.success("Link copiado!"));
  return (
    <Card>
      <Title icon={Copy}>Seus links de indicação</Title>
      <p className="mb-4 text-xs text-muted-foreground">Seu código: <span className="font-mono font-semibold text-foreground">{code}</span></p>
      <div className="space-y-2">
        {links.map((l) => (
          <div key={l.label} className="flex items-center gap-2 rounded-xl bg-secondary p-2 pl-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{l.label}</p>
              <p className="truncate font-mono text-xs">{l.url}</p>
            </div>
            <Button size="sm" variant="hero" onClick={() => copy(l.url)}><Copy className="h-3 w-3" /></Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScratchModule() {
  const qc = useQueryClient();
  const status = useQuery({ queryKey: ["scratch-status"], queryFn: async () => (await supabase.rpc("affiliate_scratch_status")).data as Scratch | null });
  const history = useQuery({
    queryKey: ["scratch-history"],
    queryFn: async () => (await supabase.from("affiliate_user_scratch_cards").select("*").order("revealed_at", { ascending: false })).data ?? [],
  });
  const st = status.data;
  const canScratch = !!st?.active && st.used < st.limit;

  async function reveal() {
    const { data, error } = await supabase.rpc("affiliate_scratch_draw");
    const r = data as { ok: boolean; error?: string; code: string; multiplier: number } | null;
    if (error || !r?.ok) { toast.error(r?.error ?? error?.message ?? "Erro no sorteio"); return null; }
    toast.success(`Bilhete ${r.code}: ${Number(r.multiplier).toFixed(1)}x!`);
    setTimeout(() => qc.invalidateQueries(), 2500);
    return { code: r.code, multiplier: r.multiplier };
  }

  return (
    <Card>
      <Title icon={Ticket}>Raspadinha</Title>
      {!st?.active ? (
        <p className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">O evento de raspadinhas está desligado no momento.</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">Usados {st.used}/{st.limit}</Badge>
            <Badge variant="outline">Grátis: {st.free_left}</Badge>
            {st.free_left === 0 && <Badge variant="outline">Próximo: {st.price} Coins</Badge>}
            {st.accumulates && <Badge className="bg-accent text-accent-foreground">Premium+: multiplicadores somam</Badge>}
          </div>
          <ScratchCard onReveal={reveal} disabled={!canScratch} />
        </>
      )}
      <div className="mt-4 max-h-40 space-y-1 overflow-auto">
        {history.data?.map((h) => {
          const valid = new Date(h.expires_at) > new Date();
          return (
            <div key={h.id} className="flex items-center justify-between rounded-lg px-2 py-1 text-xs odd:bg-secondary">
              <span className="font-mono">{h.code}</span>
              <span className="font-semibold text-primary">{Number(h.multiplier).toFixed(1)}x</span>
              <span className="text-muted-foreground">{h.obtained_by === "free" ? "Grátis" : `${h.coins_paid} Coins`}</span>
              <span className={valid ? "text-success" : "text-muted-foreground"}>{valid ? `até ${new Date(h.expires_at).toLocaleDateString("pt-BR")}` : "expirado"}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Statement() {
  const [filter, setFilter] = useState("all");
  const q = useQuery({
    queryKey: ["earnings"],
    queryFn: async () => (await supabase.from("affiliate_earnings").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [],
  });
  const rows = useMemo(() => (q.data ?? []).filter((r) => filter === "all" || r.source_type === filter), [q.data, filter]);
  const desc = (d: string) => {
    if (d.startsWith("{")) try { const j = JSON.parse(d); return j.visits ? `Lote de ${j.visits} visitas` : d; } catch { /* */ }
    return d;
  };
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Title icon={Coins}>Extrato</Title>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(SOURCE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="max-h-96 overflow-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead className="text-right">Coins</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-xs">{SOURCE_LABEL[r.source_type] ?? r.source_type}</TableCell>
                <TableCell className="max-w-[220px] truncate text-xs">{desc(r.source_description)}</TableCell>
                <TableCell className={`text-right font-mono text-sm ${r.amount >= 0 ? "text-success" : "text-destructive"}`}>{r.amount > 0 ? "+" : ""}{r.amount}</TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Nenhuma entrada ainda.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function Withdraw({ coins }: { coins: number }) {
  const qc = useQueryClient();
  const items = useQuery({
    queryKey: ["pix-items"],
    queryFn: async () => (await supabase.from("affiliate_shop_items").select("*").eq("is_active", true).eq("redemption_type", "pix_withdrawal").order("coins_cost")).data ?? [],
  });
  const redemptions = useQuery({
    queryKey: ["my-redemptions"],
    queryFn: async () => (await supabase.from("affiliate_redemptions").select("*").order("created_at", { ascending: false }).limit(10)).data ?? [],
  });
  const [itemId, setItemId] = useState("");
  const [key, setKey] = useState("");
  const [keyType, setKeyType] = useState("cpf");
  const item = items.data?.find((i) => i.id === itemId);
  const submit = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("affiliate_redeem", { p_item_id: itemId, p_pix_key: key, p_pix_key_type: keyType });
      const r = data as { ok: boolean; error?: string } | null;
      if (error) throw error;
      if (!r?.ok) throw new Error(r?.error === "insufficient_coins" ? "Coins insuficientes" : r?.error ?? "Erro");
    },
    onSuccess: () => { toast.success("Saque solicitado! Aguarde a aprovação."); setKey(""); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Card>
      <Title icon={Wallet}>Saque via Pix</Title>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}>
        <div className="space-y-1.5">
          <Label>Valor em Coins</Label>
          <Select value={itemId} onValueChange={setItemId}>
            <SelectTrigger><SelectValue placeholder="Escolha o valor" /></SelectTrigger>
            <SelectContent>
              {items.data?.map((i) => <SelectItem key={i.id} value={i.id}>{i.coins_cost.toLocaleString("pt-BR")} Coins</SelectItem>)}
            </SelectContent>
          </Select>
          {item && <p className="text-xs text-success">Você recebe {brl(coinsToBRL(item.coins_cost))}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Tipo de chave</Label>
          <Select value={keyType} onValueChange={setKeyType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cpf">CPF</SelectItem><SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="phone">Telefone</SelectItem><SelectItem value="random">Aleatória</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Chave Pix</Label><Input required value={key} onChange={(e) => setKey(e.target.value)} /></div>
        <Button type="submit" variant="hero" className="w-full" disabled={!item || submit.isPending || (item && item.coins_cost > coins)}>
          {item && item.coins_cost > coins ? "Saldo insuficiente" : "Solicitar saque"}
        </Button>
      </form>
      <div className="mt-5 space-y-1">
        {redemptions.data?.map((r) => (
          <div key={r.id} className="flex justify-between text-xs">
            <span className="truncate text-muted-foreground">{r.item_name}</span>
            <StatusBadge status={r.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls = status === "pago" || status === "aprovado" ? "bg-success text-success-foreground" : status === "recusado" || status === "rejeitado" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground";
  const label = { pendente: "Pendente", pago: "Pago", aprovado: "Pago", rejeitado: "Rejeitado", recusado: "Rejeitado" }[status] ?? status;
  return <Badge className={cls}>{label}</Badge>;
}
