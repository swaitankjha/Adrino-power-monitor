from fastapi import APIRouter, HTTPException
from datetime import datetime
from models import CostCalculationRequest, CostCalculationResponse, SlabBreakdown, Reading
from database import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["cost"])

def calculate_slab_based_cost(total_units: float, slabs: list) -> tuple:
    """
    Calculate cost based on slab pricing
    Returns (total_cost, breakdown)
    """
    total_cost = 0
    remaining_units = total_units
    breakdown = []
    
    for slab in slabs:
        if remaining_units <= 0:
            break
        
        slab_capacity = (slab["maxUnits"] - slab["minUnits"]) if slab["maxUnits"] else remaining_units
        units_in_slab = min(remaining_units, slab_capacity)
        
        if units_in_slab > 0:
            cost = units_in_slab * slab["pricePerUnit"]
            total_cost += cost
            
            breakdown.append(SlabBreakdown(
                range=f"{slab['minUnits']}-{slab['maxUnits']}" if slab["maxUnits"] else f"{slab['minUnits']}+",
                units=round(units_in_slab, 4),
                pricePerUnit=slab["pricePerUnit"],
                cost=round(cost, 2)
            ))
            
            remaining_units -= units_in_slab
    
    return round(total_cost, 2), breakdown

def calculate_energy_from_readings(readings: list) -> float:
    """
    Calculate total energy consumption from readings
    """
    if len(readings) < 2:
        return 0
    
    total_energy = 0
    
    for i in range(1, len(readings)):
        # Time difference in hours
        time_diff = (readings[i]["timestamp"] - readings[i-1]["timestamp"]).total_seconds() / 3600
        
        # Average power in kW
        avg_power = (readings[i]["power"] + readings[i-1]["power"]) / 2
        
        # Energy in kWh
        energy = avg_power * time_diff
        total_energy += energy
    
    return total_energy

@router.post("/calculate-cost", response_model=CostCalculationResponse)
async def calculate_cost(request: CostCalculationRequest):
    """
    Calculate cost for a time period
    """
    try:
        # Parse dates
        start_date = datetime.fromisoformat(request.startDate.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(request.endDate.replace('Z', '+00:00'))
        
        # Fetch readings in the time range
        query = {
            "timestamp": {
                "$gte": start_date,
                "$lte": end_date
            }
        }
        
        readings = await db.readings.find(query).sort("timestamp", 1).to_list(10000)
        
        if not readings:
            return CostCalculationResponse(
                totalEnergy=0,
                totalCost=0,
                slabBreakdown=[],
                readingsCount=0
            )
        
        # Calculate total energy
        total_energy = calculate_energy_from_readings(readings)
        
        # Fetch pricing slabs
        slabs = await db.pricing_slabs.find().sort("order", 1).to_list(100)
        
        if not slabs:
            raise HTTPException(status_code=404, detail="No pricing slabs configured")
        
        # Calculate cost
        total_cost, breakdown = calculate_slab_based_cost(total_energy, slabs)
        
        return CostCalculationResponse(
            totalEnergy=round(total_energy, 4),
            totalCost=total_cost,
            slabBreakdown=breakdown,
            readingsCount=len(readings)
        )
        
    except Exception as e:
        logger.error(f"Error calculating cost: {e}")
        raise HTTPException(status_code=500, detail=str(e))
