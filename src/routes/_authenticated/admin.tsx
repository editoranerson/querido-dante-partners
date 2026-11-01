import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Ban, Check, Gift, Link2, Settings2, Ticket, Users, Wallet, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMe } from "@/lib/session";
import { PLAN_LABEL, brl, coinsToBRL } from "@/lib/referral";
import { StatusBadge } from "./dashboard";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel Admin — Dante Partners" }, { name: "description", content: "Gestão de embaixadores, raspadinhas e saques." }] }),
  component: Admin,
});

type Amb = { user_id: string; referral_code: string; coins: number; is_blocked: boolean; full_name: string | null; plan: string | null; visits: number; referrals: number; extra_tickets: number; tickets_used: number };

async function rpc(name: string, args?: Record<string, unknown>) {
  const { data, error } = await (supabase.rpc as unknown as (n: string, a?: object) => Promise<{ data: unknown; error: { message: string } | null }>)(name, args);
  if (error) throw new Error(error.message);
  const d = data as { ok?: boolean; error?: string } | null;
  if (d && d.ok === false) throw new Error(d.error ?? "Erro");
  return data;
}

function Admin() {
  const { data: me, isLoading } = useMe();
  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!me?.isAdmin) return <p className="text-muted-foreground">Acesso restrito a administradores.</p>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Painel <span className="text-gradient">Admin</span></h1>
      <Tabs defaultValue="amb">
        <TabsList className="flex-wrap">
          <TabsTrigger value="amb"><Users className="h-4 w-4" /> Embaixadores</TabsTrigger>
          <TabsTrigger value="scratch"><Ticket className="h-4 w-4" /> Raspadinhas</TabsTrigger>
          <TabsTrigger value="pix"><Wallet className="h-4 w-4" /> Saques Pix</TabsTrigger>
        </TabsList>
        <TabsContent value="amb"><Ambassadors /></TabsContent>
        <TabsContent value="scratch"><ScratchAdmin /></TabsContent>
        <TabsContent value="pix"><PixQueue /></TabsContent>
      </Tabs>
    </div>
  );
}

function useAmbassadors() {
  return useQuery({ queryKey: ["admin-amb"], queryFn: async () => ((await rpc("admin_list_ambassadors")) as Amb[]) ?? [] });
}

