import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Zap, Activity, Gauge, DollarSign, Settings, TrendingUp } from 'lucide-react';
import api from '../api';
import MetricCard from './MetricCard';
import RealtimeChart from './RealtimeChart';
import HistoricalChart from './HistoricalChart';
import CostCalculator from './CostCalculator';
import PricingSlabsConfig from './PricingSlabsConfig';

import { toast } from '../hooks/use-toast';

const Dashboard = () => {
  const [currentReading, setCurrentReading] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [pricingSlabs, setPricingSlabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [readings, slabsData] = await Promise.all([
          api.readings.getAllReadings(),
          api.pricing.getPricingSlabs()
        ]);
        setHistoricalData(readings);
        setPricingSlabs(slabsData.slabs);
        if (readings.length > 0) {
          setCurrentReading(readings[readings.length - 1]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Poll for latest reading
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newReading = await api.readings.getCurrentReading();
        setCurrentReading(newReading);
        setHistoricalData(prev => [...prev.slice(-99), newReading]);
      } catch (error) {
        console.error('Error fetching reading:', error);
      }
    }, 2000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate cost per hour using slab-based pricing
  const realtimeCost = useMemo(() => {
    if (!currentReading || !pricingSlabs.length) return 0;
    
    // Calculate which slab the current consumption falls into
    const powerKW = currentReading.power;
    
    // Find applicable slab (simplified - using first slab rate for hourly estimate)
    const applicableSlab = pricingSlabs.find(slab => 
      slab.minUnits === 0 || (pricingSlabs.length > 0 && slab)
    ) || pricingSlabs[0];
    
    const costPerHour = powerKW * (applicableSlab?.pricePerUnit || 0);
    return costPerHour;
  }, [currentReading, pricingSlabs]);

  // Calculate total energy consumption (last 24h)
  const totalEnergy = useMemo(() => {
    if (historicalData.length < 2) return 0;
    
    let energy = 0;
    for (let i = 1; i < historicalData.length; i++) {
      const timeDiff = (new Date(historicalData[i].timestamp) - new Date(historicalData[i-1].timestamp)) / (1000 * 60 * 60);
      const avgPower = (historicalData[i].power + historicalData[i-1].power) / 2;
      energy += avgPower * timeDiff;
    }
    return energy;
  }, [historicalData]);

  // Calculate total cost using slab-based pricing
  const totalCost = useMemo(() => {
    if (!pricingSlabs.length || totalEnergy === 0) return 0;
    
    let cost = 0;
    let remainingUnits = totalEnergy;
    
    for (const slab of pricingSlabs) {
      if (remainingUnits <= 0) break;
      
      const slabCapacity = slab.maxUnits ? (slab.maxUnits - slab.minUnits) : remainingUnits;
      const unitsInThisSlab = Math.min(remainingUnits, slabCapacity);
      
      cost += unitsInThisSlab * slab.pricePerUnit;
      remainingUnits -= unitsInThisSlab;
    }
    
    return cost;
  }, [totalEnergy, pricingSlabs]);

  const handleSlabsUpdate = async (newSlabs) => {
    try {
      const response = await api.pricing.updatePricingSlabs(newSlabs);
      setPricingSlabs(response.slabs);
      toast({
        title: "Success",
        description: "Pricing slabs updated successfully"
      });
    } catch (error) {
      console.error('Error updating slabs:', error);
      toast({
        title: "Error",
        description: "Failed to update pricing slabs",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-cyan-400" />
                ECQ Nexus
              </h1>
              <p className="text-slate-400 mt-1">Real-time energy consumption tracking</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Current Readings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Voltage"
            value={currentReading?.voltage || 0}
            unit="V"
            icon={Zap}
            color="cyan"
          />
          <MetricCard
            title="Current"
            value={currentReading?.current || 0}
            unit="A"
            icon={Activity}
            color="orange"
          />
          <MetricCard
            title="Power"
            value={currentReading?.power || 0}
            unit="kW"
            icon={Gauge}
            color="purple"
          />
          <MetricCard
            title="Cost/Hour"
            value={realtimeCost}
            unit="₹"
            icon={DollarSign}
            color="green"
            prefix="₹"
          />
        </div>

        {/* Pricing Slabs Configuration */}
        <PricingSlabsConfig 
          slabs={pricingSlabs} 
          onUpdate={handleSlabsUpdate}
        />

        {/* Energy Summary */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              24-Hour Energy Summary
            </CardTitle>
            <CardDescription className="text-slate-400">
              Total consumption and cost breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg">
                <div className="text-sm text-slate-400 mb-2">Total Energy Consumed</div>
                <div className="text-4xl font-bold text-white mb-1">{totalEnergy.toFixed(4)}</div>
                <div className="text-sm text-cyan-400">kWh (Units)</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg">
                <div className="text-sm text-slate-400 mb-2">Total Cost</div>
                <div className="text-4xl font-bold text-white mb-1">₹{totalCost.toFixed(2)}</div>
                <div className="text-sm text-green-400">Indian Rupees</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Chart */}
        <RealtimeChart data={historicalData.slice(-20)} />

        {/* Historical Charts */}
        <HistoricalChart data={historicalData} />

        {/* Cost Calculator */}
        <CostCalculator pricingSlabs={pricingSlabs} />
      </div>
    </div>
  );
};

export default Dashboard;