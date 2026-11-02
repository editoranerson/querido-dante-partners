import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, Percent, Plus, Send, Shuffle, Trash2, Vault, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMe } from "@/lib/session";
import { brl, coinsToBRL } from "@/lib/referral";

export const Route = createFileRoute("/_authenticated/carteira")({
  head: () => ({
    meta: [
      { title: "Carteira Dante — Dante Partners" },
      { name: "description", content: "Carteira Dante: saldo, rendimentos, retenções e transferências de Coins." },
      { property: "og:title", content: "Carteira Dante — Dante Partners" },
      { property: "og:description", content: "Gestão da Carteira Dante e retenções de Coins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Carteira,
});

type Amb = { user_id: string; referral_code: string; full_name: string | null; coins: number };
type Dest = { type: "wallet" | "ambassador"; ambassador_id?: string; percent: number };
type Rule = { id: string; ambassador_id: string; description: string; destinations: Dest[]; is_active: boolean; created_at: string };

async function rpc(name: string, args?: Record<string, unknown>) {
  const { data, error } = await (supabase.rpc as unknown as (n: string, a?: object) => Promise<{ data: unknown; error: { message: string } | null }>)(name, args);
  if (error) throw new Error(error.message);
  const d = data as { ok?: boolean; error?: string } | null;
  if (d && d.ok === false) throw new Error(d.error ?? "Erro");
  return data;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const PERIOD: Record<string, string> = { day: "Dia", week: "Semana", month: "Mês" };
const KIND: Record<string, string> = { retention: "Retenção recebida", yield: "Rendimento", transfer: "Transferência enviada", auto_dist: "Distribuição automática" };

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6 ${className}`}>{children}</div>;
}

function useAmbs() {
  return useQuery({ queryKey: ["admin-amb"], queryFn: async () => ((await rpc("admin_list_ambassadors")) as Amb[]) ?? [] });
}
const ambName = (list: Amb[] | undefined, id?: string | null) => {
  const a = list?.find((x) => x.user_id === id);
  return a ? `${a.full_name || "Sem nome"} (${a.referral_code})` : "—";
};

function AmbSelect({ value, onChange, list }: { value: string; onChange: (v: string) => void; list?: Amb[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="text-base sm:text-sm"><SelectValue placeholder="Escolha o embaixador" /></SelectTrigger>
      <SelectContent>
        {(list ?? []).map((a) => <SelectItem key={a.user_id} value={a.user_id}>{a.full_name || "Sem nome"} ({a.referral_code})</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Carteira() {
  const { data: me, isLoading } = useMe();
  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!me?.isAdmin) return <p className="text-muted-foreground">Área restrita.</p>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Carteira <span className="text-gradient">Dante</span></h1>
      <WalletSummary />
      <Tabs defaultValue="ledger">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="ledger">Extrato</TabsTrigger>
          <TabsTrigger value="retention">Retenções</TabsTrigger>
          <TabsTrigger value="dist">Distribuição automática</TabsTrigger>
          <TabsTrigger value="transfer">Transferir</TabsTrigger>
          <TabsTrigger value="yield">Rendimento</TabsTrigger>
        </TabsList>
        <TabsContent value="ledger"><Ledger /></TabsContent>
        <TabsContent value="retention"><Retentions /></TabsContent>
        <TabsContent value="dist"><AutoDist /></TabsContent>
        <TabsContent value="transfer"><Transfer /></TabsContent>
        <TabsContent value="yield"><YieldCfg /></TabsContent>
      </Tabs>
    </div>
  );
}

function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => (await db.from("dante_wallet").select("*").eq("id", 1).maybeSingle()).data as { balance: number; yield_pct: number; yield_period: string; last_yield_at: string } | null,
  });
}

function WalletSummary() {
  const qc = useQueryClient();
  const w = useWallet();
  useEffect(() => {
    rpc("dante_wallet_apply_yield").then(() => { qc.invalidateQueries({ queryKey: ["wallet"] }); qc.invalidateQueries({ queryKey: ["wallet-ledger"] }); }).catch(() => {});
  }, [qc]);
  const bal = Number(w.data?.balance ?? 0);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="shadow-glow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Vault className="h-4 w-4 shrink-0" /> Saldo da Carteira</div>
        <p className="mt-2 break-all font-display text-3xl font-bold">{bal.toLocaleString("pt-BR")} <span className="text-base text-muted-foreground">Coins</span></p>
        <p className="text-sm text-muted-foreground">≈ {brl(coinsToBRL(bal))}</p>
      </Card>
      <Card>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Percent className="h-4 w-4 shrink-0" /> Rendimento</div>
        <p className="mt-2 font-display text-3xl font-bold">{Number(w.data?.yield_pct ?? 0)}% <span className="text-base text-muted-foreground">/ {PERIOD[w.data?.yield_period ?? "month"]}</span></p>
        <p className="text-sm text-muted-foreground">Aplicado automaticamente a cada período.</p>
      </Card>
    </div>
  );
}

function Ledger() {
  const amb = useAmbs();
  const q = useQuery({ queryKey: ["wallet-ledger"], queryFn: async () => (await db.from("dante_wallet_ledger").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [] });
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Embaixador</TableHead><TableHead className="text-right">Coins</TableHead></TableRow></TableHeader>
          <TableBody>
            {(q.data as { id: string; created_at: string; kind: string; description: string; ambassador_id: string | null; amount: number }[]).map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{r.amount >= 0 ? <ArrowDownLeft className="mr-1 inline h-3 w-3 text-success" /> : <ArrowUpRight className="mr-1 inline h-3 w-3 text-destructive" />}{KIND[r.kind] ?? r.kind}</TableCell>
                <TableCell className="text-xs">{r.description}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{r.ambassador_id ? ambName(amb.data, r.ambassador_id) : "—"}</TableCell>
                <TableCell className={`text-right font-mono text-sm ${r.amount >= 0 ? "text-success" : "text-destructive"}`}>{r.amount > 0 ? "+" : ""}{Number(r.amount).toLocaleString("pt-BR")}</TableCell>
              </TableRow>
            ))}
            {!q.data?.length && <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Sem movimentações ainda.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function Retentions() {
  const qc = useQueryClient();
  const amb = useAmbs();
  const rules = useQuery({ queryKey: ["retention-rules"], queryFn: async () => ((await db.from("coin_retention_rules").select("*").order("created_at", { ascending: false })).data ?? []) as Rule[] });
  const [ambId, setAmbId] = useState("");
  const [desc, setDesc] = useState("");
  const [retro, setRetro] = useState(true);
  const [dests, setDests] = useState<Dest[]>([{ type: "wallet", percent: 10 }]);
  const total = dests.reduce((s, d) => s + (Number(d.percent) || 0), 0);
  const refresh = () => ["retention-rules", "wallet", "wallet-ledger", "admin-amb"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  const create = useMutation({
    mutationFn: () => rpc("admin_create_retention", { p_ambassador_id: ambId, p_description: desc, p_destinations: dests, p_retain_existing: retro }),
    onSuccess: (d) => { toast.success(`Retenção criada. Retido agora: ${(d as { retained?: number }).retained ?? 0} Coins`); setDesc(""); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = useMutation({ mutationFn: (r: Rule) => rpc("admin_toggle_retention", { p_id: r.id, p_active: !r.is_active }), onSuccess: refresh, onError: (e: Error) => toast.error(e.message) });
  const del = useMutation({ mutationFn: (id: string) => rpc("admin_delete_retention", { p_id: id }), onSuccess: () => { toast.success("Regra removida"); refresh(); }, onError: (e: Error) => toast.error(e.message) });

  const setDest = (i: number, patch: Partial<Dest>) => setDests((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const valid = ambId && dests.length && dests.every((d) => d.percent > 0 && (d.type === "wallet" || d.ambassador_id));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-4 font-display font-semibold">Nova retenção</h3>
        <div className="space-y-3">
          <div><Label>Embaixador retido</Label><AmbSelect value={ambId} onChange={setAmbId} list={amb.data} /></div>
          <div>
            <Label>Descrição (o embaixador vê isso)</Label>
            <Input className="text-base sm:text-sm" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex.: Taxa de parceria" />
            <p className="mt-1 text-xs text-muted-foreground">Aparece no extrato: "- [valor] Saldo retido de: {desc || "…"}"</p>
          </div>
          <div className="space-y-2">
            <Label>Destinos (só você vê)</Label>
            {dests.map((d, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,1fr)_80px_auto] gap-2">
                <Select value={d.type === "wallet" ? "wallet" : d.ambassador_id ?? ""} onValueChange={(v) => setDest(i, v === "wallet" ? { type: "wallet", ambassador_id: undefined } : { type: "ambassador", ambassador_id: v })}>
                  <SelectTrigger className="text-base sm:text-sm"><SelectValue placeholder="Destino" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wallet">Carteira Dante</SelectItem>
                    {(amb.data ?? []).filter((a) => a.user_id !== ambId).map((a) => <SelectItem key={a.user_id} value={a.user_id}>{a.full_name || "Sem nome"} ({a.referral_code})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" min={0} className="text-base sm:text-sm" value={d.percent} onChange={(e) => setDest(i, { percent: Number(e.target.value) })} />
                <Button variant="ghost" size="icon" onClick={() => setDests((ds) => ds.filter((_, j) => j !== i))} aria-label="Remover destino"><X className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setDests((ds) => [...ds, { type: "ambassador", percent: 5 }])}><Plus className="h-4 w-4" /> Adicionar destino</Button>
            <p className="text-sm">Total retido de cada entrada: <b className="text-primary">{total}%</b></p>
          </div>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={retro} onCheckedChange={(v) => setRetro(!!v)} /> Reter também o saldo que já existe agora</label>
          <Button className="w-full" disabled={!valid || create.isPending} onClick={() => create.mutate()}>Criar retenção</Button>
        </div>
      </Card>
      <Card>
        <h3 className="mb-4 font-display font-semibold">Retenções ativas</h3>
        <div className="space-y-3">
          {(rules.data ?? []).map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{ambName(amb.data, r.ambassador_id)}</p>
                  <p className="truncate text-xs text-muted-foreground">"{r.description || "sem descrição"}"</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Switch checked={r.is_active} onCheckedChange={() => toggle.mutate(r)} />
                  <Button variant="ghost" size="icon" onClick={() => del.mutate(r.id)} aria-label="Excluir"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.destinations.map((d, i) => <Badge key={i} variant="secondary" className="max-w-full truncate">{d.percent}% → {d.type === "wallet" ? "Carteira Dante" : ambName(amb.data, d.ambassador_id)}</Badge>)}
              </div>
            </div>
          ))}
          {!rules.data?.length && <p className="text-sm text-muted-foreground">Nenhuma retenção criada.</p>}
        </div>
      </Card>
    </div>
  );
}

function AutoDist() {
  const qc = useQueryClient();
  const amb = useAmbs();
  const q = useQuery({ queryKey: ["autodist"], queryFn: async () => (await db.from("dante_wallet_auto_dist").select("*").order("created_at")).data ?? [] });
  const [ambId, setAmbId] = useState("");
  const [pct, setPct] = useState(1);
  const add = useMutation({ mutationFn: () => rpc("admin_wallet_add_autodist", { p_ambassador_id: ambId, p_percent: pct, p_note: "" }), onSuccess: () => { toast.success("Distribuição criada"); qc.invalidateQueries({ queryKey: ["autodist"] }); }, onError: (e: Error) => toast.error(e.message) });
  const rm = useMutation({ mutationFn: (id: string) => rpc("admin_wallet_remove_autodist", { p_id: id }), onSuccess: () => qc.invalidateQueries({ queryKey: ["autodist"] }) });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-1 font-display font-semibold"><Shuffle className="mr-1 inline h-4 w-4" /> Nova distribuição</h3>
        <p className="mb-4 text-xs text-muted-foreground">A cada entrada na Carteira (retenções), essa porcentagem vai direto para o embaixador. Rendimentos não são distribuídos.</p>
        <div className="space-y-3">
          <AmbSelect value={ambId} onChange={setAmbId} list={amb.data} />
          <div><Label>Porcentagem de cada entrada</Label><Input type="number" min={0} className="text-base sm:text-sm" value={pct} onChange={(e) => setPct(Number(e.target.value))} /></div>
          <Button className="w-full" disabled={!ambId || pct <= 0 || add.isPending} onClick={() => add.mutate()}>Adicionar</Button>
        </div>
      </Card>
      <Card>
        <h3 className="mb-4 font-display font-semibold">Distribuições ativas</h3>
        {(q.data as { id: string; ambassador_id: string; percent: number }[]).map((d) => (
          <div key={d.id} className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border p-3">
            <p className="truncate text-sm"><b className="text-primary">{d.percent}%</b> → {ambName(amb.data, d.ambassador_id)}</p>
            <Button variant="ghost" size="icon" onClick={() => rm.mutate(d.id)} aria-label="Remover"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {!q.data?.length && <p className="text-sm text-muted-foreground">Nenhuma distribuição.</p>}
      </Card>
    </div>
  );
}

function Transfer() {
  const qc = useQueryClient();
  const amb = useAmbs();
  const [ambId, setAmbId] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const m = useMutation({
    mutationFn: () => rpc("admin_wallet_transfer", { p_ambassador_id: ambId, p_amount: amount, p_note: note }),
    onSuccess: () => { toast.success("Coins enviados"); setAmount(0); setNote(""); ["wallet", "wallet-ledger", "admin-amb"].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Card className="max-w-xl">
      <h3 className="mb-4 font-display font-semibold"><Send className="mr-1 inline h-4 w-4" /> Enviar Coins para embaixador</h3>
      <div className="space-y-3">
        <AmbSelect value={ambId} onChange={setAmbId} list={amb.data} />
        <div><Label>Quantidade de Coins</Label><Input type="number" min={0} className="text-base sm:text-sm" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /><p className="mt-1 text-xs text-muted-foreground">≈ {brl(coinsToBRL(amount))}</p></div>
        <div><Label>Mensagem no extrato (opcional)</Label><Input className="text-base sm:text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Transferência Universo Querido Dante" /></div>
        <Button className="w-full" disabled={!ambId || amount <= 0 || m.isPending} onClick={() => m.mutate()}>Transferir</Button>
      </div>
    </Card>
  );
}

function YieldCfg() {
  const qc = useQueryClient();
  const w = useWallet();
  const [pct, setPct] = useState<number | null>(null);
  const [period, setPeriod] = useState<string | null>(null);
  const m = useMutation({
    mutationFn: () => rpc("admin_wallet_set_yield", { p_pct: pct ?? w.data?.yield_pct ?? 0, p_period: period ?? w.data?.yield_period ?? "month" }),
    onSuccess: () => { toast.success("Rendimento salvo"); qc.invalidateQueries({ queryKey: ["wallet"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Card className="max-w-xl">
      <h3 className="mb-4 font-display font-semibold">Rendimento automático</h3>
      <div className="space-y-3">
        <div><Label>Porcentagem por período</Label><Input type="number" min={0} step="0.01" className="text-base sm:text-sm" value={pct ?? Number(w.data?.yield_pct ?? 0)} onChange={(e) => setPct(Number(e.target.value))} /></div>
        <div>
          <Label>Período de liquidez</Label>
          <Select value={period ?? w.data?.yield_period ?? "month"} onValueChange={setPeriod}>
            <SelectTrigger className="text-base sm:text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(PERIOD).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {w.data && <p className="text-xs text-muted-foreground">Último rendimento contado em {new Date(w.data.last_yield_at).toLocaleString("pt-BR")}.</p>}
        <Button className="w-full" disabled={m.isPending} onClick={() => m.mutate()}>Salvar</Button>
      </div>
    </Card>
  );
}
