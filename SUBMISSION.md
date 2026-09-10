# Worlds Together

## Team name

Worlds Together

## Team members

Oriana Kraft (kraftdok)

## Project description

Worlds Together turns pieces of people's lives and imagination into things they can make together. Bring words, images and recordings into a private world, choose what can be discovered, and use AI to find complementary contributions, not just similar profiles. Mutual acceptance opens a shared space. People and their permissioned AI collaborators can compose scenes, contribute responses and build on previous versions, preserving sources and authorship.

The prototype combines spatial worlds, opt-in matching, multiplayer shared state and human-approved AI arrangements. Fiction, music and athlete/fan participation are creative entry points; the same foundation can support real-world collaboration. The demo uses clearly labelled sample contributions and supplied media.

## Public project GitHub repository

https://github.com/kraftdok/worlds-together

Public visibility verified. The implementation was pushed to main at commit 6f09011.

## One-minute demo video

The accompanying `outputs/worlds-together-demo.mp4` is exactly 60 seconds, with synthetic narration. Upload it to a video host accepted by the submission form, then paste its shareable URL. A local file path is not a public video link.

## Use of OpenAI products during development

I worked with Codex as an implementation partner across interaction design, React/TypeScript development, backend permissions, model integration and testing. The project uses the OpenAI Responses API with GPT-6 Astra for context selection, complementary-person matching and source-grounded creative proposals. Structured outputs constrain proposals to permitted source and media identifiers. AI actions require an explicit request, proposals require human approval, and a persistent conservative spending ledger bounds demo usage.

## Feedback on OpenAI products

Codex was especially useful for moving between product ideas, implementation and browser-based verification. The harder part was maintaining a coherent experience across a long, evolving build: individual features could work while the full user journey remained confusing. Clearer visibility into what is implemented, locally verified and actually deployed would help. Structured outputs were valuable for turning creative suggestions into usable application state, but source identifiers still needed application-side validation and recoverable error handling.

## Demo boundaries

The recording shows the local prototype, supplied images and recordings, labelled sample contributions, and an existing saved AI proposal. It does not portray a second live user or a fresh AI response. Saved room changes refresh every few seconds; this is not character-level simultaneous coediting. Private context is not automatically imported from chat history. The latest local UI is not yet the hosted site's UI.
