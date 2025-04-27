
import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '../../utils/dataProcessing';

const BarChart = ({
  data,
  dataKey = 'value',
  xAxisDataKey = 'name',
  barColor = '#0088FE',
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
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barSize={30}
          {...props}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xAxisDataKey} />
          <YAxis />
          <Tooltip 
            formatter={tooltipFormatter}
            labelFormatter={(label) => `${label}`}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          {showLegend && <Legend />}
          <Bar 
            dataKey={dataKey} 
            fill={barColor}
            name={legendName}
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
