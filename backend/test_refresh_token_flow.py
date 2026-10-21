import json
import urllib.request
import urllib.parse
import sys
import uuid

BASE_URL = "http://127.0.0.1:8000"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    encoded_data = None
    if data is not None:
        if isinstance(data, dict) and headers.get("Content-Type") == "application/x-www-form-urlencoded":
            encoded_data = urllib.parse.urlencode(data).encode("utf-8")
        elif isinstance(data, dict):
            encoded_data = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            encoded_data = data

    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(res_body)
        except Exception:
            parsed = {"detail": res_body}
        return e.code, parsed

def test_refresh_flow():
    print("=== Testing Part 1: Refresh Token Flow & Rotation ===")

    # Generate unique test credentials
    uid = str(uuid.uuid4())[:8]
    username = f"user_{uid}"
    email = f"user_{uid}@geovision.ai"
    password = "TestPassword123!"

    # 0. Register user
    reg_data = {
        "username": username,
        "email": email,
        "password": password,
        "full_name": "Part 1 Test User",
    }
    status, body = make_request(
        f"{BASE_URL}/auth/register",
        method="POST",
        data=reg_data
    )
    if status not in (200, 201):
        print(f"FAILED: Registration returned {status} - {body}")
        sys.exit(1)
    print(f"[OK] 0. User registration successful: {username}")

    # 1. Login to get access_token + refresh_token
    login_data = {
        "username": username,
        "password": password,
    }
    status, body = make_request(
        f"{BASE_URL}/auth/login",
        method="POST",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if status != 200:
        print(f"FAILED: Login returned {status} - {body}")
        sys.exit(1)

    access_token1 = body.get("access_token")
    refresh_token1 = body.get("refresh_token")

    print(f"[OK] 1. Login successful!")
    print(f"   - Access Token 1: {access_token1[:25]}...")
    print(f"   - Refresh Token 1: {refresh_token1[:25]}...")

    if not refresh_token1:
        print("FAILED: Login did not return refresh_token!")
        sys.exit(1)

    # 2. Test /auth/me with access_token1
    status, body = make_request(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {access_token1}"}
    )
    if status != 200:
        print(f"FAILED: /auth/me returned {status} - {body}")
        sys.exit(1)
    print(f"[OK] 2. /auth/me authenticated user: {body.get('username')}")

    # 3. Rotate refresh_token1 via /auth/refresh
    status, body = make_request(
        f"{BASE_URL}/auth/refresh",
        method="POST",
        data={"refresh_token": refresh_token1}
    )
    if status != 200:
        print(f"FAILED: /auth/refresh returned {status} - {body}")
        sys.exit(1)

    access_token2 = body.get("access_token")
    refresh_token2 = body.get("refresh_token")

    print(f"[OK] 3. Token rotation successful!")
    print(f"   - New Access Token 2: {access_token2[:25]}...")
    print(f"   - New Refresh Token 2: {refresh_token2[:25]}...")

    if refresh_token1 == refresh_token2:
        print("FAILED: Refresh token was not rotated!")
        sys.exit(1)

    # 4. Test Theft Detection: Re-using old refresh_token1 should fail with 401
    status, body = make_request(
        f"{BASE_URL}/auth/refresh",
        method="POST",
        data={"refresh_token": refresh_token1}
    )
    if status == 401:
        print(f"[OK] 4. Theft detection passed! Re-using revoked refresh_token1 was correctly rejected: {body.get('detail')}")
    else:
        print(f"FAILED: Expected 401 when reusing old refresh token, got {status} - {body}")
        sys.exit(1)

    # 5. Logout with refresh_token2
    status, body = make_request(
        f"{BASE_URL}/auth/logout",
        method="POST",
        data={"refresh_token": refresh_token2}
    )
    if status == 200:
        print(f"[OK] 5. Logout successful: {body.get('message')}")
    else:
        print(f"FAILED: /auth/logout returned {status} - {body}")
        sys.exit(1)

    print("\n[SUCCESS] ALL PART 1 REFRESH TOKEN TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_refresh_flow()
