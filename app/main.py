from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.api import api_router_v1

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    version="0.1.0"
)

app.include_router(api_router_v1, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": f"Welcome to {settings.APP_NAME}. API available at {settings.API_V1_STR}"}

# Placeholder for startup/shutdown events
@app.on_event("startup")
async def startup_event():
    # Example: Initialize database connections
    # from app.db.mongodb_utils import connect_to_mongo, get_mongo_db
    # app.state.mongodb_client = await connect_to_mongo(settings.MONGODB_URL)
    # app.state.db = get_mongo_db(app.state.mongodb_client, settings.MONGODB_DB_NAME)
    # print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    print(f"{settings.APP_NAME} started.")

@app.on_event("shutdown")
async def shutdown_event():
    # Example: Close database connections
    # from app.db.mongodb_utils import close_mongo_connection
    # if hasattr(app.state, 'mongodb_client') and app.state.mongodb_client:
    #     await close_mongo_connection(app.state.mongodb_client)
    #     print("MongoDB connection closed.")
    print(f"{settings.APP_NAME} shutting down.")