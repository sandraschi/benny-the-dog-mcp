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
async def test_members_crud(client):
    add = await client.post("/api/members", json={"name": "Sandra", "email": "sandra@fleet.local"})
    assert add.status_code == 200
    assert add.json()["success"] is True
    member_id = add.json()["member"]["id"]

    listed = await client.get("/api/members")
    assert any(m["id"] == member_id for m in listed.json()["members"])

    deleted = await client.delete(f"/api/members/{member_id}")
    assert deleted.json()["success"] is True

    bad = await client.post("/api/members", json={})
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
