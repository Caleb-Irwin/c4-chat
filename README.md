# C4 Chat: Explosively Fast Chat

Try it out: [C4 Chat](https://c4-chat.calebirwin.ca/chat)

## Features

TODO

## Developing

Once you've cloned the project and installed dependencies with `bun install`, you should run `bunx convex dev` to connect to Convex.

Then run `bunx @convex-dev/auth` to set up Convex Auth for dev.

Add required environment vars in the Convex dashboard:
```env
AUTH_GOOGLE_ID=*** # needed for oAuth (how to setup: https://labs.convex.dev/auth/config/oauth/google)
AUTH_GOOGLE_SECRET=***
SITE_URL= http://something # your site's address such as http://localhost:5173
OPENROUTER_API_KEY=sk-or-v1-**** # for users that do not BYOK
```

To run the dev server run `bun run dev`, and in a separate terminal run `bunx convex dev`.

## Deployment

1. Run `bunx convex deploy && bunx @convex-dev/auth --prod` to setup Convex and Convex Auth.
2. Ensure you have environment vars set in your prod deployment as described above.
3. Deploy to Cloudflare Pages (Vercel and Netlify _should_ also work out of the box thanks to `@sveltejs/adapter-auto`).

Build Command: `bun i && bun x convex deploy && bun run build`
Build Output: `.svelte-kit/cloudflare`
```env
# ENV for building on Cloudflare Pages
BUN_VERSION=1
CONVEX_DEPLOY_KEY=prod:something-something-****** # Get in Convex Dashboard
PUBLIC_CONVEX_URL=https://something-something.convex.cloud # Your Deployment URL
```

Locally, you can `bun run build` (no additional env vars needed) and then preview the production build with `bun run preview`.

## About

C4 Chat was created as part of the [T3 Chat Cloneathon](https://cloneathon.t3.chat/register). It was created by [Caleb](https://calebirwin.ca/) with love in Canada, the True North strong and free.
