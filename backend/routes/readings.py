from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

# in-memory storage
latest_reading = None
readings_log = []

@router.post("/update")
async def update_reading(data: dict):
    global latest_reading, readings_log

    latest_reading = {
        "voltage": data.get("voltage", 0),
        "current": data.get("current", 0),
        "power": data.get("power", 0),
        "kwh": data.get("kwh", 0),
        "timestamp": datetime.utcnow().isoformat()
    }

    readings_log.append(latest_reading)

    # Keep only last 100
    readings_log = readings_log[-100:]

    return {"status": "ok", "reading": latest_reading}


@router.get("/latest")
async def get_latest():
    return latest_reading or {}


@router.get("/")
async def get_all(limit: int = 100):
    return readings_log[-limit:]
