from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr


@router.post("/login")
async def login(req: LoginRequest):
    # Placeholder: integrate with Supabase Auth (magic link) or JWT issuance
    return {"message": "Magic link sent (stub)", "email": req.email}


@router.get("/me")
async def me():
    # Placeholder: return current user info once auth middleware is added
    return {"id": "user_123", "email": "demo@example.com"}


