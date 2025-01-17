import { ChartData } from 'chart.js';

export type ChartType = 'line' | 'bar';

interface Dataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
}

interface GraphInput {
  type?: ChartType;
  title?: string;
  labels?: string[];
  datasets?: Dataset[];
}

interface GraphOutput {
  type: ChartType;
  title: string;
  data: ChartData<ChartType>;
}

const createGraph = (data: GraphInput): GraphOutput => {
  // Validate and process the data
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Format data for Chart.js
  const chartData = {
    labels: data.labels || [],
    datasets: (data.datasets || []).map(dataset => ({
      label: dataset.label || '',
      data: dataset.data || [],
      borderColor: dataset.borderColor || 'rgb(75, 192, 192)',
      backgroundColor: dataset.backgroundColor || 'rgba(75, 192, 192, 0.5)',
    }))
  };

  return {
    data: chartData,
    type: data.type || 'line',
    title: data.title || 'Graph',
  } as GraphOutput;
};

export { createGraph }; 