import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calculator } from 'lucide-react';
import api from '../api';

const CostCalculator = ({ pricingSlabs }) => {
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  const calculateCost = async (range) => {
    setCalculating(true);
    setTimeRange(range);
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch(range) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '6h':
        startDate.setHours(startDate.getHours() - 6);
        break;
      case '12h':
        startDate.setHours(startDate.getHours() - 12);
        break;
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      default:
        startDate.setHours(startDate.getHours() - 24);
    }
    
    try {
      const costData = await api.cost.calculateCost(startDate, endDate);
      setResult(costData);
    } catch (error) {
      console.error('Error calculating cost:', error);
    } finally {
      setCalculating(false);
    }
  };

  const timeRanges = [
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '12h', label: '12 Hours' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' }
  ];

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-cyan-400" />
          Cost Calculator
        </CardTitle>
        <CardDescription className="text-slate-400">
          Calculate energy consumption and cost for different time periods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Time Range Buttons */}
          <div className="flex flex-wrap gap-3">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                onClick={() => calculateCost(range.value)}
                disabled={calculating}
                variant={timeRange === range.value ? 'default' : 'outline'}
                className={`
                  ${timeRange === range.value 
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                  transition-all duration-200
                `}
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Total Energy</div>
                  <div className="text-2xl font-bold text-cyan-400">{result.totalEnergy.toFixed(4)}</div>
                  <div className="text-sm text-cyan-400/70 mt-1">kWh (Units)</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Total Cost</div>
                  <div className="text-2xl font-bold text-green-400">₹{result.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-green-400/70 mt-1">{result.readingsCount} readings</div>
                </div>
              </div>

              {/* Slab Breakdown */}
              {result.slabBreakdown && result.slabBreakdown.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-slate-300 mb-3">Cost Breakdown by Slab:</div>
                  <div className="space-y-2">
                    {result.slabBreakdown.map((slab, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-400">{slab.range} units</span>
                          <span className="text-sm text-cyan-400">{slab.units.toFixed(4)} kWh</span>
                          <span className="text-sm text-orange-400">@ ₹{slab.pricePerUnit}/unit</span>
                        </div>
                        <span className="text-sm font-semibold text-green-400">₹{slab.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {calculating && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <span className="ml-3 text-slate-400">Calculating...</span>
            </div>
          )}

          {!result && !calculating && (
            <div className="text-center py-8 text-slate-500">
              Select a time range to calculate energy consumption and cost
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CostCalculator;