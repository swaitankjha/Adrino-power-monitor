from fastapi import APIRouter

router = APIRouter()

pricing_slabs = [
    {"minUnits": 0, "maxUnits": 50, "pricePerUnit": 3},
    {"minUnits": 51, "maxUnits": 100, "pricePerUnit": 4.5},
    {"minUnits": 101, "maxUnits": 200, "pricePerUnit": 6},
    {"minUnits": 200, "maxUnits": None, "pricePerUnit": 8},
]

@router.get("/pricing-slabs")
async def get_slabs():
    return {"slabs": pricing_slabs}

@router.post("/update")
async def update_slabs(data: dict):
    global pricing_slabs
    pricing_slabs = data.get("slabs", pricing_slabs)
    return {"status": "updated", "slabs": pricing_slabs}
