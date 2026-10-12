# PROJECT: ConnectPK

ConnectPK is a professional feed for Pakistan.

## STACK

Expo (React Native, TypeScript), Expo Router, Supabase (Postgres, Auth with phone OTP, Storage, Row Level Security, Edge Functions), Next.js admin portal (separate folder /admin).

## CORE RULES

- ConnectPK is a PROFESSIONAL feed for Pakistan: verified members share what they are building, their career steps, questions, and ask for or offer help.
- Not dating, not entertainment, not anonymous. Real names and verified accounts only.
- Only verified (approved) members can post, comment, or offer help.
- Post types: building, career_step, need_opinion, need_help, offering_help.
- Reaction types are professional only: Useful, Inspiring, Support. No generic likes or dislikes, no follower counts shown.
- Responses: public Opinion (comment) or Offer Help (types: advice, mentoring, development, funding_interest, introduction, collaboration). An offer includes a short message.
- Private chat opens ONLY after the post owner accepts an offer.
- The app never handles or processes money. Show a scam warning on funding offers: never send money to unverified people, meet in public, verify the person.
- Prohibited: romantic/sexual content, harassment, scams, pyramid schemes, repeated selling, lead harvesting, discrimination, sharing private info.
- Limits: max 3 posts per day, max 20 offers per day per member.
- Members can report, block, hide a post, and delete their own posts.
- Never show phone number, exact location, or verification evidence.
- Adults 18+ only. Free for all approved users.
- Success metric: offers accepted and helpful conversations.

## STYLE

Clean, minimal, professional, mobile-first. Simple readable code, short comments.

## WORKING RULES

Do only the step I ask. Do not build extra features. Do not rewrite files that are not related. After finishing, reply with a 5-line summary of changed files and how to test.

## SKILLS

Check `.claude/skills/` and use the relevant skill files for each requested step. Tell the user in one line which skills were used.

The existing skill guide is `.claude/skills/skill.md`. Where its older product description conflicts with the CORE RULES above, follow these CORE RULES and the user's latest instructions.

UI-ONLY RULE: When I ask for UI changes, only change styling, layout, components, animations and navigation appearance. NEVER modify Supabase queries, RLS, database schema, auth logic, API calls, validation logic or business rules. If a UI change seems to need a logic change, stop and ask me first.
