"use client";

import React, { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import styles from "./graph-widget.module.css";
import { ChartType } from '../utils/graph';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GraphWidgetProps {
  data?: ChartData<ChartType>;
  type?: ChartType;
  title?: string;
  isEmpty?: boolean;
}

const GraphWidget = ({
  data,
  type = "line",
  title = "Graph",
  isEmpty = false,
}: GraphWidgetProps) => {
  const lineChartRef = useRef<ChartJS<"line">>(null);
  const barChartRef = useRef<ChartJS<"bar">>(null);

  const options: ChartOptions<ChartType> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  const handleDownload = () => {
    const currentChart = type === 'bar' ? barChartRef.current : lineChartRef.current;
    if (currentChart) {
      // Get base64 image data
      const base64Image = currentChart.toBase64Image();
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = base64Image;
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isEmpty) {
    return (
      <div className={styles.graphEmptyState}>
        <div className={styles.graphWidgetData}>
          <h2>Graph Widget</h2>
          <p>give some data to the assistant</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.graphWidget}>
        <div>No data available</div>
      </div>
    );
  }

  return (
    <div className={styles.graphWidget}>
      <div className={styles.graphContainer}>
        {type === 'bar' ? (
          <Bar 
            ref={barChartRef}
            options={options as ChartOptions<'bar'>} 
            data={data as ChartData<'bar'>} 
          />
        ) : (
          <Line 
            ref={lineChartRef}
            options={options as ChartOptions<'line'>} 
            data={data as ChartData<'line'>} 
          />
        )}
      </div>
      <button onClick={handleDownload} className={styles.downloadButton}>
        Download Chart
      </button>
    </div>
  );
};

export default GraphWidget; 