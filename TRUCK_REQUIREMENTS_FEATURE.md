# 🚛 Truck Requirements Feature Implementation

## Overview
This feature calculates the number of trucks required to transport different fuel types based on their volume and specific handling requirements.

## Features Implemented

### 1. **Real-time Truck Requirements Calculator**
- Shows truck requirements as user types in the volume field
- Updates automatically when fuel type changes
- Displays capacity utilization percentage

### 2. **Fuel-Specific Truck Capacities**
- **Hydrogen**: 8 tonnes per truck (specialized cryogenic transport)
- **Methanol**: 12 tonnes per truck (hazmat certified drivers required)
- **Ammonia**: 10 tonnes per truck (refrigerated transport required)
- **Gasoline/Diesel**: 12 tonnes per truck (standard transport)

### 3. **Detailed Information Display**
- Number of trucks required
- Total capacity vs. actual volume
- Utilization percentage
- Excess capacity
- Fuel-specific handling requirements

### 4. **API Endpoints**

#### POST `/api/truck-requirements`
Standalone endpoint for quick truck requirements calculation.

**Request:**
```json
{
  "volume": 100,
  "fuelType": "hydrogen"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trucksNeeded": 13,
    "maxCapacity": 8,
    "totalCapacity": 104,
    "utilizationPercent": 96,
    "excessCapacity": 4,
    "message": "🚛 **13 trucks required** for 100 tonnes of hydrogen (8 tonnes capacity per truck)",
    "handlingNote": "⚠️ Requires specialized cryogenic transport (-253°C)",
    "fuelType": "hydrogen",
    "volume": 100
  },
  "message": "🚛 **13 trucks required** for 100 tonnes of hydrogen (8 tonnes capacity per truck)"
}
```

#### Enhanced `/api/calculate-cost` Response
Now includes `truckRequirements` object in the response for full route calculations.

## Frontend Integration

### 1. **Real-time Display**
- Shows truck requirements as user types
- Updates automatically with fuel type changes
- Appears below volume input field

### 2. **Results Display**
- Prominent truck requirements section in results
- Color-coded display with truck emoji
- Detailed breakdown for multi-truck shipments

## Example Usage

### For 100 tonnes of Hydrogen:
- **Result**: 13 trucks required
- **Capacity**: 8 tonnes per truck (104 total capacity)
- **Utilization**: 96%
- **Special Requirements**: Cryogenic transport (-253°C)

### For 100 tonnes of Methanol:
- **Result**: 9 trucks required  
- **Capacity**: 12 tonnes per truck (108 total capacity)
- **Utilization**: 93%
- **Special Requirements**: Hazmat certified drivers

### For 100 tonnes of Ammonia:
- **Result**: 10 trucks required
- **Capacity**: 10 tonnes per truck (100 total capacity)
- **Utilization**: 100%
- **Special Requirements**: Refrigerated transport and toxic gas protocols

## Testing

Run the test script to see all fuel types:
```bash
cd backend
node test-truck-requirements.js
```

Test the API endpoint:
```bash
curl -X POST http://localhost:5001/api/truck-requirements \
  -H "Content-Type: application/json" \
  -d '{"volume": 100, "fuelType": "hydrogen"}'
```

## Files Modified

### Backend:
- `controllers/routeController.js` - Added `calculateTruckRequirements()` function
- `routes/routeRoutes.js` - Added `/truck-requirements` endpoint
- `server.js` - Updated available endpoints list

### Frontend:
- `components/FuelRouteApp.js` - Added real-time display and results section

### New Files:
- `test-truck-requirements.js` - Test script for truck requirements

## Key Benefits

1. **Immediate Feedback**: Users see truck requirements as they type
2. **Fuel-Specific**: Different capacities for different fuel types
3. **Safety Awareness**: Shows special handling requirements
4. **Cost Planning**: Helps users understand transportation logistics
5. **API Integration**: Available as standalone endpoint or part of route calculation

The feature provides clear, actionable information about transportation requirements, helping users make informed decisions about their fuel logistics needs.