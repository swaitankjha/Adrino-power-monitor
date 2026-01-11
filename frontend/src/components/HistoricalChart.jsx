import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart3 } from 'lucide-react';

const HistoricalChart = ({ data }) => {

  // Always call hooks first!
  const hourlyData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const grouped = {};
    
    data.forEach(reading => {
      const date = new Date(reading.timestamp);
      const hourKey = `${date.getHours()}:00`;
      
      if (!grouped[hourKey]) {
        grouped[hourKey] = {
          hour: hourKey,
          voltages: [],
          currents: [],
          powers: []
        };
      }
      
      grouped[hourKey].voltages.push(reading.voltage);
      grouped[hourKey].currents.push(reading.current);
      grouped[hourKey].powers.push(reading.power);
    });

    // Calculate averages
    return Object.values(grouped).map(group => ({
      hour: group.hour,
      avgVoltage: group.voltages.reduce((a, b) => a + b, 0) / group.voltages.length,
      avgCurrent: group.currents.reduce((a, b) => a + b, 0) / group.currents.length,
      avgPower: group.powers.reduce((a, b) => a + b, 0) / group.powers.length
    })).slice(-12); // Last 12 hours
  }, [data]);

  // Now safe to check conditions (hook already called)
  if (!hourlyData || hourlyData.length === 0) {
    return null;
  }

  const maxPower = Math.max(...hourlyData.map(d => d.avgPower));

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Historical Data
        </CardTitle>
        <CardDescription className="text-slate-400">
          Average power consumption by hour (last 12 hours)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2">
            {hourlyData.map((item, index) => {
              const barHeight = (item.avgPower / maxPower) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative flex-1 w-full flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-cyan-500 hover:to-cyan-300 cursor-pointer"
                      style={{ height: `${barHeight}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.avgPower.toFixed(4)} kW
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{item.hour}</span>
                </div>
              );
            })}
          </div>

          {/* Data Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-sm font-medium text-slate-400 pb-3">Time</th>
                  <th className="text-right text-sm font-medium text-slate-400 pb-3">Avg Voltage</th>
                  <th className="text-right text-sm font-medium text-slate-400 pb-3">Avg Current</th>
                  <th className="text-right text-sm font-medium text-slate-400 pb-3">Avg Power</th>
                </tr>
              </thead>
              <tbody>
                {hourlyData.slice(-5).map((item, index) => (
                  <tr key={index} className="border-b border-slate-800/50">
                    <td className="py-3 text-sm text-slate-300">{item.hour}</td>
                    <td className="py-3 text-sm text-right text-cyan-400">{item.avgVoltage.toFixed(2)} V</td>
                    <td className="py-3 text-sm text-right text-orange-400">{item.avgCurrent.toFixed(3)} A</td>
                    <td className="py-3 text-sm text-right text-purple-400">{item.avgPower.toFixed(4)} kW</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default HistoricalChart;
