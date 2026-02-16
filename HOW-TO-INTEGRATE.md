# How to Integrate the Daily Ritual Engine

This guide explains how to take the core architecture of **DailyRitual** and spawn a new, curated Balatro ritual site (like `Cloud9Daily` or `PerkeoObservatory`).

## 1. Defining the Ritual (The JAML)

Each ritual is defined by a **JAML** (Joker Analysis Markup Language) file. This file tells the engine what to look for in a seed.

Example for `Cloud9Daily`:

```yaml
# title: Cloud 9 Daily
# tagline: Float like a butterfly, sting like a Rank 9
# deck: erratic

filter:
  must:
    - type: joker
      value: cloud_9
      ante: 1 # Must appear in Shop 1
    - type: rank
      value: 9
      count: 10 # Must have at least 10 nines in the starting deck
```

## 2. Managing the Chronology (The Weepoch)

The engine needs a **Launch Date (Epoch)**.

- Day 1 is calculated as: `(CurrentTime - Epoch) / 86400000 + 1`.
- For the `ErraticDeck.app` factory, this will be passed via config so each ritual can have its own "Day 1."

## 3. The Seed Pipeline

You need a pool of seeds that satisfy your JAML filter.

1. Use **Balatro Seed Oracle** (or the CLI) to find thousands of seeds.
2. Export them as a `seeds.csv` (or host them in a D1 database).
3. The engine fetches the seed for `Day N` using: `seeds[dayNumber - 1]`.

## 4. Agnostic Hosting (Dynamic Routing)

To host multiple rituals on one site (`daily.erraticdeck.app/[ritualId]`):

- Move ritual logic to `app/[ritualId]/page.tsx`.
- The `[ritualId]` parameter will drive the fetch to `/api/config?id=ritualId`.

## 5. UI Integration

To embed a daily ritual into another app (like the Oracle):

- **IFrame Method**: Use `<iframe src="https://daily.erraticdeck.app/weejoker?embed=true" />`.
- **Component Method**: Pull the `@/components/DailyRitual` package and pass a `config` prop.

---
**Status**: The engine is currently being "Decoupled" from the hardcoded WeeJoker values.
**Next Step**: Moving toward `ErraticDeck.app` as the central factory.
