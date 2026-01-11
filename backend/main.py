from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from routes import readings, pricing

app = FastAPI()

# /api root
router = APIRouter(prefix="/api")

@router.get("/")
async def api_root():
    return {"message": "Backend is working!"}

app.include_router(router)
app.include_router(readings.router, prefix="/api/readings")
app.include_router(pricing.router, prefix="/api/pricing")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
