# Onboarding

Benny's onboarding is an in-app wizard at `/onboarding` (sidebar → Onboarding). It walks through six steps:

1. **Bio** — name, breed, age, weight, bio.
2. **Photos** — up to 5 pictures, stored as base64 in SQLite.
3. **Vet & health** — vet contact, allergies, medications, last checkup, conditions.
4. **Behaviour** — energy level, barkiness, temperament, socialization, fears.
5. **Walking** — walk times, duration, preferred route.
6. **Dogparks & fountains** — coordinates for the patrol route.

Completing the wizard sets `onboarded=1` on the profile and stores `benny-the-dog-mcp-onboarded=1` in localStorage, which clears the dashboard CTA banner and shows the dog card with the first photo.

## What it enables

- Dashboard dog card (name, breed, energy, bio, photo).
- Patrol context: the APScheduler patrol job reads dog events; parks/fountains give the Boomy robot a route to check.
- Chat skill context (the SKILL.md is loaded as the base system prompt).

## No external account needed

This server is local-first — no wrappee or online account required. Everything persists in the local SQLite file.
