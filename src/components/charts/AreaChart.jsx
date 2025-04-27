import React from 'react';
import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '../../utils/dataProcessing';

const AreaChart = ({
  data,
  dataKey = 'value',
  xAxisDataKey = 'date',
  areaColor = '#0088FE',
  tooltipFormatter = (value) => formatCurrency(value),
  showLegend = true,
  legendName = 'Value',
  height = 300,
  className,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          {...props}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xAxisDataKey} />
          <YAxis />
          <Tooltip 
            formatter={tooltipFormatter}
            labelFormatter={(label) => `${label}`}
          />
          {showLegend && <Legend />}
          <defs>
            <linearGradient id={`color${areaColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={areaColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={areaColor} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={areaColor} 
            fillOpacity={1}
            fill={`url(#color${areaColor.replace('#', '')})`}
            name={legendName}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;