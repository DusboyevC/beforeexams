# Papers host lock (Cloudflare Pages Functions)

Deploy from this folder, so `functions` is not uploaded as public files, with the papers folder as the site:

    npx wrangler pages deploy ..\..\BeforeExams --project-name beforeexams-papers-03c3c7 --branch main --commit-dirty=true

Set these on the Pages project with `wrangler pages secret put NAME --project-name beforeexams-papers-03c3c7`:
- `LINK_SECRET`: any long random string (keep it private).
- `SUPABASE_URL`: https://wdaqehcljcazcymkscao.supabase.co
- `ACCESS_PASSWORD`: the site password. Guests enter it for each paper, logged-in students every 15 days, and it is needed to create an account.
- `LOCK`: `on` blocks unsigned PDF links. Any other value, or unset, leaves PDFs open.

The BeforeExams Supabase project signs tokens with ES256, so `SUPABASE_JWT_SECRET` is not needed.

Order for switching the lock on, so no PDF link breaks:
1. Deploy the host with `LINK_SECRET` and `SUPABASE_URL` set and `LOCK` unset.
2. Deploy the website, whose config.js has PDF_SIGNER set.
3. Set `LOCK` to `on`, then deploy the host again. Secret changes only apply to a new deployment.
