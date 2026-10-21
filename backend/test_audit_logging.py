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

def test_audit_logging():
    print("=== Testing Part 2: Audit Logging & Event Tracking ===")

    # 1. Register test user
    uid = str(uuid.uuid4())[:8]
    username = f"audit_{uid}"
    email = f"audit_{uid}@geovision.ai"
    password = "AuditPassword123!"

    reg_data = {
        "username": username,
        "email": email,
        "password": password,
        "full_name": "Audit Test User",
    }
    status, reg_body = make_request(
        f"{BASE_URL}/auth/register",
        method="POST",
        data=reg_data
    )
    if status not in (200, 201):
        print(f"FAILED: User registration returned {status} - {reg_body}")
        sys.exit(1)
    user_id = reg_body.get("id")
    print(f"[OK] 1. User registered: {username} (ID: {user_id})")

    # 2. Login to get token and log USER_LOGIN
    status, login_body = make_request(
        f"{BASE_URL}/auth/login",
        method="POST",
        data={"username": username, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if status != 200:
        print(f"FAILED: Login returned {status} - {login_body}")
        sys.exit(1)

    access_token = login_body.get("access_token")
    auth_headers = {"Authorization": f"Bearer {access_token}"}
    print(f"[OK] 2. Login successful! Token acquired.")

    # 3. Create a project to trigger PROJECT_CREATE audit log
    proj_name = f"Audit Project {uid}"
    status, proj_body = make_request(
        f"{BASE_URL}/projects",
        method="POST",
        data={"name": proj_name, "description": "Audit logging test project"},
        headers=auth_headers
    )
    if status not in (200, 201):
        print(f"FAILED: Create project returned {status} - {proj_body}")
        sys.exit(1)
    proj_id = proj_body.get("id")
    print(f"[OK] 3. Project created: '{proj_name}' (ID: {proj_id})")

    # 4. Query GET /audit/logs
    status, logs = make_request(
        f"{BASE_URL}/audit/logs?limit=20",
        headers=auth_headers
    )
    if status != 200:
        print(f"FAILED: GET /audit/logs returned {status} - {logs}")
        sys.exit(1)

    print(f"[OK] 4. Retrieved {len(logs)} audit logs from API.")
    actions_logged = [log.get("action") for log in logs]
    print(f"   - Recent logged actions: {actions_logged[:5]}")

    # Check that USER_REGISTER and PROJECT_CREATE actions exist
    has_register = any(l.get("action") == "USER_REGISTER" for l in logs)
    has_login = any(l.get("action") == "USER_LOGIN" for l in logs)
    has_proj_create = any(l.get("action") == "PROJECT_CREATE" for l in logs)

    if not (has_register and has_login and has_proj_create):
        print(f"FAILED: Audit logs missing expected actions! Actions found: {actions_logged}")
        sys.exit(1)

    # 5. Query entity-specific audit logs GET /audit/logs/project/{proj_id}
    status, entity_logs = make_request(
        f"{BASE_URL}/audit/logs/project/{proj_id}",
        headers=auth_headers
    )
    if status != 200:
        print(f"FAILED: GET /audit/logs/project/{proj_id} returned {status} - {entity_logs}")
        sys.exit(1)

    print(f"[OK] 5. Retrieved entity audit trail for project #{proj_id}: {len(entity_logs)} entry(ies)")
    if len(entity_logs) > 0:
        log_e = entity_logs[0]
        print(f"   - Action: {log_e.get('action')}")
        print(f"   - Description: {log_e.get('description')}")
        print(f"   - Entity Type: {log_e.get('entity_type')}")
        print(f"   - Entity ID: {log_e.get('entity_id')}")
        print(f"   - IP Address: {log_e.get('ip_address')}")

    print("\n[SUCCESS] ALL PART 2 AUDIT LOGGING TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_audit_logging()
