"use client";

import React from "react";
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

  if (isEmpty) {
    return (
      <div className={styles.graphEmptyState}>
        <div className={styles.graphWidgetData}>
          <p>Ask the assistant to create a graph</p>
          <p>try: "create a line graph of monthly sales"</p>
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
      {type === 'bar' ? (
        <Bar 
          options={options as ChartOptions<'bar'>} 
          data={data as ChartData<'bar'>} 
        />
      ) : (
        <Line 
          options={options as ChartOptions<'line'>} 
          data={data as ChartData<'line'>} 
        />
      )}
    </div>
  );
};

export default GraphWidget; 