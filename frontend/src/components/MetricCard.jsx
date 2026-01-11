import React from 'react';
import { Card, CardContent } from './ui/card';

const MetricCard = ({ title, value, unit, icon: Icon, color, prefix = '' }) => {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30 text-green-400'
  };

  const iconColorClasses = {
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    green: 'text-green-400'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${color}-500/20`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-300">{title}</span>
          <Icon className={`w-5 h-5 ${iconColorClasses[color]}`} />
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-white tracking-tight">
            {prefix}{typeof value === 'number' ? value.toFixed(value < 1 ? 4 : 2) : value}
          </div>
          <div className={`text-sm font-medium ${iconColorClasses[color]}`}>
            {unit}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;