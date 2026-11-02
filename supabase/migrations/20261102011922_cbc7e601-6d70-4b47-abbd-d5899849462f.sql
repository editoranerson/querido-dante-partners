
CREATE TABLE public.dante_wallet (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  balance bigint NOT NULL DEFAULT 0,
  yield_pct numeric NOT NULL DEFAULT 0,
  yield_period text NOT NULL DEFAULT 'month',
  last_yield_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.dante_wallet (id) VALUES (1);
GRANT SELECT ON public.dante_wallet TO authenticated;
GRANT ALL ON public.dante_wallet TO service_role;
ALTER TABLE public.dante_wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads wallet" ON public.dante_wallet FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE public.dante_wallet_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount bigint NOT NULL,
  kind text NOT NULL,
  description text NOT NULL DEFAULT '',
  ambassador_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dante_wallet_ledger TO authenticated;
GRANT ALL ON public.dante_wallet_ledger TO service_role;
ALTER TABLE public.dante_wallet_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads wallet ledger" ON public.dante_wallet_ledger FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE public.coin_retention_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.affiliate_accounts(user_id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  destinations jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coin_retention_rules TO authenticated;
GRANT ALL ON public.coin_retention_rules TO service_role;
ALTER TABLE public.coin_retention_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads retention" ON public.coin_retention_rules FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE public.dante_wallet_auto_dist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.affiliate_accounts(user_id) ON DELETE CASCADE,
  percent numeric NOT NULL,
  note text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dante_wallet_auto_dist TO authenticated;
GRANT ALL ON public.dante_wallet_auto_dist TO service_role;
ALTER TABLE public.dante_wallet_auto_dist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads autodist" ON public.dante_wallet_auto_dist FOR SELECT TO authenticated USING (public.is_admin());

-- Credit wallet + apply auto distribution
CREATE OR REPLACE FUNCTION public._wallet_credit(p_amount bigint, p_kind text, p_desc text, p_amb uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; part bigint;
BEGIN
  IF p_amount <= 0 THEN RETURN; END IF;
  UPDATE dante_wallet SET balance = balance + p_amount, updated_at = now() WHERE id = 1;
  INSERT INTO dante_wallet_ledger(amount, kind, description, ambassador_id) VALUES (p_amount, p_kind, p_desc, p_amb);
  IF p_kind = 'yield' THEN RETURN; END IF;
  FOR r IN SELECT * FROM dante_wallet_auto_dist WHERE is_active LOOP
    part := floor(p_amount * r.percent / 100);
    IF part <= 0 THEN CONTINUE; END IF;
    UPDATE dante_wallet SET balance = balance - part WHERE id = 1;
    INSERT INTO dante_wallet_ledger(amount, kind, description, ambassador_id) VALUES (-part, 'auto_dist', 'Distribuição automática ' || r.percent || '%', r.ambassador_id);
    UPDATE affiliate_accounts SET coins = coins + part WHERE user_id = r.ambassador_id;
    INSERT INTO affiliate_earnings(ambassador_id, amount, source_type, source_description) VALUES (r.ambassador_id, part, 'wallet_transfer', 'Repasse Universo Querido Dante');
  END LOOP;
END $$;
REVOKE ALL ON FUNCTION public._wallet_credit(bigint, text, text, uuid) FROM PUBLIC, anon, authenticated;

-- Core retention applier
CREATE OR REPLACE FUNCTION public._apply_retention(p_amb uuid, p_base bigint, p_retro boolean)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; d jsonb; part bigint; total bigint := 0; avail bigint; rule_total bigint;
BEGIN
  FOR r IN SELECT * FROM coin_retention_rules WHERE ambassador_id = p_amb AND is_active LOOP
    rule_total := 0;
    FOR d IN SELECT * FROM jsonb_array_elements(r.destinations) LOOP
      part := floor(p_base * (d->>'percent')::numeric / 100);
      SELECT coins INTO avail FROM affiliate_accounts WHERE user_id = p_amb;
      part := least(part, greatest(avail, 0));
      IF part <= 0 THEN CONTINUE; END IF;
      UPDATE affiliate_accounts SET coins = coins - part WHERE user_id = p_amb;
      rule_total := rule_total + part;
      IF d->>'type' = 'ambassador' AND (d->>'ambassador_id') IS NOT NULL THEN
        UPDATE affiliate_accounts SET coins = coins + part WHERE user_id = (d->>'ambassador_id')::uuid;
        INSERT INTO affiliate_earnings(ambassador_id, amount, source_type, source_description) VALUES ((d->>'ambassador_id')::uuid, part, 'retention_in', 'Repasse de parceria');
      ELSE
        PERFORM _wallet_credit(part, 'retention', 'Retenção: ' || r.description, p_amb);
      END IF;
    END LOOP;
    IF rule_total > 0 THEN
      INSERT INTO affiliate_earnings(ambassador_id, amount, source_type, source_description)
      VALUES (p_amb, -rule_total, 'retention', 'Saldo retido de: ' || r.description);
      total := total + rule_total;
    END IF;
  END LOOP;
  RETURN total;
END $$;
REVOKE ALL ON FUNCTION public._apply_retention(uuid, bigint, boolean) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.trg_earning_retention()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.amount > 0 AND NEW.source_type NOT IN ('retention','retention_in','wallet_transfer','admin_adjust') THEN
    PERFORM _apply_retention(NEW.ambassador_id, NEW.amount, false);
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_affiliate_earning_retention AFTER INSERT ON public.affiliate_earnings FOR EACH ROW EXECUTE FUNCTION public.trg_earning_retention();

-- Admin RPCs
CREATE OR REPLACE FUNCTION public.admin_create_retention(p_ambassador_id uuid, p_description text, p_destinations jsonb, p_retain_existing boolean DEFAULT true)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rid uuid; bal bigint; retained bigint := 0;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF jsonb_array_length(p_destinations) = 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'Adicione ao menos um destino'); END IF;
  INSERT INTO coin_retention_rules(ambassador_id, description, destinations) VALUES (p_ambassador_id, coalesce(p_description,''), p_destinations) RETURNING id INTO rid;
  IF p_retain_existing THEN
    SELECT coins INTO bal FROM affiliate_accounts WHERE user_id = p_ambassador_id;
    IF bal > 0 THEN
      -- temporarily only this rule
      UPDATE coin_retention_rules SET is_active = false WHERE ambassador_id = p_ambassador_id AND id <> rid AND is_active;
      CREATE TEMP TABLE IF NOT EXISTS _tmp_reactivate(id uuid) ON COMMIT DROP;
      retained := _apply_retention(p_ambassador_id, bal, true);
    END IF;
    UPDATE coin_retention_rules SET is_active = true WHERE ambassador_id = p_ambassador_id AND id <> rid AND created_at < now() AND id IN (SELECT id FROM coin_retention_rules WHERE ambassador_id = p_ambassador_id AND id <> rid AND is_active = false AND description IS NOT NULL AND false);
  END IF;
  RETURN jsonb_build_object('ok', true, 'id', rid, 'retained', retained);
END $$;

CREATE OR REPLACE FUNCTION public.admin_toggle_retention(p_id uuid, p_active boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE coin_retention_rules SET is_active = p_active WHERE id = p_id;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_delete_retention(p_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  DELETE FROM coin_retention_rules WHERE id = p_id;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.dante_wallet_apply_yield()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w dante_wallet; step interval; n int := 0; gain bigint;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO w FROM dante_wallet WHERE id = 1 FOR UPDATE;
  step := CASE w.yield_period WHEN 'day' THEN interval '1 day' WHEN 'week' THEN interval '1 week' ELSE interval '1 month' END;
  WHILE w.last_yield_at + step <= now() AND n < 400 LOOP
    gain := floor(w.balance * w.yield_pct / 100);
    w.last_yield_at := w.last_yield_at + step;
    UPDATE dante_wallet SET last_yield_at = w.last_yield_at WHERE id = 1;
    IF gain > 0 THEN
      PERFORM _wallet_credit(gain, 'yield', 'Rendimento ' || w.yield_pct || '%', NULL);
      w.balance := w.balance + gain;
    END IF;
    n := n + 1;
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'periods', n);
END $$;

CREATE OR REPLACE FUNCTION public.admin_wallet_set_yield(p_pct numeric, p_period text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_period NOT IN ('day','week','month') THEN RETURN jsonb_build_object('ok', false, 'error', 'Período inválido'); END IF;
  PERFORM dante_wallet_apply_yield();
  UPDATE dante_wallet SET yield_pct = greatest(p_pct,0), yield_period = p_period, last_yield_at = now(), updated_at = now() WHERE id = 1;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_wallet_transfer(p_ambassador_id uuid, p_amount bigint, p_note text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bal bigint;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_amount <= 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'Valor inválido'); END IF;
  SELECT balance INTO bal FROM dante_wallet WHERE id = 1 FOR UPDATE;
  IF bal < p_amount THEN RETURN jsonb_build_object('ok', false, 'error', 'Saldo insuficiente na Carteira Dante'); END IF;
  UPDATE dante_wallet SET balance = balance - p_amount, updated_at = now() WHERE id = 1;
  INSERT INTO dante_wallet_ledger(amount, kind, description, ambassador_id) VALUES (-p_amount, 'transfer', coalesce(nullif(p_note,''),'Transferência'), p_ambassador_id);
  UPDATE affiliate_accounts SET coins = coins + p_amount WHERE user_id = p_ambassador_id;
  INSERT INTO affiliate_earnings(ambassador_id, amount, source_type, source_description) VALUES (p_ambassador_id, p_amount, 'wallet_transfer', coalesce(nullif(p_note,''),'Transferência Universo Querido Dante'));
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_wallet_add_autodist(p_ambassador_id uuid, p_percent numeric, p_note text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_percent <= 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'Porcentagem inválida'); END IF;
  INSERT INTO dante_wallet_auto_dist(ambassador_id, percent, note) VALUES (p_ambassador_id, p_percent, coalesce(p_note,''));
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_wallet_remove_autodist(p_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  DELETE FROM dante_wallet_auto_dist WHERE id = p_id;
  RETURN jsonb_build_object('ok', true);
END $$;

REVOKE EXECUTE ON FUNCTION public.admin_create_retention(uuid, text, jsonb, boolean), public.admin_toggle_retention(uuid, boolean), public.admin_delete_retention(uuid), public.dante_wallet_apply_yield(), public.admin_wallet_set_yield(numeric, text), public.admin_wallet_transfer(uuid, bigint, text), public.admin_wallet_add_autodist(uuid, numeric, text), public.admin_wallet_remove_autodist(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_retention(uuid, text, jsonb, boolean), public.admin_toggle_retention(uuid, boolean), public.admin_delete_retention(uuid), public.dante_wallet_apply_yield(), public.admin_wallet_set_yield(numeric, text), public.admin_wallet_transfer(uuid, bigint, text), public.admin_wallet_add_autodist(uuid, numeric, text), public.admin_wallet_remove_autodist(uuid) TO authenticated;
