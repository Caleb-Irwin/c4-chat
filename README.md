# C4 Chat: Explosively Fast Chat

Try it out: [C4 Chat](https://c4-chat.calebirwin.ca/chat)

## Features

- Chat with HUNDREDS of models (including 7 for free)
- Attach images and PDFs
- PDF support for all models (`mistral-ocr` fallback)
- Search grounding with any model
- Code syntax highlighting
- KaTex and math rendering
- Resumable streams
- Up to 1,000 requests per month with BYOK (for $0!)
- Pinned models + threads
- Exposed reasoning + search groundings

| Better than T3 Chat | Worse than T3 Chat |
|----------|----------|
| More free models + hundreds more with BYOK   | No branching     | 
| Search and read PDFs with all models | No image generation     |
| Lighterweight (60% less data transferred for first chat)    | No o3 (without adding OpenAI key in OpenRouter)     |
| Bring a single key to try hundreds of models (🎉 OpenRouter)   | Has more issues (listed at bottom page)     |

## Technology

- Framework: SvelteKit
- UI: shadcn-svelte + tailwind v4
- Database + Sync: Convex
- Hosting: Cloudflare Pages
- Auth: Convex Auth
- Storage: Convex

## "Pricing"

- Anonymous users get 10 free requests
- Registered users get 50 free requests and $1 of credit per month
- Cost per 1000 messages: $1 (this includes BYOK requests, so up to 1,000 requests per month)
- Cost per GB uploaded: $3

Pricing, system prompts, and limits are configured in [`/src/conf.ts`](/src/conf.ts).

## Developing

Once you've cloned the project and installed dependencies with `bun install`, you should run `bunx convex dev` to connect to Convex.

Add required environment vars in the Convex dashboard:
```env
AUTH_GOOGLE_ID=*** # needed for OAuth (how to setup: https://labs.convex.dev/auth/config/oauth/google)
AUTH_GOOGLE_SECRET=***
SITE_URL= http://something # your site's address such as http://localhost:5173
OPENROUTER_API_KEY=sk-or-v1-**** # for users that do not BYOK
```

Then run `bunx @convex-dev/auth` to set up Convex Auth for dev.

To run the dev server run `bun run dev`, and in a separate terminal run `bunx convex dev`.

## Deployment

Locally, you can `bun run build` and then preview the production build with `bun run preview`.

1. Run `bunx convex deploy && bunx @convex-dev/auth --prod` to setup Convex and Convex Auth.
2. Ensure you have environment vars set in your prod deployment as described above.
3. Deploy to Cloudflare Pages (Vercel and Netlify _should_ also work out of the box thanks to `@sveltejs/adapter-auto`).

### Cloudflare Pages Config

Build Command: `bun i && bun x convex deploy && bun run build`

Build Output: `.svelte-kit/cloudflare`

```env
# ENV set in Cloudflare dashboard
BUN_VERSION=1
CONVEX_DEPLOY_KEY=prod:something-something-****** # Get in Convex Dashboard
PUBLIC_CONVEX_URL=https://something-something.convex.cloud # Your Deployment URL
```



## Issues (or Todos)

- Error handling is broadly bad (they are caught and thrown well on the server, but not rendered well)
- OpenAI reasoning models are not labelled as reasoning (since they do not include reasoning parameters or any other indication in OpenRouter's Models API)
- Reasoning selector is available for all models (due to the above reason)
- Occasionally, search groundings will cause models to appear to be loading forever (with no error thrown)
- Very long threads will fail for Convex reasons (or context length, which will not be told to the user)
- Uses pagination for threads (if over 200), not infinite scroll
- Certain models are available that may not actually be available (they give blank responses)
- Model selector search is slow (due to so many models)
- Could use more tooltips
- I don't love Convex Auth (should probably move to Clerk)
- No auth dashboard for developer (must edit DB)
- Mobile support is on par with T3 Chat (so only fine)
- Attached images are not displayed
- 2MB attachment limit (due to base64 encoding larger files causing out of RAM crashes on Convex)
- Should move to R2 (through Convex component)
- [`/src/convex/messages/index.ts`](/src/convex/messages/index.ts) could use a refactor

## About

C4 Chat was created by [Caleb Irwin](https://calebirwin.ca/) as part of the [T3 Chat Cloneathon](https://cloneathon.t3.chat/register). It is MIT licensed.

Made with love in Canada, the True North strong and free.