function Ambassadors() {
  const qc = useQueryClient();
  const list = useAmbassadors();
  const [search, setSearch] = useState("");
  const [grant, setGrant] = useState<Amb | null>(null);
  const [rules, setRules] = useState<Amb | null>(null);
  const [link, setLink] = useState<Amb | null>(null);
  const block = useMutation({
    mutationFn: (a: Amb) => rpc("admin_affiliate_block", { p_ambassador_id: a.user_id, p_blocked: !a.is_blocked, p_reason: a.is_blocked ? null : "Bloqueado pelo admin" }),
    onSuccess: () => { toast.success("Status atualizado"); qc.invalidateQueries({ queryKey: ["admin-amb"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = (list.data ?? []).filter((a) => `${a.full_name} ${a.referral_code}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <Input placeholder="Buscar por nome ou código" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      <div className="overflow-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Parceiro</TableHead><TableHead>Código</TableHead><TableHead>Saldo</TableHead><TableHead>Visitas / Indicados</TableHead><TableHead>Bilhetes</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((a) => (
              <TableRow key={a.user_id}>
                <TableCell><p className="text-sm font-medium">{a.full_name || "—"}</p><p className="text-xs text-muted-foreground">{PLAN_LABEL[a.plan ?? "free"] ?? a.plan}</p></TableCell>
                <TableCell className="font-mono text-xs">{a.referral_code}</TableCell>
                <TableCell className="text-sm">{a.coins.toLocaleString("pt-BR")}<p className="text-xs text-muted-foreground">{brl(coinsToBRL(a.coins))}</p></TableCell>
                <TableCell className="text-sm">{a.visits} / {a.referrals}</TableCell>
                <TableCell className="text-sm">{a.tickets_used}/{5 + Number(a.extra_tickets)}</TableCell>
                <TableCell>{a.is_blocked ? <Badge className="bg-destructive text-destructive-foreground">Bloqueado</Badge> : <Badge className="bg-success text-success-foreground">Ativo</Badge>}</TableCell>
                <TableCell className="space-x-1 whitespace-nowrap text-right">
                  <Button size="sm" variant="hero" onClick={() => setGrant(a)} title="Conceder raspadinhas"><Gift className="h-3 w-3" /></Button>
                  <Button size="sm" variant="secondary" onClick={() => setRules(a)} title="Regras de lote"><Settings2 className="h-3 w-3" /></Button>
                  <Button size="sm" variant="secondary" onClick={() => setLink(a)} title="Vincular indicado"><Link2 className="h-3 w-3" /></Button>
                  <Button size="sm" variant={a.is_blocked ? "secondary" : "destructive"} onClick={() => block.mutate(a)} title={a.is_blocked ? "Desbloquear" : "Bloquear"}><Ban className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <GrantDialog amb={grant} onClose={() => setGrant(null)} />
      <RulesDialog amb={rules} onClose={() => setRules(null)} />
      <LinkDialog amb={link} onClose={() => setLink(null)} />
    </section>
  );
}

function GrantDialog({ amb, onClose }: { amb: Amb | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const history = useQuery({
    queryKey: ["grants", amb?.user_id],
    enabled: !!amb,
    queryFn: async () => (await supabase.from("affiliate_scratch_grants").select("*").eq("ambassador_id", amb!.user_id).order("created_at", { ascending: false })).data ?? [],
  });
  const m = useMutation({
    mutationFn: () => rpc("admin_grant_scratch_tickets", { p_ambassador_id: amb!.user_id, p_amount: qty, p_note: note || null }),
    onSuccess: () => { toast.success(`${qty} raspadinha(s) liberada(s) para ${amb?.full_name || amb?.referral_code}`); setNote(""); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={!!amb} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Liberar raspadinhas — {amb?.full_name || amb?.referral_code}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Bilhetes extras são gratuitos e ampliam o limite padrão de 5. Usados: {amb?.tickets_used} / {5 + Number(amb?.extra_tickets ?? 0)}.</p>
        <div className="grid gap-3">
          <div className="space-y-1.5"><Label>Quantidade de raspadinhas extras</Label><Input type="number" min={1} max={100} value={qty} onChange={(e) => setQty(Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Observação (opcional)</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: bônus de campanha" /></div>
          <Button variant="hero" onClick={() => m.mutate()} disabled={m.isPending || qty < 1}>Liberar nova rodada</Button>
        </div>
        <div className="max-h-40 space-y-1 overflow-auto">
          {history.data?.map((g) => (
            <div key={g.id} className="flex justify-between text-xs"><span>+{g.extra_tickets} {g.note && `· ${g.note}`}</span><span className="text-muted-foreground">{new Date(g.created_at).toLocaleString("pt-BR")}</span></div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const RULE_FIELDS = [
  ["p_visit_batch_size", "Visitas por lote"], ["p_visit_batch_coins", "Coins por lote de visitas"], ["p_signup_coins", "Coins por cadastro"],
  ["p_credits_threshold", "Créditos por lote"], ["p_credits_coins_per", "Coins por lote de créditos"],
  ["p_dantes_threshold", "Dantes por lote"], ["p_dantes_coins_per", "Coins por lote de Dantes"],
] as const;

function RulesDialog({ amb, onClose }: { amb: Amb | null; onClose: () => void }) {
  const [v, setV] = useState<Record<string, string>>({});
  const m = useMutation({
    mutationFn: () => rpc("admin_save_custom_rules", {
      p_ambassador_id: amb!.user_id,
      ...Object.fromEntries(RULE_FIELDS.map(([k]) => [k, v[k] ? Number(v[k]) : null])),
      p_plan_coins_override: null,
    }),
    onSuccess: () => { toast.success("Regras salvas"); onClose(); setV({}); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={!!amb} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Regras personalizadas — {amb?.referral_code}</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">Deixe em branco para usar o padrão global.</p>
        <div className="grid grid-cols-2 gap-3">
          {RULE_FIELDS.map(([k, l]) => (
            <div key={k} className="space-y-1"><Label className="text-xs">{l}</Label><Input type="number" value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></div>
          ))}
        </div>
        <Button variant="hero" onClick={() => m.mutate()} disabled={m.isPending}>Salvar regras</Button>
      </DialogContent>
    </Dialog>
  );
}

function LinkDialog({ amb, onClose }: { amb: Amb | null; onClose: () => void }) {
  const [id, setId] = useState("");
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => rpc("admin_attach_referral", { p_ambassador_id: amb!.user_id, p_referred_id: id.trim() }),
    onSuccess: () => { toast.success("Indicado vinculado"); setId(""); onClose(); qc.invalidateQueries({ queryKey: ["admin-amb"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={!!amb} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Vincular indicado a {amb?.referral_code}</DialogTitle></DialogHeader>
        <div className="space-y-1.5"><Label>ID do usuário indicado</Label><Input value={id} onChange={(e) => setId(e.target.value)} placeholder="uuid" /></div>
        <Button variant="hero" onClick={() => m.mutate()} disabled={m.isPending || id.length < 30}>Vincular</Button>
      </DialogContent>
    </Dialog>
  );
}

function ScratchAdmin() {
  const qc = useQueryClient();
  const active = useQuery({ queryKey: ["scratch-active"], queryFn: async () => !!(await supabase.rpc("affiliate_scratch_event_active")).data });
  const cards = useQuery({ queryKey: ["scratch-cards"], queryFn: async () => (await supabase.from("affiliate_scratch_cards").select("*").order("code")).data ?? [] });
  const toggle = useMutation({
    mutationFn: (on: boolean) => rpc("admin_set_scratch_event", { p_active: on }),
    onSuccess: (_d, on) => { toast.success(on ? "Evento ligado" : "Evento desligado"); qc.invalidateQueries({ queryKey: ["scratch-active"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const [start, setStart] = useState(1);
  const [qty, setQty] = useState(10);
  const [mult, setMult] = useState("1.5");
  const bulk = useMutation({
    mutationFn: async () => {
      const rows = Array.from({ length: qty }, (_, i) => ({ code: `#${String(start + i).padStart(3, "0")}`, multiplier: Number(mult), is_active: true }));
      const { error } = await supabase.from("affiliate_scratch_cards").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(`${qty} bilhetes cadastrados`); qc.invalidateQueries({ queryKey: ["scratch-cards"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggleCard = async (id: string, on: boolean) => {
    const { error } = await supabase.from("affiliate_scratch_cards").update({ is_active: on }).eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["scratch-cards"] });
  };
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="space-y-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div><p className="font-display font-semibold">Evento global</p><p className="text-xs text-muted-foreground">{active.data ? "Ativo para todos" : "Desligado"}</p></div>
          <Switch checked={!!active.data} onCheckedChange={(v) => toggle.mutate(v)} />
        </div>
        <div className="space-y-3 border-t border-border pt-5">
          <p className="font-display font-semibold">Cadastro em lote</p>
          <div className="grid grid-cols-3 gap-2">
            <div><Label className="text-xs">Início</Label><Input type="number" min={1} value={start} onChange={(e) => setStart(Number(e.target.value))} /></div>
            <div><Label className="text-xs">Qtd.</Label><Input type="number" min={1} max={500} value={qty} onChange={(e) => setQty(Number(e.target.value))} /></div>
            <div><Label className="text-xs">Mult.</Label><Input type="number" step="0.1" min={1} value={mult} onChange={(e) => setMult(e.target.value)} /></div>
          </div>
          <p className="text-xs text-muted-foreground">Gera #{String(start).padStart(3, "0")} até #{String(start + qty - 1).padStart(3, "0")} com {mult}x</p>
          <Button variant="hero" className="w-full" onClick={() => bulk.mutate()} disabled={bulk.isPending}>Cadastrar bilhetes</Button>
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
        <p className="mb-3 font-display font-semibold">Bilhetes ({cards.data?.length ?? 0})</p>
        <div className="grid max-h-[480px] grid-cols-2 gap-2 overflow-auto sm:grid-cols-4">
          {cards.data?.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
              <div><p className="font-mono text-xs">{c.code}</p><p className="text-sm font-semibold text-primary">{Number(c.multiplier).toFixed(1)}x</p></div>
              <Switch checked={c.is_active} onCheckedChange={(v) => toggleCard(c.id, v)} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PixQueue() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("pendente");
  const q = useQuery({
    queryKey: ["admin-pix", status],
    queryFn: async () => (await supabase.from("affiliate_redemptions").select("*").eq("status", status).order("created_at", { ascending: true })).data ?? [],
  });
  const amb = useAmbassadors();
  const name = (id: string) => amb.data?.find((a) => a.user_id === id)?.full_name || amb.data?.find((a) => a.user_id === id)?.referral_code || id.slice(0, 8);
  const m = useMutation({
    mutationFn: ({ id, st }: { id: string; st: string }) => rpc("admin_affiliate_update_redemption", { p_redemption_id: id, p_status: st, p_note: null }),
    onSuccess: () => { toast.success("Pedido atualizado"); qc.invalidateQueries({ queryKey: ["admin-pix"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex gap-2">
        {["pendente", "pago", "rejeitado"].map((s) => (
          <Button key={s} size="sm" variant={status === s ? "hero" : "secondary"} onClick={() => setStatus(s)}>{{ pendente: "Pendentes", pago: "Pagos", rejeitado: "Rejeitados" }[s]}</Button>
        ))}
      </div>
      <div className="overflow-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Parceiro</TableHead><TableHead>Item</TableHead><TableHead>Valor</TableHead><TableHead>Chave Pix</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {q.data?.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-sm">{name(r.ambassador_id)}</TableCell>
                <TableCell className="text-xs">{r.item_name}</TableCell>
                <TableCell className="text-sm">{brl(coinsToBRL(r.coins_cost))}</TableCell>
                <TableCell className="font-mono text-xs">{r.pix_key_type}: {r.pix_key}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="space-x-1 text-right">
                  {r.status === "pendente" && (
                    <>
                      <Button size="sm" variant="hero" onClick={() => m.mutate({ id: r.id, st: "pago" })}><Check className="h-3 w-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => m.mutate({ id: r.id, st: "rejeitado" })}><X className="h-3 w-3" /></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!q.data?.length && <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">Nenhum pedido.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
