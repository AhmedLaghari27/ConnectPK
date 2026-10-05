# ConnectPK

Minimal Expo + TypeScript + Expo Router starter. `PROJECT.md` was not present at setup time.

## Run locally

```sh
cd /Users/macbookair/Documents/ConnectPK
npm ci
cp .env.example .env
```

Fill in `.env` with values from your Supabase project's Connect dialog:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use the public publishable key (`sb_publishable_...`), never a secret or service-role key. Expo embeds `EXPO_PUBLIC_` values in the app bundle.

```sh
npm start
```

Scan the QR code with Expo Go, or press `i` for an installed iOS simulator or `a` for an Android emulator. Run `npm run web` for the browser. Restart Expo after editing `.env`.

## Verify

```sh
npm run typecheck
npx expo install --check
npx expo export --platform all
```

The home screen should show ConnectPK and the three supported cities. It makes no backend requests and can display without credentials. Importing `lib/supabase.ts` requires the environment variables above. Live Supabase connectivity requires your own project credentials and is not tested by this placeholder.

## Structure

- `app/`: Router layout and placeholder home screen.
- `components/`: Reserved for shared UI.
- `lib/supabase.ts`: Supabase client with persisted sessions.
- `constants/theme.ts`: Colors, spacing, and font sizes.
- `types/`: Reserved for shared TypeScript types.

Setup follows the official [Expo Router installation guide](https://docs.expo.dev/router/installation/) and [Supabase React Native guide](https://supabase.com/docs/guides/auth/quickstarts/react-native).
