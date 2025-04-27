
import React from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '../../utils/dataProcessing';

const LineChart = ({
  data,
  dataKey = 'value',
  xAxisDataKey = 'date',
  lineColor = '#0088FE',
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
        <RechartsLineChart
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
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={lineColor} 
            activeDot={{ r: 8 }}
            name={legendName}
            strokeWidth={2}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;