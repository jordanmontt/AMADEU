# Deployment

How the site is published, and the one-time steps that need the Foundation's accounts ([ADR 0056](adr/0056-deployment-pipeline-and-hosting-files.md)). Until they are done, CI checks every change but publishes nothing.

## How a change reaches the site

1. A change lands on `main`, from a merged pull request or a save in the admin.
2. CI runs the checks, the unit and content tests, the build, and the E2E tests in Chromium, Firefox and WebKit.
3. If everything passed, the `deploy` job builds the site with the production settings and publishes it to Cloudflare Pages. If anything failed, nothing is published and the previous site stays online.

## One-time setup

Each step needs an account that belongs to the Foundation ([ADR 0020](adr/0020-foundation-owned-accounts.md)).

### 1. Cloudflare Pages

1. In the Foundation's Cloudflare account, create a Pages project with **direct upload**, not connected to Git. Its name gives the prototype's address, `https://<name>.pages.dev`.
2. Create an API token with the permission **Account › Cloudflare Pages › Edit**, for that account only.
3. In the GitHub repository, under **Settings › Secrets and variables › Actions**:
   - secrets: `CLOUDFLARE_API_TOKEN` (the token) and `CLOUDFLARE_ACCOUNT_ID` (shown on the account's home page);
   - variables: `CLOUDFLARE_PAGES_PROJECT` (the project's name) and `SITE_URL` (`https://<name>.pages.dev/`, later the domain).
4. Protect `main`: **Settings › Branches**, require the CI checks to pass before merging (RT-57).

The next push to `main` publishes the site.

### 2. Admin login (Sveltia CMS Additions)

Follow [Additions' setup guide](https://github.com/sveltia/sveltia-cms-additions/blob/main/docs/setup.md): deploy its Worker on the Foundation's Cloudflare account, run its setup wizard (it creates the GitHub App), and add the editors under **Administration › Users**. Then, in this repository:

1. `public/admin/config.yml`: under `backend`, add `auth_type: additions` and `base_url: <the Worker's address>`.
2. `public/admin/index.html`: raise Sveltia to 0.271.0 or later, the first version with Additions, after reading the release notes.
3. In Additions' **Domains**, allow only the site's address.

Before relying on it, check the two things ADR 0055 leaves to verify by hand, with "Work with Local Repository": the value stored for an uploaded audio file, and for a relation to a section.

### 3. Visit statistics (GoatCounter)

Create the site at [goatcounter.com](https://www.goatcounter.com) with the Foundation's email, make its dashboard public, and set the repository variable `GOATCOUNTER_CODE` to its code (the `<code>` of `<code>.goatcounter.com`).

### 4. Domain

When the Foundation has its domain, attach it to the Pages project as a custom domain and change `SITE_URL`. The book's QR code must point to `<domain>/sangre-y-sueno/?ref=qr` and never change (RF-60, RF-61).
