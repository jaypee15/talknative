import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.user import Profile

security = HTTPBearer()

class CurrentUser:
    """Current authenticated user context."""
    def __init__(self, user: Profile):
        self.user = user
        self.id = user.id
        self.email = user.email
        self.target_language = user.target_language
        self.proficiency_level = user.proficiency_level

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> CurrentUser:
    """
    Verify JWT token from Supabase and return current user.
    
    Raises:
        HTTPException: 401 if token is invalid or user not found.
    """
    token = credentials.credentials
    
    try:
        # Decode JWT using Supabase JWT secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        # Get or create user in our database
        user = db.query(Profile).filter(Profile.id == user_id).first()
        
        if not user:
            # Create user if doesn't exist (first login)
            user = Profile(id=user_id, email=email)
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return CurrentUser(user)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
