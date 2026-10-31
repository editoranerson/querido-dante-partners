CREATE TABLE public.affiliate_scratch_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.affiliate_accounts(user_id) ON DELETE CASCADE,
  admin_id uuid,
  extra_tickets integer NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.affiliate_scratch_grants TO authenticated;
GRANT ALL ON public.affiliate_scratch_grants TO service_role;
ALTER TABLE public.affiliate_scratch_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own or admin grants" ON public.affiliate_scratch_grants FOR SELECT TO authenticated
  USING (ambassador_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.affiliate_scratch_status()
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_uid uuid := auth.uid(); v_plan text; v_free int; v_used_free int; v_total int; v_price int; v_extra int;
BEGIN
  IF v_uid IS NULL THEN RETURN NULL; END IF;
  SELECT CASE WHEN plan_expires_at > now() THEN plan ELSE 'free' END INTO v_plan FROM profiles WHERE id = v_uid;
  v_plan := COALESCE(v_plan,'free');
  v_free := CASE v_plan WHEN 'dante_plus' THEN 1 WHEN 'dante_premium' THEN 2 WHEN 'dante_premium_plus' THEN 3 ELSE 0 END;
  v_price := CASE WHEN v_plan = 'dante_premium_plus' THEN 5 ELSE 10 END;
  SELECT COALESCE(sum(extra_tickets),0) INTO v_extra FROM affiliate_scratch_grants WHERE ambassador_id = v_uid;
  SELECT count(*), count(*) FILTER (WHERE obtained_by='free') INTO v_total, v_used_free
    FROM affiliate_user_scratch_cards WHERE ambassador_id = v_uid;
  RETURN jsonb_build_object(
    'active', public.affiliate_scratch_event_active(),
    'plan', v_plan, 'accumulates', v_plan = 'dante_premium_plus',
    'free_left', GREATEST(v_free + v_extra - v_used_free, 0), 'price', v_price,
    'used', v_total, 'limit', 5 + v_extra, 'extra', v_extra,
    'multiplier', public.affiliate_active_multiplier(v_uid));
END; $$;

CREATE OR REPLACE FUNCTION public.affiliate_scratch_draw()
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_uid uuid := auth.uid(); st jsonb; acc affiliate_accounts; c affiliate_scratch_cards; v_by text; v_cost int := 0; v_row affiliate_user_scratch_cards;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'nao autenticado'; END IF;
  SELECT * INTO acc FROM affiliate_accounts WHERE user_id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Você ainda não é embaixador'); END IF;
  IF acc.is_blocked THEN RETURN jsonb_build_object('ok',false,'error','Conta bloqueada'); END IF;
  st := public.affiliate_scratch_status();
  IF NOT (st->>'active')::boolean THEN RETURN jsonb_build_object('ok',false,'error','Evento encerrado'); END IF;
  IF (st->>'used')::int >= (st->>'limit')::int THEN RETURN jsonb_build_object('ok',false,'error','Limite de bilhetes atingido'); END IF;
  IF (st->>'free_left')::int > 0 THEN v_by := 'free';
  ELSE
    v_by := 'coins'; v_cost := (st->>'price')::int;
    IF acc.coins < v_cost THEN RETURN jsonb_build_object('ok',false,'error','Coins insuficientes'); END IF;
  END IF;
  SELECT * INTO c FROM affiliate_scratch_cards s WHERE s.is_active
    AND NOT EXISTS (SELECT 1 FROM affiliate_user_scratch_cards u WHERE u.ambassador_id = v_uid AND u.card_id = s.id)
    ORDER BY random() LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Nenhum bilhete disponível no momento'); END IF;
  IF v_cost > 0 THEN
    UPDATE affiliate_accounts SET coins = coins - v_cost WHERE user_id = v_uid;
    INSERT INTO affiliate_earnings (ambassador_id, amount, source_type, source_description)
    VALUES (v_uid, -v_cost, 'redemption', 'Bilhete da raspadinha ' || c.code);
  END IF;
  INSERT INTO affiliate_user_scratch_cards (ambassador_id, card_id, code, multiplier, obtained_by, coins_paid, expires_at)
  VALUES (v_uid, c.id, c.code, c.multiplier, v_by, v_cost, now() + interval '5 days') RETURNING * INTO v_row;
  RETURN jsonb_build_object('ok',true,'code',c.code,'multiplier',c.multiplier,'obtained_by',v_by,
    'expires_at',v_row.expires_at,'total_multiplier',public.affiliate_active_multiplier(v_uid));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_grant_scratch_tickets(p_ambassador_id uuid, p_amount integer, p_note text DEFAULT NULL)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN RETURN jsonb_build_object('ok',false,'error','forbidden'); END IF;
  IF p_amount IS NULL OR p_amount < 1 OR p_amount > 100 THEN RETURN jsonb_build_object('ok',false,'error','Quantidade inválida'); END IF;
  INSERT INTO affiliate_scratch_grants (ambassador_id, admin_id, extra_tickets, note) VALUES (p_ambassador_id, auth.uid(), p_amount, p_note);
  INSERT INTO affiliate_notifications (ambassador_id, type, title, message)
  VALUES (p_ambassador_id, 'scratch', 'Novas raspadinhas liberadas!', 'Você recebeu ' || p_amount || ' raspadinha(s) extra(s). Raspe agora!');
  RETURN jsonb_build_object('ok',true);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_scratch_event(p_active boolean)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN RETURN jsonb_build_object('ok',false,'error','forbidden'); END IF;
  INSERT INTO site_content (key, value, updated_at) VALUES ('affiliate_scratch_event_active', CASE WHEN p_active THEN 'true' ELSE 'false' END, now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  RETURN jsonb_build_object('ok',true,'active',p_active);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_list_ambassadors()
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN RETURN '[]'::jsonb; END IF;
  RETURN COALESCE((SELECT jsonb_agg(row_to_json(t) ORDER BY t.coins DESC) FROM (
    SELECT a.user_id, a.referral_code, a.coins, a.is_blocked, a.block_reason, a.created_at,
      p.full_name, p.plan,
      (SELECT count(*) FROM affiliate_visits v WHERE v.ambassador_id = a.user_id) visits,
      (SELECT count(*) FROM affiliate_referrals r WHERE r.ambassador_id = a.user_id) referrals,
      (SELECT COALESCE(sum(extra_tickets),0) FROM affiliate_scratch_grants g WHERE g.ambassador_id = a.user_id) extra_tickets,
      (SELECT count(*) FROM affiliate_user_scratch_cards u WHERE u.ambassador_id = a.user_id) tickets_used
    FROM affiliate_accounts a LEFT JOIN profiles p ON p.id = a.user_id) t), '[]'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION public.affiliate_my_stats()
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'visits', (SELECT count(*) FROM affiliate_visits WHERE ambassador_id = v_uid),
    'retained', (SELECT count(*) FROM affiliate_visits WHERE ambassador_id = v_uid AND retained),
    'signups', (SELECT count(*) FROM affiliate_referrals WHERE ambassador_id = v_uid),
    'active_subs', (SELECT count(*) FROM affiliate_referrals r JOIN profiles p ON p.id = r.referred_id
                     WHERE r.ambassador_id = v_uid AND p.plan <> 'free' AND p.plan_expires_at > now()),
    'credits', (SELECT COALESCE(sum(r.credits_pending),0) FROM affiliate_referrals r WHERE r.ambassador_id = v_uid)
      + (SELECT COALESCE(credits_pool_pending,0) FROM affiliate_accounts WHERE user_id = v_uid),
    'scratch_expires_at', (SELECT max(expires_at) FROM affiliate_user_scratch_cards WHERE ambassador_id = v_uid AND expires_at > now())
  );
END; $$;

GRANT EXECUTE ON FUNCTION public.admin_grant_scratch_tickets(uuid,integer,text), public.admin_set_scratch_event(boolean), public.admin_list_ambassadors(), public.affiliate_my_stats() TO authenticated;