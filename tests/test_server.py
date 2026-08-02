"""Backend smoke tests for benny-the-dog-mcp."""

import httpx
import pytest


@pytest.mark.asyncio
async def test_health_endpoint():
    from benny_the_dog_mcp.server import app

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["tool_count"] >= 1


@pytest.mark.asyncio
async def test_tools_endpoint():
    from benny_the_dog_mcp.server import app

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/tools")
        assert resp.status_code == 200
        names = [t["name"] for t in resp.json()["tools"]]
        assert "app_info" in names


@pytest.mark.asyncio
async def test_dog_profile_roundtrip():
    from benny_the_dog_mcp.server import app

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "name": "Benny",
            "breed": "Beagle mix",
            "energy_level": "high",
            "barkiness": "opinionated",
            "onboarded": 1,
        }
        put = await client.put("/api/dog/profile", json=payload)
        assert put.status_code == 200
        assert put.json()["profile"]["name"] == "Benny"

        get = await client.get("/api/dog/profile")
        assert get.status_code == 200
        assert get.json()["profile"]["onboarded"] == 1


@pytest.mark.asyncio
async def test_dog_tracks_crud():
    from benny_the_dog_mcp.server import app

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        add = await client.post(
            "/api/dog/tracks",
            json={"track_type": "fountain", "name": "Corner fountain", "lat": 48.2, "lon": 16.37},
        )
        assert add.status_code == 200
        track_id = add.json()["track"]["id"]

        listed = await client.get("/api/dog/tracks")
        assert any(t["id"] == track_id for t in listed.json()["tracks"])

        deleted = await client.delete(f"/api/dog/tracks/{track_id}")
        assert deleted.json()["success"] is True
