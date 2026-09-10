# Worlds Together

A standalone experiment in private personal context and multiplayer creation.
Add pieces of your life, knowledge or imagination. Let Astra suggest which pieces
could contribute to an encounter. Review them, share only those pieces, and build
something together. Every creation keeps links to the pieces that shaped it.

## What works

- Rotatable dimensional collection with image pieces and source traces.
- Account-private text, image and audio contributions (matching uses descriptions).
- Original fiction, athlete/fan participation, music, hospitality and community rooms.
- Independently selectable invitations: create/contribute, connect/collaborate, or join an experience.
- Original image and audio responses, with credit and links to the version they build on.
- Host request → answer → participant acceptance → participant-reported return.
- Private Astra selection, explicit sharing, source-linked generation, human branches.
- Room-owner approval for join requests, invitation replacement and access removal.
- Durable shared state with polling and revision conflict detection.
- Conservative total AI allowance, hourly limits and capped inputs/outputs.

This is not yet community-wide person discovery, automatic context synchronization,
simultaneous character-level editing, live voice conversation, a booking system,
or a healthcare-ready product. It does not read past ChatGPT conversations. An API
key enables generation; it does not authorize access to a person's chat history.

## Run locally

Requires Node 22.13+ and npm. Run `npm run install:ci`, create `.env` using
`.env.example`, and supply your own API key without committing it. Run
`npm run build`, then apply each SQL migration once, in numeric order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_polite_silver_sable.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_nifty_gladiator.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_nostalgic_master_mold.sql
npm run dev
```

Open the printed local URL. Local sign-in is a clearly separate development
identity supplied by the Sites starter. It does not test real OAuth. The signed-out
collection and optional room participant are original fictional samples, not live people.

## Five-minute solo demo

1. Sign in and add two or three pieces: a memory, an ambition, something you know.
   Add an image or describe an audio file if useful. Keep sensitive material out.
2. Open The night station with its explicitly labelled fictional contribution.
3. Return to Your world and choose Find the pieces that connect.
4. Review the exact text and any attached files; share only what you choose.
5. Make a possibility, inspect its source traces, and Build on this to save a branch.
6. For real multiplayer, grant a tester site access, send a room invitation, then
   approve their request. They onboard into their own private collection and choose
   which pieces to bring. Saved room changes refresh approximately every 2.5 seconds.

## Security and spend boundaries

The hosted instance is owner-only initially. It can allow specific testers without
becoming public. A site allowlist and room membership are separate checks. A forwarded
room URL does not grant membership: the creator must approve the signed-in requester.
Removing access blocks subsequent server reads. It cannot recall screenshots, exports,
or information already delivered. Withdrawing a piece removes dependent in-app versions,
not external copies. Do not use patient data or confidential client material.

`DEMO_AI_BUDGET_USD=25` sets a lifetime app allowance. Each request atomically reserves
a deliberately conservative cost before contacting OpenAI. The reserve prices input
UTF-8 bytes plus overhead as tokens at Astra's cache-write rate, and reserves the full
3,500-token output allowance. Failed/uncertain requests keep their reservation. Therefore
the app may stop earlier than actual invoiced spending. It also limits each person to
20 calls/hour and the site to 100 calls/hour. The ledger persists across restarts.
Pricing assumptions are pinned to GPT-6 Astra standard pricing checked 2026-09-10;
other models are refused until the guard is updated. This does not limit another app
using the same key, earlier calls, hosting costs, or your entire OpenAI account.
Set a separate enforced API-project spend limit as defense in depth.

API handlers use prepared queries, server-derived identity, same-origin mutations,
ownership checks, bounded uploads and compare-and-swap room revisions. Model output
is schema-checked and source IDs must exist in the supplied context. Generated text
is rendered as text, not HTML. Prompts, files and keys are not logged by app code.
Requests use `store:false`; this is not a claim of zero provider retention.

## Tests

`npx tsc --noEmit` and `npm run build` check compilation. `npm start` starts the built
Worker on loopback, without the development sign-in shim. Run `node scripts/check-api.mjs`
against that local Worker to test two identities, private isolation, owner approval,
forwarded invitations, access revocation, revision conflicts and withdrawal.
The test's synthetic identity headers must never be trusted on a directly public Worker.
`--live` additionally tests paid matching and generation if that Worker has the key bound.

## Hosting and future integration

The runtime adapter is Cloudflare D1/R2 plus Sites dispatch-owned ChatGPT authentication.
The business types live in `lib/domain.ts`; identity/storage guards in `lib/server.ts`;
model integration in `lib/astra.ts`; the UI is under `components/`.
The fresh app does not import any private product source or customer decks.

For a different host, replace the identity adapter with verified sessions and provision
the DB and BUCKET bindings. Never expose the raw Worker publicly while trusting client-
supplied `oai-authenticated-user-*` headers. Sites' dispatcher owns that trust boundary.
When merging, map users, permissions, storage and events explicitly rather than assuming
these prototype identifiers or API routes are compatible with the main application.

## Next: the fuller vision

Add an opt-in discovery layer: each person chooses a small discoverable collection;
Astra finds complementary contributions between people; it explains the concrete
thing they might make together; both accept before opening a room. Real-world outcomes
and new creations can then become new pieces, with explicit approval and source credit.
Keep person-to-person matching separate from private piece-to-room selection.

MIT licensed application code. Standard dependencies retain their own licenses.
The vendored Sites build integration has its accompanying upstream MIT license.
The three in-page images are original generated fictional assets, not client media.
