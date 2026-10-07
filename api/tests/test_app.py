from fastapi.testclient import TestClient


def test_health_and_security_headers(client: TestClient) -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.headers["x-content-type-options"] == "nosniff"
    assert res.headers["x-frame-options"] == "DENY"


def test_cross_site_post_is_rejected(client: TestClient) -> None:
    res = client.post("/api/v1/anything", headers={"Origin": "https://evil.example"})
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "forbidden_origin"


def test_unknown_route_returns_json_error_shape(client: TestClient) -> None:
    assert client.get("/api/v1/does-not-exist").status_code == 404
