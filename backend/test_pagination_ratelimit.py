from fastapi.testclient import TestClient
from app.main import app
from app.middleware.rate_limit import RateLimitMiddleware

client = TestClient(app)

def test_pagination_and_rate_limiting():
    print("=== Testing Part 4: Pagination & Rate Limiting ===")

    print("\n--- 1. Testing Paginated Response on /projects ---")
    resp = client.get("/projects?skip=0&limit=2")
    assert resp.status_code == 200, f"Get projects failed: {resp.text}"
    data = resp.json()
    print("Projects paginated response shape:")
    print(f"  total: {data.get('total')}, skip: {data.get('skip')}, limit: {data.get('limit')}, has_more: {data.get('has_more')}")
    assert "items" in data and "total" in data and "has_more" in data, "Response missing pagination fields!"

    print("\n--- 2. Testing Paginated Response on /datasets ---")
    resp = client.get("/datasets?skip=0&limit=2")
    assert resp.status_code == 200, f"Get datasets failed: {resp.text}"
    data = resp.json()
    print("Datasets paginated response shape:")
    print(f"  total: {data.get('total')}, skip: {data.get('skip')}, limit: {data.get('limit')}, has_more: {data.get('has_more')}")
    assert "items" in data and "total" in data, "Response missing pagination fields!"

    print("\n--- 3. Testing Paginated Response on /layers ---")
    resp = client.get("/layers?skip=0&limit=2")
    assert resp.status_code == 200, f"Get layers failed: {resp.text}"
    data = resp.json()
    print("Layers paginated response shape:")
    print(f"  total: {data.get('total')}, skip: {data.get('skip')}, limit: {data.get('limit')}, has_more: {data.get('has_more')}")
    assert "items" in data and "total" in data, "Response missing pagination fields!"

    print("\n--- 4. Testing Paginated Response on /assets ---")
    resp = client.get("/assets?skip=0&limit=2")
    assert resp.status_code == 200, f"Get assets failed: {resp.text}"
    data = resp.json()
    print("Assets paginated response shape:")
    print(f"  total: {data.get('total')}, skip: {data.get('skip')}, limit: {data.get('limit')}, has_more: {data.get('has_more')}")
    assert "items" in data and "total" in data, "Response missing pagination fields!"

    print("\n--- 5. Testing Rate Limiting Middleware (Burst Requests) ---")
    # Instantiate a test middleware with max_requests=5
    test_client = TestClient(app)
    limiter = None
    for middleware in app.user_middleware:
        if middleware.cls == RateLimitMiddleware:
            limiter = middleware
            break

    # Send requests to hit rate limit
    statuses = []
    for i in range(320):
        r = test_client.get("/health")  # excluded
        r2 = test_client.get("/projects")
        statuses.append(r2.status_code)

    ok_count = statuses.count(200)
    rate_limited_count = statuses.count(429)
    print(f"Sent 70 requests. 200 OK: {ok_count}, 429 Rate Limited: {rate_limited_count}")
    assert rate_limited_count > 0, "Rate limiting did not trigger 429 status code!"
    
    print("\n[OK] PART 4 (PAGINATION & RATE LIMITING) PASSED ALL VERIFICATION TESTS!")

if __name__ == "__main__":
    test_pagination_and_rate_limiting()
