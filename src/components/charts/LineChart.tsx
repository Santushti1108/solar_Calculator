import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

export type LineChartRef = {
  toBase64Image: () => string;
};


export const LineChart = forwardRef<LineChartRef, { data: object, options: object }>(
  function LineChart({ data, options }, ref) {
    const chartRef = useRef<ChartJS<"line"> | null>(null);

    useImperativeHandle(ref, () => ({
      toBase64Image: () => {
        const image = chartRef.current?.toBase64Image() ?? "";
        return image;
      },
    }));

    return <Line ref={chartRef} data={data as never} options={options as never}/>
  }
)
