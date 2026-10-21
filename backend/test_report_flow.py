import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    encoded_data = None
    if data is not None:
        encoded_data = json.dumps(data).encode('utf-8')
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            body = response.read()
            return response.status, body, response.headers
    except urllib.error.HTTPError as e:
        body = e.read()
        return e.code, body, e.headers

def test_report_flow():
    print("--- 1. Login to get JWT access token ---")
    login_data = {
        "email": "test@geovision.ai",
        "password": "Password123!"
    }
    status, body, _ = make_request(f"{BASE_URL}/api/v1/auth/login", method="POST", data=login_data)
    if status != 200:
        print(f"Login failed: {status}, {body.decode()}")
        # Let's register if login fails
        reg_data = {
            "email": "test@geovision.ai",
            "password": "Password123!",
            "full_name": "Test User",
            "department_id": 1
        }
        make_request(f"{BASE_URL}/api/v1/auth/register", method="POST", data=reg_data)
        status, body, _ = make_request(f"{BASE_URL}/api/v1/auth/login", method="POST", data=login_data)
        assert status == 200, f"Login failed: {body.decode()}"
    
    resp_json = json.loads(body.decode())
    access_token = resp_json["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("Access token retrieved successfully.")

    print("\n--- 2. Fetch or create a project for report generation ---")
    status, proj_body, _ = make_request(f"{BASE_URL}/api/v1/projects/", method="GET", headers=headers)
    projects = json.loads(proj_body.decode())
    project_id = None
    if isinstance(projects, list) and len(projects) > 0:
        project_id = projects[0]["id"]
        print(f"Using existing project ID: {project_id}")
    else:
        new_proj = {
            "name": "Report Test Project",
            "description": "Test project for PDF generation",
            "status": "active"
        }
        status, new_proj_body, _ = make_request(f"{BASE_URL}/api/v1/projects/", method="POST", data=new_proj, headers=headers)
        created_p = json.loads(new_proj_body.decode())
        project_id = created_p["id"]
        print(f"Created new project ID: {project_id}")

    print("\n--- 3. Generate Executive PDF Report ---")
    gen_payload = {
        "project_id": project_id,
        "title": "Shimla Urban GIS Infrastructure Audit",
        "notes": "Comprehensive evaluation of land-use zoning and steep topography risk."
    }
    status, gen_body, _ = make_request(f"{BASE_URL}/api/v1/reports/generate", method="POST", data=gen_payload, headers=headers)
    assert status == 200, f"Report generation failed ({status}): {gen_body.decode()}"
    report_info = json.loads(gen_body.decode())
    report_id = report_info["id"]
    print(f"Report generated successfully! Report ID: {report_id}, File path: {report_info.get('file_path')}")

    print("\n--- 4. List Reports for Project ---")
    status, list_body, _ = make_request(f"{BASE_URL}/api/v1/reports/project/{project_id}", method="GET", headers=headers)
    assert status == 200, f"List reports failed: {list_body.decode()}"
    reports_list = json.loads(list_body.decode())
    print(f"Found {len(reports_list)} report(s) for project ID {project_id}.")

    print("\n--- 5. Download Generated PDF Report ---")
    status, pdf_bytes, resp_headers = make_request(f"{BASE_URL}/api/v1/reports/{report_id}/download", method="GET", headers=headers)
    assert status == 200, f"PDF download failed ({status}): {pdf_bytes}"
    assert len(pdf_bytes) > 0, "PDF file is empty!"
    assert pdf_bytes.startswith(b"%PDF"), "Downloaded file does not start with PDF header (%PDF)"
    print(f"PDF downloaded successfully! Total byte size: {len(pdf_bytes)} bytes.")

    print("\n--- 6. Delete Generated Report ---")
    status, del_body, _ = make_request(f"{BASE_URL}/api/v1/reports/{report_id}", method="DELETE", headers=headers)
    assert status == 200, f"Report deletion failed: {del_body.decode()}"
    print("Report deleted successfully.")

    print("\n✅ PART 3 (REPORT GENERATION API) PASSED ALL VERIFICATION TESTS!")

if __name__ == "__main__":
    test_report_flow()
