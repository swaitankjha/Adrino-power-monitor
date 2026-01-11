import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendingUp } from 'lucide-react';

const RealtimeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Find min and max values for scaling
  const voltages = data.map(d => d.voltage);
  const currents = data.map(d => d.current);
  const powers = data.map(d => d.power);

  const maxVoltage = Math.max(...voltages);
  const minVoltage = Math.min(...voltages);
  const maxCurrent = Math.max(...currents);
  const minCurrent = Math.min(...currents);
  const maxPower = Math.max(...powers);
  const minPower = Math.min(...powers);

  const chartHeight = 200;
  const chartWidth = 100; // percentage

  // Generate SVG path
  const generatePath = (values, min, max) => {
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * chartWidth;
      const y = chartHeight - ((value - min) / (max - min)) * chartHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const voltagePath = generatePath(voltages, minVoltage, maxVoltage);
  const currentPath = generatePath(currents, minCurrent, maxCurrent);
  const powerPath = generatePath(powers, minPower, maxPower);

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Real-time Trends
        </CardTitle>
        <CardDescription className="text-slate-400">
          Last 20 readings (updated every 3 seconds)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voltage Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Voltage</span>
              <span className="text-xs text-slate-500">{minVoltage.toFixed(1)}V - {maxVoltage.toFixed(1)}V</span>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
                <path
                  d={voltagePath}
                  fill="none"
                  stroke="rgb(34, 211, 238)"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
            <div className="text-center text-lg font-bold text-cyan-400">
              {data[data.length - 1]?.voltage.toFixed(2)} V
            </div>
          </div>

          {/* Current Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Current</span>
              <span className="text-xs text-slate-500">{minCurrent.toFixed(2)}A - {maxCurrent.toFixed(2)}A</span>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
                <path
                  d={currentPath}
                  fill="none"
                  stroke="rgb(251, 146, 60)"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
            <div className="text-center text-lg font-bold text-orange-400">
              {data[data.length - 1]?.current.toFixed(3)} A
            </div>
          </div>

          {/* Power Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Power</span>
              <span className="text-xs text-slate-500">{minPower.toFixed(3)}kW - {maxPower.toFixed(3)}kW</span>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
                <path
                  d={powerPath}
                  fill="none"
                  stroke="rgb(168, 85, 247)"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
            <div className="text-center text-lg font-bold text-purple-400">
              {data[data.length - 1]?.power.toFixed(4)} kW
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeChart;