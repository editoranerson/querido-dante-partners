<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Data access goes from the browser straight to Supabase (RLS + SECURITY DEFINER RPCs that check `is_admin()`/`auth.uid()`); there are no server functions — keep privileged logic inside SQL functions.
- Referral attribution and coin conversion live only in `src/lib/referral.ts` so the rules are tested in one place.
- Coin retention runs in an AFTER INSERT trigger on affiliate_earnings (skips retention/transfer/admin_adjust types) so every income path is covered without touching existing RPCs.
