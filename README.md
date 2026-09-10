# Worlds Together

A standalone experiment in private personal context and multiplayer creation.
Add pieces of your life, knowledge or imagination. Let Astra suggest which pieces
could contribute to an encounter. Review them, share only those pieces, and build
something together. Every creation keeps links to the pieces that shaped it.

## What works

- Rotatable dimensional collection with image pieces and source traces.
- Twin private/shared worlds, a hovering selected piece, and in-place drafting and sharing review.
- Member-scoped agent proposals grounded in explicitly selected shared pieces; only the requesting member can approve their agent's contribution.
- Private room-scoped person matching from 1–8 deliberately selected personal pieces and other participants' shared context. Each result identifies the exact pieces, complementary contribution, and a concrete first artifact.
- Cross-world discovery before any shared room: explicit text-only opt-in, AI matching across up to twenty recently updated discovery profiles, source previews, and a recipient-approved invitation. Neither sender nor agent can accept for the recipient.
- Mutual acceptance atomically creates one room containing the exact previewed text pieces. Changing discovery permissions invalidates pending invitations; stopping discovery does not delete existing shared rooms or recall copies.
- Permission-gated connection → share → agent draft → human approval, inside the globes. Search itself does not share or save private context into the room.
- Contributions and pending agent proposals are selectable objects in the shared globe; source pieces illuminate when a contribution is opened.
- Account-private text, image and audio contributions (matching uses descriptions).
- Original fiction, athlete/fan participation, music, hospitality and community rooms.
- Independently selectable invitations: create/contribute, connect/collaborate, or join an experience.
- Original image and audio responses, with credit and links to the version they build on.
- Host request → answer → participant acceptance → participant-reported return.
- Private Astra selection, explicit sharing, source-linked generation, human branches.
- Room-owner approval for join requests, invitation replacement and access removal.
- Durable shared state with polling and revision conflict detection.
- Conservative total AI allowance, hourly limits and capped inputs/outputs.

This is not yet unrestricted or large-scale person discovery, automatic context synchronization,
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
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_mysterious_impossible_man.sql
npm run dev
```

Open the printed local URL. Local sign-in is a clearly separate development
identity supplied by the Sites starter. It does not test real OAuth. The signed-out
collection and optional room participant are original fictional samples, not live people.

## Five-minute solo demo

1. Sign in and add two or three pieces: a memory, an ambition, something you know.
   Add an image or describe an audio file if useful. Keep sensitive material out.
2. Open The night station with its explicitly labelled fictional contribution.
3. For solo creative work, choose Create here → Bring your agent. Select at least two shared sources and give the agent a specific task. The optional fictional room participant is not a real discovery profile.
4. For cross-world discovery, choose Find connections → Your discoverable pieces. Review the exact text and opt it in. A second signed-in person must independently opt in; no room is required.
5. Find a connection, inspect its sources, and send an invitation. The recipient opens Invitations and accepts the exact preview. Only then does a shared world open. Bring your agent prefills the agreed first task; approve the agent run, review its proposal, and accept with credit or decline it.
6. For real multiplayer, grant a tester site access, send a room invitation, then
   approve their request. They onboard into their own private collection and choose
   which pieces to bring. Saved room changes refresh approximately every 2.5 seconds.

## Security and spend boundaries

Each collaboration-agent turn is bounded, not an autonomous background process.
Cross-world discovery includes only explicit opt-in profiles on this Site. It is not a prediction of romantic compatibility. The first prototype searches up to twenty recently updated profiles, not an unbounded population. Discovery publishes selected titles and full text, never attachments; uploaded media requires a separate room-sharing decision. Suggestions do not imply mutual agreement. Acceptance opens a room; AI work requires a separate permission. No automatic paid retry is performed.
The brief includes selected shared descriptions and up to three recent shared versions
whose sources are entirely within that selection. Proposals are visible to room members
before approval, but do not become accepted creations until the requesting person approves.
An agent cannot access unshared private pieces, approve another person's work, book,
purchase, or send messages outside the room. Matching currently uses text descriptions,
not image understanding or audio transcription. Media playback is not generated media.

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

Additional local checks: `node scripts/check-budget.mjs` exercises the budget ledger;
`node scripts/check-spatial.mjs` checks upload/private-piece isolation;
`node scripts/check-agent.mjs ROOM_ID` performs one paid agent proposal/approval test;
`node scripts/check-agent-ownership.mjs ROOM_ID` checks cross-member approval denial.
Use rehearsal rooms only. Inspect each script's local identity assumptions before running.
The 9 MB framework multipart envelope permits the API's independently enforced 8 MB
file limit; larger files are still rejected by the upload handler.

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

Opt-in discovery is implemented: people select discoverable pieces, request grounded
matches, and mutually accept before opening a room. It requires actual opted-in people;
sample contributions are not live users. The creative room supports direct composition
of supplied images, sound and words, draggable pieces, cinema playback, source traces
and human-approved agent arrangements. Saved changes refresh across room members.
The next step is validating the latest surface with simultaneous independent users,
and turning completed real-world outcomes into new pieces with explicit approval.
Person-to-person matching remains separate from private piece-to-room selection.

MIT licensed application code. Standard dependencies retain their own licenses.
The vendored Sites build integration has its accompanying upstream MIT license.
The in-page images are original generated fictional assets, not client media.
