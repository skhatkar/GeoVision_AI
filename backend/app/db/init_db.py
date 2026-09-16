import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.database import Base, engine
# Import all models to ensure metadata is populated
import app.models  # noqa: F401
from app.models.department import Department
from app.models.role import Role
from app.models.user import User
from app.core.security import hash_password

logger = logging.getLogger(__name__)


def init_db():
    # 0. Create all missing tables in database (including refresh_tokens)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Ensure Roles exist
        roles_data = [
            {"name": "Admin", "description": "State SuperAdmin with full access"},
            {"name": "GIS Analyst", "description": "Spatial analyst with data manipulation access"},
            {"name": "Department Officer", "description": "Department field officer with view & report access"},
        ]
        role_map = {}
        for r_info in roles_data:
            role = db.query(Role).filter(Role.name == r_info["name"]).first()
            if not role:
                role = Role(name=r_info["name"], description=r_info["description"])
                db.add(role)
                db.flush()
                logger.info(f"Seeded role: {role.name}")
            role_map[r_info["name"]] = role

        db.commit()

        # 2. Ensure Departments exist
        depts_data = [
            {"name": "IT & Digital Technologies", "description": "Department of Information Technology"},
            {"name": "Forest & Environment", "description": "Department of Forest and Environment"},
            {"name": "Health & Family Welfare", "description": "Department of Health"},
            {"name": "Police & Home Affairs", "description": "Department of Police"},
            {"name": "Revenue & Land Records", "description": "Department of Revenue"},
        ]
        dept_map = {}
        for d_info in depts_data:
            dept = db.query(Department).filter(Department.name.ilike(f"%{d_info['name']}%")).first()
            if not dept:
                dept = db.query(Department).filter(Department.name == d_info["name"]).first()
            if not dept:
                dept = Department(name=d_info["name"], description=d_info["description"])
                db.add(dept)
                db.flush()
                logger.info(f"Seeded department: {dept.name}")
            dept_map[d_info["name"]] = dept

        db.commit()

        # Re-fetch role & dept maps after commit
        for r_info in roles_data:
            r = db.query(Role).filter(Role.name == r_info["name"]).first()
            if r:
                role_map[r_info["name"]] = r

        # 3. Ensure Demo Users exist
        demo_users = [
            {
                "username": "admin",
                "email": "admin@hp.gov.in",
                "full_name": "Sunaina Khatkar",
                "password": "admin123",
                "role_name": "Admin",
                "dept_name": "IT & Digital Technologies",
            },
            {
                "username": "analyst",
                "email": "analyst@hp.gov.in",
                "full_name": "Dr. Vikram Sharma",
                "password": "analyst123",
                "role_name": "GIS Analyst",
                "dept_name": "IT & Digital Technologies",
            },
            {
                "username": "forest_officer",
                "email": "dfo.forest@hp.gov.in",
                "full_name": "Rajesh Thakur (DFO)",
                "password": "forest123",
                "role_name": "Department Officer",
                "dept_name": "Forest & Environment",
            },
        ]

        for u_info in demo_users:
            user = db.query(User).filter(User.username == u_info["username"]).first()
            role = role_map.get(u_info["role_name"])
            dept = dept_map.get(u_info["dept_name"])

            if not user:
                user = User(
                    username=u_info["username"],
                    email=u_info["email"],
                    full_name=u_info["full_name"],
                    password_hash=hash_password(u_info["password"]),
                    role_id=role.id if role else None,
                    department_id=dept.id if dept else None,
                    is_active=True,
                )
                db.add(user)
                print(f"Seeded demo user: {u_info['username']}")
            else:
                # Update password hash to ensure credentials line up
                user.password_hash = hash_password(u_info["password"])
                if role:
                    user.role_id = role.id
                if dept:
                    user.department_id = dept.id
                print(f"Updated demo user: {u_info['username']}")

        db.commit()
        print("SUCCESS: Tables & Demo roles/users initialized cleanly.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
