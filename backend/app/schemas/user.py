from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr
    full_name: str
    role_id: int
    department_id: int


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str

    class Config:
        from_attributes = True
        