from pydantic import BaseModel, EmailStr
from typing import Optional


class RoleResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class DepartmentResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr
    full_name: str
    role_id: Optional[int] = 1
    department_id: Optional[int] = 1


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    role: Optional[RoleResponse] = None
    department: Optional[DepartmentResponse] = None

    class Config:
        from_attributes = True