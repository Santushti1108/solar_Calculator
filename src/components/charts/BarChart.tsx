import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export type BarChartRef = {
  toBase64Image: () => string;
};

export const BarChart = forwardRef<BarChartRef, { data: object, options: object }>(
  function LineChart({ data, options }, ref) {
    const chartRef = useRef<ChartJS<"bar"> | null>(null);

    useImperativeHandle(ref, () => ({
      toBase64Image: () => {
        const image = chartRef.current?.toBase64Image() ?? "";
        return image;
      },
    }));

    return <Bar ref={chartRef} data={data as never} options={options as never}/>
  }
)
