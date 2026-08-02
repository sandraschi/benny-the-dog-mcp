"""API coverage tests for benny-the-dog-mcp (REST surface + dog_ops)."""

import httpx
import pytest


@pytest.fixture
async def client():
    from benny_the_dog_mcp.server import app

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_capabilities(client):
    resp = await client.get("/api/capabilities")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "dog_ops" in body["features"]
    assert body["tool_count"] >= 1


@pytest.mark.asyncio
async def test_diagnostics(client):
    resp = await client.get("/api/v1/diagnostics")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    names = [t["name"] for t in body["tools"]]
    assert "dog_ops" in names
    assert body["system"]["windows"] is True


@pytest.mark.asyncio
async def test_skills_endpoints(client):
    resp = await client.get("/api/skills")
    assert resp.status_code == 200
    assert "benny_the_dog_mcp" in resp.json()["skills"]

    content = await client.get("/skill/benny_the_dog_mcp")
    assert content.status_code == 200
    assert "dog_ops" in content.text

    missing = await client.get("/skill/does_not_exist")
    assert missing.json() == "not found"


@pytest.mark.asyncio
async def test_partners_crud(client):
    import uuid

    email = f"walker-{uuid.uuid4().hex[:8]}@fleet.local"
    add = await client.post(
        "/api/partners",
        json={"name": "Sandra", "email": email, "tags": "dog walker, dog homestay"},
    )
    assert add.status_code == 200
    assert add.json()["success"] is True
    partner_id = add.json()["partner"]["id"]

    listed = await client.get("/api/partners")
    assert any(p["id"] == partner_id for p in listed.json()["partners"])
    assert listed.json()["partners"][0]["tags"] == "dog walker,dog homestay"

    legacy = await client.get("/api/members")
    assert legacy.json()["success"] is True
    assert any(p["id"] == partner_id for p in legacy.json()["members"])

    deleted = await client.delete(f"/api/partners/{partner_id}")
    assert deleted.json()["success"] is True

    bad = await client.post("/api/partners", json={})
    assert bad.json()["success"] is False


@pytest.mark.asyncio
async def test_products_and_orders(client):
    products = await client.get("/api/products")
    assert products.status_code == 200
    assert len(products.json()["products"]) >= 1

    order = await client.post(
        "/api/orders", json={"items": '[{"id": 1, "name": "MCP mug"}]', "total_cents": 1599}
    )
    assert order.json()["success"] is True
    assert order.json()["order"]["total_cents"] == 1599

    bad = await client.post("/api/orders", json={"items": "x"})
    assert bad.json()["success"] is False


@pytest.mark.asyncio
async def test_logs_and_jobs(client):
    logs = await client.get("/api/logs?limit=5")
    assert logs.status_code == 200
    assert logs.json()["success"] is True
    assert logs.json()["count"] <= 5

    jobs = await client.get("/api/jobs")
    assert jobs.status_code == 200
    assert jobs.json()["success"] is True

    run = await client.post("/api/jobs/patrol/run")
    assert run.status_code == 200
    assert run.json()["success"] is True

    unknown = await client.post("/api/jobs/nope/run")
    assert unknown.json()["success"] is False


@pytest.mark.asyncio
async def test_dog_pics_crud(client):
    add = await client.post(
        "/api/dog/pics",
        json={"name": "benny.png", "mime": "image/png", "data": "aGVsbG8="},
    )
    assert add.json()["success"] is True
    pic_id = add.json()["pic"]["id"]

    listed = await client.get("/api/dog/pics")
    assert any(p["id"] == pic_id for p in listed.json()["pics"])

    deleted = await client.delete(f"/api/dog/pics/{pic_id}")
    assert deleted.json()["success"] is True

    bad = await client.post("/api/dog/pics", json={})
    assert bad.json()["success"] is False


@pytest.mark.asyncio
async def test_dog_tracks_validation(client):
    bad = await client.post("/api/dog/tracks", json={"track_type": "cave", "name": "x"})
    assert bad.json()["success"] is False


@pytest.mark.asyncio
async def test_dog_events_endpoint(client):
    await client.post("/api/dog/tracks", json={"track_type": "park", "name": "x"})
    listed = await client.get("/api/dog/events?limit=10")
    assert listed.status_code == 200
    assert listed.json()["success"] is True
    assert listed.json()["count"] <= 10

    empty = await client.get("/api/dog/events?event_type=nonexistent")
    assert empty.json()["count"] == 0

    capped = await client.get("/api/dog/events?limit=9999")
    assert capped.json()["count"] <= 200


@pytest.mark.asyncio
async def test_vaccinations_crud(client):
    add = await client.post(
        "/api/dog/vaccinations",
        json={
            "name": "Rabies",
            "administered_date": "2026-01-15",
            "next_due_date": "2027-01-15",
            "notes": "booster",
        },
    )
    assert add.json()["success"] is True
    vacc_id = add.json()["vaccination"]["id"]

    listed = await client.get("/api/dog/vaccinations")
    assert any(v["id"] == vacc_id for v in listed.json()["vaccinations"])

    deleted = await client.delete(f"/api/dog/vaccinations/{vacc_id}")
    assert deleted.json()["success"] is True

    bad = await client.post("/api/dog/vaccinations", json={"name": "X"})
    assert bad.json()["success"] is False


@pytest.mark.asyncio
async def test_vet_visits_crud(client):
    add = await client.post(
        "/api/dog/vet-visits",
        json={
            "visit_date": "2026-06-01",
            "reason": "annual checkup",
            "findings": "healthy",
            "cost_cents": 6500,
        },
    )
    assert add.json()["success"] is True
    visit_id = add.json()["visit"]["id"]

    listed = await client.get("/api/dog/vet-visits")
    assert any(v["id"] == visit_id for v in listed.json()["visits"])
    assert listed.json()["visits"][0]["cost_cents"] == 6500

    deleted = await client.delete(f"/api/dog/vet-visits/{visit_id}")
    assert deleted.json()["success"] is True

    bad = await client.post("/api/dog/vet-visits", json={"visit_date": "2026-06-01"})
    assert bad.json()["success"] is False
