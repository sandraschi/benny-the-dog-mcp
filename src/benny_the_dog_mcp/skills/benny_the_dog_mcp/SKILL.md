# Benny the Dog Skill

This server monitors Benny, the fleet dog. Every care event is stored in
SQLite and can be inspected by humans, agents, and the Boomy robot patrol.

## Tools

- `app_info` - server metadata
- `dog_ops` - the Benny care portmanteau:
  - `status` - water refills, barks, movement, sausage deliveries, loneliness flag
  - `water_refill` - log a bowl refill
  - `bark_event` - log a bark (loneliness evaluation happens on status)
  - `movement` - log movement (actor: boomy | sensor | human)
  - `sausage_delivery` - log an emergency sausage delivery
  - `movie_time` - play White Fang on the projector
  - `wake` - wake call
- `example_op` - placeholder demo

## Patrol integration

The APScheduler `patrol` job runs every 5 minutes. It reads the dog event
log: if a bark occurred with no movement after it, the patrol raises a
loneliness flag and recommends a sausage delivery. Wire `dog_ops`
movement/sausage calls to the Boomy robot camera + claw for full
autonomy.

## Vet & health

The dog profile (webapp onboarding) records vet contact, allergies,
medications, last checkup, conditions, and the walk schedule. The webapp
Vet page (`/vet`) surfaces this plus the recent care-event timeline via
`GET /api/dog/events`, a vaccination schedule (name, administered date,
next due, notes) via `/api/dog/vaccinations`, and a vet visit log (date,
reason, findings, cost) via `/api/dog/vet-visits`. For health questions,
read the profile first and recommend contacting the vet (vet_name /
vet_phone) for anything beyond routine care.

## Usage

```python
dog_ops(operation="status")
dog_ops(operation="water_refill", detail="bowl topped up, 2L")
dog_ops(operation="sausage_delivery", actor="boomy", detail="emergency sausage dropped")
```
