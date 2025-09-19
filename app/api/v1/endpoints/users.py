from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter()


class UserResponse(BaseModel):
    id: str
    email: EmailStr | None = None
    display_name: str | None = None


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    # Placeholder: fetch from SQL DB joined to Supabase auth id
    if user_id == "demo":
        return UserResponse(id="demo", email="demo@example.com", display_name="Demo User")
    raise HTTPException(status_code=404, detail="User not found")


