# ConnectPK

A professional networking app for Pakistan, connecting people who are building, growing their careers, sharing ideas, and offering help.

**Cities:** Karachi · Lahore · Islamabad  
**Status:** In development

## What ConnectPK does

Verified members can share professional updates, ask for opinions, and offer practical help. Private conversations begin only after a post owner accepts an offer.

ConnectPK is free for approved members aged 18 and above.

## Features

- **Professional feed** — Building, Career Step, Need Opinion, Need Help, and Offering Help posts.
- **Professional reactions** — Useful, Inspiring, and Support.
- **Opinions** — Public comments on posts.
- **Offers of help** — Advice, mentoring, development, funding interest, introductions, and collaboration.
- **Private messaging** — Text conversations unlocked through accepted offers.
- **Profiles** — Professional background, skills, interests, vision, and active posts.
- **Verification** — Selfie submission and optional professional evidence, reviewed by staff.
- **Notifications** — In-app activity notifications and Expo push notification support.
- **Safety tools** — Reporting, blocking, hidden-post review, and moderation.
- **Staff portal** — Verification and reports queues, moderation actions, and dashboard metrics.
- **Responsive UI** — Light and dark themes with mobile and web layouts.

## Community rules

ConnectPK is for professional connections—not dating, entertainment, anonymous activity, or mass promotion.

- Only approved members can post, comment, react, or offer help.
- Private chat opens only after an offer is accepted.
- Members may publish up to **3 posts per day** and send up to **20 offers per day**.
- Romantic or sexual content, harassment, scams, pyramid schemes, repeated selling, lead harvesting, discrimination, and sharing private information are prohibited.
- Phone numbers, exact locations, and verification evidence are not displayed publicly.
- ConnectPK does not handle or process money.

**Funding safety:** Never send money to people you have not verified. Verify the person independently and meet in public places.

## Technology

| Area | Technology |
| --- | --- |
| Mobile and web app | Expo, React Native, TypeScript |
| Navigation | Expo Router |
| Backend | Supabase |
| Database | PostgreSQL with Row Level Security |
| Authentication | Supabase Auth |
| File storage | Supabase Storage |
| Live updates | Supabase Realtime |
| Server functions | Supabase Edge Functions |
| Push notifications | Expo Notifications |
| Staff portal | Next.js |
| Animation | React Native Reanimated |

> The current development authentication flow uses **email and password**.

## Project structure

```text
app/                  Expo Router screens
components/           Shared UI and screen components
components/layout/    Layout primitives
components/ui/        Design-system components
constants/            Theme tokens and interface copy
lib/                  Services, models, and validation
assets/               Images and branding
supabase/             SQL migrations and backend resources
admin/                Next.js staff portal
tests/                Project tests
PROJECT.md            Product rules and development scope
UI_AUDIT.md           UI findings and remaining work
```

## Getting started

### 1. Clone the repository

Replace the placeholders with your GitHub repository details.

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use the project's **publishable key** for the app. Never put a Supabase service-role key or other server secret in an `EXPO_PUBLIC_*` variable.

Do not commit `.env` files or credentials.

### 3. Set up Supabase

Before testing the app against a new Supabase project:

1. Apply the SQL migrations in `supabase/` in their intended order.
2. Configure email/password authentication.
3. Confirm the required storage buckets and access policies are present.
4. Configure Realtime and any Edge Functions required by the enabled features.
5. Configure staff access for the admin portal.

Review migrations before running them. Do not repeatedly paste already-applied migrations into the SQL Editor.

### 4. Start the app

```bash
npm start
```

For web:

```bash
npm run web
```

For Expo Go over the local network:

```bash
npm run start:go
```

Keep your phone and development computer on the same network.

Some native features, including push notifications, require a compatible development build and physical device.

## Development commands

```bash
# Start Expo
npm start

# Start for Android
npm run android

# Start for iOS
npm run ios

# Start for web
npm run web

# Check TypeScript
npm run typecheck

# Export the web app
npx expo export --platform web
```

## Staff portal

The separate Next.js portal lives in `admin/` and is intended for moderator and administrator accounts.

It supports:

- Verification approval and rejection.
- Reviewing reported content.
- Dismissing reports and taking moderation actions.
- Reviewing automatically hidden posts.
- Recording moderation actions in the audit log.
- Viewing activity and report metrics.

The portal requires its own environment configuration. Public client configuration must never contain privileged server credentials.

## Privacy and security

- Database access is controlled through Supabase Row Level Security.
- Verification evidence is private and restricted to authorized review.
- Offers are private to the offerer and post owner.
- Conversations are restricted to their participants.
- Blocking is intended to prevent interaction and visibility between members.
- Client-side validation complements database enforcement; it does not replace it.

Security, permissions, and moderation workflows must be tested against the deployed Supabase configuration before launch.

## Testing before launch

Use separate test accounts to verify:

- Account creation, sign-in, and sign-out.
- Profile setup and editing.
- Verification submission and approval.
- Posting limits and content validation.
- Comments and reactions.
- Offer acceptance, decline, and withdrawal.
- Conversation access and realtime messages.
- Notifications and read status.
- Blocking, reporting, and moderation.
- Private storage and unauthorized access prevention.

Test small and large phones, web layouts, dark mode, keyboard handling, and devices with notches or home indicators.

## Development status

ConnectPK is under active development. Successful TypeScript checks and web builds do not establish production readiness.

See `UI_AUDIT.md` and the feature-specific QA documents for completed checks, known limitations, and remaining device testing.

## Success metric

ConnectPK measures success through **accepted offers and helpful professional conversations**.
