# benny-the-dog-mcp

Benny the dog health and care monitor - water bowls, movement, loneliness detection, sausage deliveries, projector movie time, wake calls. Boomy-robot patrol integration ready.

## Session Context

You have access to a dog health and care monitor via MCP. State persists in SQLite.

**Before starting work:**
1. Check Benny's current state: dog_ops(operation="status")
2. Read the skill for care protocol: skill://benny_the_dog_mcp/SKILL.md

**At end of work:**
- Log any care events you performed (dog_ops water_refill / bark_event / movement / sausage_delivery)
- Keep the dog profile up to date via the webapp onboarding
