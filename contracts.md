# Arduino Power Monitor - Backend Integration Contracts

## Overview
This document outlines the API contracts, data models, and integration approach for the Arduino Power Monitor dashboard.

## Database Models

### 1. Reading Model
```python
{
    "id": "string (auto-generated)",
    "voltage": float,
    "current": float,
    "power": float,
    "timestamp": datetime
}
```

### 2. PricingSlab Model
```python
{
    "id": "string (auto-generated)",
    "minUnits": int,
    "maxUnits": int or null (null means unlimited),
    "pricePerUnit": float,
    "order": int (for sorting)
}
```

## API Endpoints

### Readings API

#### POST /api/readings
**Purpose**: Arduino posts sensor data
**Request Body**:
```json
{
    "voltage": 220.5,
    "current": 2.5,
    "power": 0.551
}
```
**Response**:
```json
{
    "id": "...",
    "voltage": 220.5,
    "current": 2.5,
    "power": 0.551,
    "timestamp": "2025-01-09T10:30:00Z"
}
```

#### GET /api/readings
**Purpose**: Fetch all readings (last 100)
**Query Params**: 
- limit (optional, default 100)
- startDate (optional)
- endDate (optional)
**Response**:
```json
{
    "readings": [...],
    "count": 100
}
```

#### GET /api/readings/latest
**Purpose**: Get the most recent reading
**Response**:
```json
{
    "id": "...",
    "voltage": 220.5,
    "current": 2.5,
    "power": 0.551,
    "timestamp": "2025-01-09T10:30:00Z"
}
```

### Pricing Slabs API

#### GET /api/pricing-slabs
**Purpose**: Get all pricing slabs
**Response**:
```json
{
    "slabs": [
        {
            "id": "...",
            "minUnits": 0,
            "maxUnits": 20,
            "pricePerUnit": 3.5,
            "order": 1
        },
        ...
    ]
}
```

#### PUT /api/pricing-slabs
**Purpose**: Update all pricing slabs
**Request Body**:
```json
{
    "slabs": [
        {
            "minUnits": 0,
            "maxUnits": 20,
            "pricePerUnit": 3.5
        },
        ...
    ]
}
```
**Response**:
```json
{
    "slabs": [...],
    "message": "Pricing slabs updated successfully"
}
```

### Cost Calculation API

#### POST /api/calculate-cost
**Purpose**: Calculate cost for a time period
**Request Body**:
```json
{
    "startDate": "2025-01-08T10:00:00Z",
    "endDate": "2025-01-09T10:00:00Z"
}
```
**Response**:
```json
{
    "totalEnergy": 14.3127,
    "totalCost": 50.09,
    "slabBreakdown": [
        {
            "range": "0-20",
            "units": 14.3127,
            "pricePerUnit": 3.5,
            "cost": 50.09
        }
    ],
    "readingsCount": 51
}
```

## Mock Data Replacement

### Frontend files to update:
1. **mock.js** - Remove mock API functions
2. **Dashboard.jsx** - Replace mockApi calls with axios API calls
3. **CostCalculator.jsx** - Replace mockApi calls with axios API calls
4. **PricingSlabsConfig.jsx** - Replace mockApi calls with axios API calls

### Integration Steps:
1. Create new file: `/app/frontend/src/api/index.js` with all API functions
2. Update all components to import from `api/index.js` instead of `mock.js`
3. Remove mock.js file after integration

## Backend Implementation Plan

### Phase 1: Models and Database Setup
- Create Reading model
- Create PricingSlab model
- Initialize default pricing slabs if none exist

### Phase 2: API Endpoints
- Implement all readings endpoints
- Implement pricing slabs endpoints
- Implement cost calculation endpoint with slab-based logic

### Phase 3: Frontend Integration
- Create centralized API service
- Replace all mock calls with actual API calls
- Test all features end-to-end

## Business Logic

### Cost Calculation Algorithm
```
For each slab in order:
    If remaining_units <= 0: break
    
    slab_capacity = slab.maxUnits - slab.minUnits (or remaining_units if unlimited)
    units_in_slab = min(remaining_units, slab_capacity)
    
    cost += units_in_slab * slab.pricePerUnit
    remaining_units -= units_in_slab

Return total_cost
```

### Energy Calculation from Readings
```
For each pair of consecutive readings:
    time_diff_hours = (reading[i].timestamp - reading[i-1].timestamp) / 3600
    avg_power_kw = (reading[i].power + reading[i-1].power) / 2
    energy_kwh += avg_power_kw * time_diff_hours

Return total_energy_kwh
```

## Notes
- All timestamps in ISO 8601 format (UTC)
- Power in kW (kilowatts)
- Voltage in V (volts)
- Current in A (amperes)
- Energy in kWh (kilowatt-hours)
- Cost in ₹ (Indian Rupees)
- Limit stored readings to 1000 max (configurable)
- Auto-cleanup old readings beyond limit
