
CREATE OR REPLACE FUNCTION public._apply_retention(p_amb uuid, p_base bigint, p_rule uuid)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; d jsonb; part bigint; total bigint := 0; avail bigint; rule_total bigint;
BEGIN
  FOR r IN SELECT * FROM coin_retention_rules WHERE ambassador_id = p_amb AND is_active AND (p_rule IS NULL OR id = p_rule) ORDER BY created_at LOOP
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
DROP FUNCTION public._apply_retention(uuid, bigint, boolean);
REVOKE ALL ON FUNCTION public._apply_retention(uuid, bigint, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.trg_earning_retention()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.amount > 0 AND NEW.source_type NOT IN ('retention','retention_in','wallet_transfer','admin_adjust') THEN
    PERFORM _apply_retention(NEW.ambassador_id, NEW.amount, NULL);
  END IF;
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.trg_earning_retention() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_create_retention(p_ambassador_id uuid, p_description text, p_destinations jsonb, p_retain_existing boolean DEFAULT true)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rid uuid; bal bigint; retained bigint := 0;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF jsonb_array_length(coalesce(p_destinations,'[]'::jsonb)) = 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'Adicione ao menos um destino'); END IF;
  INSERT INTO coin_retention_rules(ambassador_id, description, destinations) VALUES (p_ambassador_id, coalesce(p_description,''), p_destinations) RETURNING id INTO rid;
  IF p_retain_existing THEN
    SELECT coins INTO bal FROM affiliate_accounts WHERE user_id = p_ambassador_id;
    IF bal > 0 THEN retained := _apply_retention(p_ambassador_id, bal, rid); END IF;
  END IF;
  RETURN jsonb_build_object('ok', true, 'id', rid, 'retained', retained);
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_create_retention(uuid, text, jsonb, boolean) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_retention(uuid, text, jsonb, boolean) TO authenticated;
