// Mock data for Arduino dashboard

// Generate realistic mock readings
const generateMockReading = () => {
  const baseVoltage = 220 + (Math.random() * 10 - 5);
  const baseCurrent = 2 + (Math.random() * 1);
  const power = (baseVoltage * baseCurrent) / 1000; // kW
  
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    voltage: parseFloat(baseVoltage.toFixed(2)),
    current: parseFloat(baseCurrent.toFixed(3)),
    power: parseFloat(power.toFixed(4)),
    timestamp: new Date().toISOString()
  };
};

// Generate historical data (last 24 hours)
const generateHistoricalData = (points = 50) => {
  const data = [];
  const now = Date.now();
  const interval = (24 * 60 * 60 * 1000) / points; // 24 hours divided by points
  
  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now - (i * interval));
    const baseVoltage = 220 + (Math.random() * 10 - 5);
    const baseCurrent = 2 + (Math.random() * 1.5);
    const power = (baseVoltage * baseCurrent) / 1000;
    
    data.push({
      id: timestamp.getTime().toString(),
      voltage: parseFloat(baseVoltage.toFixed(2)),
      current: parseFloat(baseCurrent.toFixed(3)),
      power: parseFloat(power.toFixed(4)),
      timestamp: timestamp.toISOString()
    });
  }
  
  return data;
};

// Store readings in memory
let mockReadings = generateHistoricalData();

// Default slab-based pricing structure (common in India)
let pricingSlabs = [
  { minUnits: 0, maxUnits: 20, pricePerUnit: 3.5 },
  { minUnits: 20, maxUnits: 30, pricePerUnit: 5.0 },
  { minUnits: 30, maxUnits: 50, pricePerUnit: 6.5 },
  { minUnits: 50, maxUnits: 100, pricePerUnit: 8.0 },
  { minUnits: 100, maxUnits: null, pricePerUnit: 10.0 } // null means unlimited
];

// Calculate cost based on slab pricing
const calculateSlabBasedCost = (totalUnits) => {
  let totalCost = 0;
  let remainingUnits = totalUnits;
  
  for (const slab of pricingSlabs) {
    if (remainingUnits <= 0) break;
    
    const slabCapacity = slab.maxUnits ? (slab.maxUnits - slab.minUnits) : remainingUnits;
    const unitsInThisSlab = Math.min(remainingUnits, slabCapacity);
    
    totalCost += unitsInThisSlab * slab.pricePerUnit;
    remainingUnits -= unitsInThisSlab;
  }
  
  return totalCost;
};

// Mock API functions
export const mockApi = {
  // Get current reading
  getCurrentReading: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reading = generateMockReading();
        mockReadings.push(reading);
        // Keep only last 100 readings
        if (mockReadings.length > 100) {
          mockReadings = mockReadings.slice(-100);
        }
        resolve(reading);
      }, 300);
    });
  },
  
  // Get all readings
  getAllReadings: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockReadings);
      }, 200);
    });
  },
  
  // Post new reading (simulate Arduino POST)
  postReading: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reading = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...data,
          timestamp: new Date().toISOString()
        };
        mockReadings.push(reading);
        if (mockReadings.length > 100) {
          mockReadings = mockReadings.slice(-100);
        }
        resolve(reading);
      }, 200);
    });
  },
  
  // Get pricing slabs
  getPricingSlabs: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ slabs: pricingSlabs });
      }, 100);
    });
  },
  
  // Update pricing slabs
  updatePricingSlabs: (newSlabs) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        pricingSlabs = newSlabs;
        resolve({ slabs: pricingSlabs });
      }, 100);
    });
  },
  
  // Calculate total cost
  calculateCost: (startDate, endDate) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        const relevantReadings = mockReadings.filter(r => {
          const time = new Date(r.timestamp).getTime();
          return time >= start && time <= end;
        });
        
        // Calculate total energy consumption (kWh)
        let totalEnergy = 0;
        for (let i = 1; i < relevantReadings.length; i++) {
          const timeDiff = (new Date(relevantReadings[i].timestamp) - new Date(relevantReadings[i-1].timestamp)) / (1000 * 60 * 60); // hours
          const avgPower = (relevantReadings[i].power + relevantReadings[i-1].power) / 2; // kW
          totalEnergy += avgPower * timeDiff; // kWh
        }
        
        // Calculate cost using slab-based pricing
        const totalCost = calculateSlabBasedCost(totalEnergy);
        
        // Calculate breakdown by slab
        const slabBreakdown = [];
        let remainingUnits = totalEnergy;
        
        for (const slab of pricingSlabs) {
          if (remainingUnits <= 0) break;
          
          const slabCapacity = slab.maxUnits ? (slab.maxUnits - slab.minUnits) : remainingUnits;
          const unitsInThisSlab = Math.min(remainingUnits, slabCapacity);
          
          if (unitsInThisSlab > 0) {
            slabBreakdown.push({
              range: slab.maxUnits ? `${slab.minUnits}-${slab.maxUnits}` : `${slab.minUnits}+`,
              units: unitsInThisSlab,
              pricePerUnit: slab.pricePerUnit,
              cost: unitsInThisSlab * slab.pricePerUnit
            });
          }
          
          remainingUnits -= unitsInThisSlab;
        }
        
        resolve({
          totalEnergy: parseFloat(totalEnergy.toFixed(4)),
          totalCost: parseFloat(totalCost.toFixed(2)),
          slabBreakdown,
          readingsCount: relevantReadings.length
        });
      }, 300);
    });
  }
};

export default mockApi;