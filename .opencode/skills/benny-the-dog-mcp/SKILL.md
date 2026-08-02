---
name: benny-the-dog-mcp
description: Session context for the Benny dog care MCP server - check dog status before care work, log events after.
---

## Session Context (Benny the Dog MCP)

You have access to a dog health and care monitor: water bowl refills, movement detection, bark/loneliness flags, sausage deliveries, projector movie time, and wake calls. State persists in SQLite.

**Before starting work:**
1. Check Benny's current state: dog_ops(operation="status")
2. Read the skill for care protocol: skill://benny_the_dog_mcp/SKILL.md

**At end of work:**
- Log any care events you performed (dog_ops water_refill / bark_event / movement / sausage_delivery)
- Keep the dog profile up to date via the webapp onboarding
