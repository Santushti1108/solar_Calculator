import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export function PieChart({ data, options }: { data: object; options: object }) {
  return <Pie data={data as never} options={options as never} />;
}
