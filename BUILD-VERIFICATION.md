# Connection-to-creation verification — 10 September 2026

Local only. No publishing, access-policy changes or source pushes.

## Implemented in this pass

- Intention-led private AI selection from saved text/media descriptions, followed by explicit discovery permission.
- Direct globe-piece inspection and selection, reactive highlights and proposed-sharing trace; stable reading foreground. Motion pauses while the pointer is in a globe.
- Cross-world invitations with exact text preview, mutual acceptance and a prefilled first agent task that still requires a separate paid-request click.
- Labelled solo rehearsal using an original fictional contribution. This is not a second human or automatic consent.
- Agent schemas constrain source and media references to permitted IDs. The reproduced 503 originated in source validation after successful model generation, not a missing API key. Known validation failures now return a recoverable explanation.
- Agent revisions retain parent links. Source effects have their own focused view. Host follow-through is optional, not a form appended to every creative work.
- Navigation leaves discovery correctly; mobile connection action no longer clips.

## Fresh evidence

- TypeScript check and Sites build passed.
- check-grounded-schema and check-budget passed.
- check-experience passed: live grounded draft, host request/answer/acceptance/report, image upload, credited contribution.
- check-cross-world passed: no room before mutual consent, ownership, exact shared text, outsider/sender acceptance rejection, concurrent acceptance, changed-permission invalidation.
- check-contribution-world passed: fan and fiction human branches, media/source boundaries, playable sequence persistence and stale-write rejection.
- check-arrangement passed with a live model call: original synthetic audio upload, supplied-media arrangement, human approval and retained agent credit.
- Browser: private AI selection generated four suggestions without publishing them.
- Browser: two local test identities separately approved discovery text. A live model match led to an invitation; the recipient accepted; an agent produced “The Letter Before Sunrise”; its principal approved it.
- Browser: the other identity added “The bell that never rang.” Their agent's next draft incorporated the bell, conflicting memories and pressed reed, and retained the human contribution as parent. The other account could read the approved revision.
- API: a room member could read but could not approve another principal's pending agent proposal (403).
- Browser: direct click on a private globe image opened that piece in discovery without exiting it; selecting a piece lit its globe node.
- Synthetic discovery test profiles were disabled after testing. Local rehearsal rooms and clearly labelled test contributions remain.

## Limits, not claims

### Living scene (latest local implementation)

- Creative rooms now open a scene composition surface, not the narrow document panel. Shared image/audio/text pieces can change an unsaved scene directly; timed moments play supplied media. Saving uses the existing versioned room workflow.
- Human multimedia uploads become credited room pieces. New shared pieces appear on polling; another saved version is offered without replacing unsaved local edits.
- Agents can receive the current scene's validated frames along with selected shared sources. Proposals are previewed and compared before their principal approves them. Old text proposals remain available and can be left undecided.
- Explicit text-source credit now survives human assembly. The server rejects unshared source IDs and validates the scene against selected sources before an AI request.
- `check-living-scene.mjs` passed isolated two-contributor composition, non-mutation, saved restoration, withdrawal detection, pending-proposal separation, and actual assembly-handler credit validation. Context-entry and grounded-schema regression checks also passed.
- Fresh browser checks: local sign-in; saved pending proposal visible; leave proposal undecided; click sample piece into unsaved scene; save affordance appears; agent selection panel opens with a valid enabled request; desktop and phone screenshots inspected. No browser console errors. Phone text clipping was corrected after inspection.
- Playback-only browser check in an existing local rehearsal: the new scene loaded a two-moment media arrangement and started the existing synthetic recording (`paused: false`, `readyState: 4`, `duration: 4`, no audio error). No new media was uploaded for this check.
- No new paid AI request, user-room save, proposal approval, or durable synthetic contribution was made in this turn. Simultaneous two-person use and a fresh end-to-end paid agent turn through this new surface remain unverified; prior backend tests are not a substitute for those checks.
- Site remains local-only for these changes. No deployment was attempted.

### Separate entry paths (latest local change)

- Root now opens two distinct destinations: a real-world collaboration intention, or an original creative invitation.
- Connection entry passes the stated intention into discovery; accounts without any pieces can explicitly save that first thought privately before reviewing discovery permissions.
- Creative entry offers fiction, athlete/fan and musician/fan invitations. Its action creates a private original-sample room and opens the contribution workspace directly, without discovery opt-in or a matching prerequisite.
- Creative workspace progress now describes responding and building on others; agents are optional, rather than the required first step.
- The in-app browser confirmed the root destination screen rendered. TypeScript and an initial production build passed. Fresh automated click-through was blocked by browser runner localhost bind permissions; the separate athlete-entry browser check timed out. Earlier journey tests above do not establish end-to-end verification of this new entry layer.
- No paid AI calls or publication were made for this entry-layer change.

- Test identities were supplied to a loopback-only production preview; this is not a production OAuth test. The two account journeys were exercised sequentially. Simultaneous cursor presence, live co-editing and reconnect recovery are not established.
- Saved room changes poll every 2.5 seconds. Agents run on explicit requests, not autonomously in the background.
- Matching uses descriptions, not image/audio understanding or imported chat history. Uploaded media can be arranged, but new visual/audio media generation is not implemented.
- Real-world follow-through records participant/host decisions, not actual bookings or independently verified outcomes.
- The hosted site remains unchanged. The hosting connector still reports the saved project as not found.
- This is a tested connection-to-creation loop, not completion of the entire long-term world experience.
