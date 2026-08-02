# benny-the-dog-mcp IDEAS.md - the fleet dog

Benny is the fleet dog. This server is his care plane. The 5-minute
patrol scheduler job already checks his state; here is how to make it
real.

## Already built (v0.1)

- [x] `dog_ops` portmanteau: status, water_refill, bark_event, movement,
      sausage_delivery, movie_time, wake - all persisted to SQLite
- [x] Patrol scheduler job reads the dog log and flags loneliness
      (bark with no movement after)
- [x] Webapp: Dashboard (health KPIs), Tools, Jobs (patrol run), Logs
      (ring buffer shows every Benny event), Chat, Shop (sausage merch)

## Boomy robot integration (the big one)

- [ ] **Water bowl patrol**: Boomy drives to the bowl on the 5-min patrol,
      camera-frame it, estimate water level via vision, call
      `dog_ops(water_refill)` when low - and top it up with the claw if
      physically possible
- [ ] **Emergency sausage delivery**: the patrol job detects the
      loneliness flag -> Boomy picks up a sausage from the dispenser and
      delivers it to Benny's mat. Call `dog_ops(sausage_delivery,
      actor="boomy")` on completion
- [ ] **Movement detection**: Boomy's camera does frame-diff on Benny's
      bed -> `dog_ops(movement, actor="boomy")`. No movement for 4 hours
      during the day = health check prompt
- [ ] **Bark/loneliness analysis**: microphone + local LLM classifies
      barks (excited vs lonely). Lonely bark -> projector White Fang +
      a sausage, stat

## Care extras

- [ ] **Health vitals log**: weight, food, vet visits as event types
- [ ] **Projector queue**: movie_time builds a playlist (White Fang is
      canon; add Lassie, Homeward Bound)
- [ ] **Wake calls**: scheduled gentle wake (soft chime via speech-mcp)
      instead of a harsh alarm
- [ ] **Good boy ledger**: sausage_delivery awards points; the Shop
      page could sell Benny merch

## Absurd but technically real

- [ ] **Patrol diplomacy**: if the patrol camera sees a cat, TTS
      "the cat is patrolling with us today" and log HIGH
- [ ] **Weather-aware bowls**: rain detection -> move bowls under cover
- [ ] **Benny's blog**: the daily digest of events rendered as a
      markdown journal (pack_ops-style)

## Run

```powershell
cd D:\Dev\repos\benny-the-dog-mcp
uv sync
bun --prefix webapp install
.\start.ps1   # backend :11142, frontend :11143
```

Backend: http://127.0.0.1:11142/docs | Frontend: http://127.0.0.1:11143
